import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { errorStatus, eventTeamQueryKey } from "@/features/events/teams";
import { youtubeVideoId } from "@/features/product+/2026/submission/submission";
import {
  AngledPanel,
  CompanyPitch,
  StatusBanner,
  type Notice,
  teamPanelClass,
  teamPrimaryButton,
  teamSecondaryButton,
} from "./BtxUI";
import { TeamManagement, type TeamManagementProps } from "./TeamManagement";
import {
  companyProfileKey,
  getCompanyProfile,
  profileErrorMessage,
  profileFields,
  profileIsComplete,
  profileLimits,
  profileRequiresSignIn,
  profileValues,
  saveCompanyProfile,
  startCompanySeeding,
  validateProfile,
  type CompanyProfile,
  type CompanyProfileFields,
  type ProfileErrors,
} from "./companyProfile";
import { exchangePath, windowState } from "./market";
import { market, type Market, type Company } from "./seedApi";
import {
  KICKSTART_EVENT_ID,
  KICKSTART_EVENT_KEY,
  KICKSTART_YEAR,
} from "./teamRules";

const fieldClass =
  "h-[46px] rounded-xl border-[#324a68] bg-[#080f1b] px-4 text-base text-[#e6ebf6] placeholder:text-[#98a9c8] focus-visible:ring-[#1fbef9] focus-visible:ring-offset-[#0b1120] aria-[invalid=true]:border-[#ff5c7a] md:text-[14px]";
const emptyProfile: CompanyProfileFields = {
  companyName: "",
  blurb: "",
  youtubeURL: "",
  twitterURL: "",
};
const labels: Record<keyof CompanyProfileFields, string> = {
  companyName: "Company name",
  blurb: "Company blurb",
  youtubeURL: "YouTube pitch video",
  twitterURL: "Twitter/X link (optional)",
};
const hints: Record<keyof CompanyProfileFields, string> = {
  companyName:
    "Your company name locks when seeding or IPO preparation starts.",
  blurb:
    "Tell investors what your company does. You can leave this blank in a draft.",
  youtubeURL:
    "Aim for a 60-second pitch. Use a public or unlisted video; duration and visibility aren’t automatically verified.",
  twitterURL:
    "An HTTPS Twitter/X link. Leave this blank if you don’t have one.",
};

export function CompanyWorkspace(props: TeamManagementProps) {
  // Use the linked ID returned by the team API; do not construct a second company.
  if (!props.team.projectId)
    return (
      <>
        <StatusBanner
          tone="warning"
          title="This team’s company is unavailable"
          description="Reload your team or contact an organizer. Don’t create another company."
          onRetry={props.onRefresh}
        />
        <TeamManagement {...props} />
      </>
    );
  return (
    <CompanyEditor
      key={props.team.projectId}
      {...props}
      projectId={props.team.projectId}
    />
  );
}

function CompanyEditor(props: TeamManagementProps & { projectId: string }) {
  const { projectId, email, removed } = props;
  const queryClient = useQueryClient();
  const queryKey = companyProfileKey(projectId, email);
  const [action, setAction] = useState<"save" | "seed" | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const profile = useQuery({
    queryKey,
    queryFn: readProfile,
    enabled: action === null,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 15000,
  });
  const snapshot = useQuery({
    queryKey: ["btx", "snapshot"],
    queryFn: market,
    retry: false,
    staleTime: 0,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });
  // Keep a saved baseline for discard/change detection and a draft for input.
  const [form, setForm] = useState<{
    saved: CompanyProfileFields;
    draft: CompanyProfileFields;
  } | null>(null);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [notice, setNotice] = useState<Notice>();
  const [seedConfirmation, setSeedConfirmation] = useState(false);
  const [clock, setClock] = useState(Date.now());
  const writeInFlight = useRef(false);
  const expiryRefreshed = useRef(false);
  // Let profile refreshes inspect current edits without rerunning on each edit.
  const currentForm = useRef(form);
  currentForm.current = form;
  const refetchProfile = profile.refetch;
  const refetchSnapshot = snapshot.refetch;

  useEffect(() => {
    if (!profile.data) return;
    const saved = profileValues(profile.data);
    const previous = currentForm.current;
    if (
      previous &&
      !profile.data.canEditName &&
      previous.draft.companyName.trim() !== previous.saved.companyName
    ) {
      setNotice({
        tone: "warning",
        title: "Company name editing access changed",
        description:
          "We restored the saved company name because it can no longer be edited. Your other draft changes are still here.",
      });
    }
    setForm((previous) => {
      if (!previous) return { saved, draft: saved };
      const draft = { ...previous.draft };
      // Background reads update untouched fields without destroying unsaved work.
      for (const field of profileFields) {
        if (
          draft[field].trim() === previous.saved[field] ||
          (field === "companyName" && !profile.data.canEditName)
        )
          draft[field] = saved[field];
      }
      return { saved, draft };
    });
  }, [profile.data]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const serverNow = snapshot.data
    ? snapshot.data.serverTime + Math.max(0, clock - snapshot.dataUpdatedAt)
    : clock;
  const closed =
    typeof profile.data?.eventEndsAt === "number" &&
    serverNow >= profile.data.eventEndsAt;
  const draft = form?.draft ?? emptyProfile;
  const saved = form?.saved ?? emptyProfile;
  const values = profileValues(draft);
  const dirty =
    !!form && profileFields.some((field) => values[field] !== saved[field]);
  const complete = !!form && profileIsComplete(saved);
  const canEdit =
    !!profile.data?.canEdit &&
    !profile.isError &&
    !removed &&
    !sessionExpired &&
    !closed;
  const canEditName = canEdit && !!profile.data?.canEditName;
  const busy = props.busy || action !== null;
  const company =
    snapshot.data?.eventId === KICKSTART_EVENT_KEY
      ? snapshot.data.projects.find((p) => p.projectId === projectId)
      : undefined;
  const seedState = company ? windowState(company, serverNow) : undefined;
  const marketKnown =
    snapshot.isSuccess &&
    snapshot.data.eventId === KICKSTART_EVENT_KEY &&
    !!company;
  const preIpo =
    marketKnown &&
    snapshot.data?.phase === "SEED" &&
    snapshot.data.ipoAt === null;
  const canStart =
    canEditName &&
    complete &&
    !dirty &&
    !busy &&
    preIpo &&
    company?.seedStartedAt === null &&
    seedState === "NOT_STARTED";

  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!canStart && action !== "seed") setSeedConfirmation(false);
  }, [canStart, action]);

  useEffect(() => {
    // Manual refetches bypass enabled, so defer expiry reads during a write too.
    if (action !== null || !closed || expiryRefreshed.current) return;
    expiryRefreshed.current = true;
    void refetchProfile();
    void refetchSnapshot();
  }, [action, closed, refetchProfile, refetchSnapshot]);

  async function readProfile() {
    const latest = await getCompanyProfile(projectId);
    setSessionExpired(false);
    return latest;
  }

  async function refreshProfile() {
    // Writes have settled before this read. Discard any overlapping request so
    // fetchQuery cannot reuse a response that predates the write.
    await queryClient.cancelQueries({ queryKey, exact: true });
    return queryClient.fetchQuery({
      queryKey,
      queryFn: readProfile,
      staleTime: 0,
    });
  }

  function refreshMembership() {
    void queryClient.invalidateQueries({
      queryKey: eventTeamQueryKey(KICKSTART_EVENT_ID, KICKSTART_YEAR, email),
    });
    props.onRefresh();
  }

  function reportWriteError(error: unknown, title: string) {
    const status = errorStatus(error);
    if (profileRequiresSignIn(error)) setSessionExpired(true);
    if (status === 403 || status === 409) refreshMembership();
    setNotice({
      tone: "error",
      title,
      description: profileErrorMessage(
        error,
        "We couldn’t confirm the result. Your changes are still here. Reload the saved profile before trying again.",
      ),
    });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (writeInFlight.current || busy || !canEdit || !form) return;
    const submitted = {
      ...values,
      companyName: canEditName ? values.companyName : saved.companyName,
    };
    const validation = validateProfile(submitted);
    // Drafts may be partial. A company that has started seeding, or a complete
    // profile locked by IPO, must stay complete. Backend validation is final.
    const mustStayComplete =
      typeof company?.seedStartedAt === "number" ||
      company?.seedSharesAtIpo != null ||
      (!profile.data?.canEditName && complete);
    if (mustStayComplete) {
      if (!submitted.blurb)
        validation.blurb =
          "Keep a company blurb after seeding or IPO has locked the completed profile.";
      if (!submitted.youtubeURL)
        validation.youtubeURL =
          "Keep a valid YouTube pitch after seeding or IPO has locked the completed profile.";
    }
    setErrors(validation);
    if (Object.values(validation).some(Boolean)) {
      document
        .getElementById(
          `profile-${profileFields.find((field) => validation[field])}`,
        )
        ?.focus();
      return;
    }
    const patch: Partial<CompanyProfileFields> = {};
    for (const field of profileFields)
      if (
        submitted[field] !== saved[field] &&
        (field !== "companyName" || canEditName)
      )
        patch[field] = submitted[field];
    if (!Object.keys(patch).length) return;
    writeInFlight.current = true;
    setAction("save");
    setNotice(undefined);
    await queryClient.cancelQueries({ queryKey });
    try {
      await saveCompanyProfile(projectId, patch);
      setForm({ saved: submitted, draft: submitted });
      queryClient.setQueryData<CompanyProfile>(queryKey, (current) =>
        current ? { ...current, ...patch } : current,
      );
      void queryClient.invalidateQueries({ queryKey: ["btx", "snapshot"] });
      try {
        await refreshProfile();
        setNotice({ tone: "success", title: "Company profile saved" });
      } catch {
        setNotice({
          tone: "warning",
          title: "Saved, but couldn’t reload the profile",
          description:
            "Your save succeeded. Reload the profile to check the latest permissions.",
        });
      }
    } catch (error) {
      reportWriteError(error, "Couldn’t save the company profile");
      // A timeout can occur after a successful write. Read once, never replay PATCH.
      try {
        const latest = await refreshProfile();
        if (
          (!errorStatus(error) || errorStatus(error)! >= 500) &&
          Object.entries(patch).every(
            ([key, value]) =>
              latest[key as keyof CompanyProfileFields] === value,
          )
        ) {
          setForm({
            saved: profileValues(latest),
            draft: profileValues(latest),
          });
          setNotice({
            tone: "success",
            title: "Company profile saved",
            description:
              "We checked the saved profile after the connection was interrupted.",
          });
          void queryClient.invalidateQueries({ queryKey: ["btx", "snapshot"] });
        }
      } catch {
        /* Keep the draft and the original error available for retry. */
      }
    } finally {
      writeInFlight.current = false;
      setAction(null);
    }
  }

  async function startSeeding() {
    if (writeInFlight.current || !canStart) return;
    writeInFlight.current = true;
    setAction("seed");
    setNotice(undefined);
    await queryClient.cancelQueries({ queryKey: ["btx", "snapshot"] });
    try {
      const window = await startCompanySeeding(projectId);
      queryClient.setQueryData<Market>(["btx", "snapshot"], (current) =>
        current
          ? {
              ...current,
              serverTime: window.serverTime,
              ipoAt: window.ipoAt,
              projects: current.projects.map((p) =>
                p.projectId === projectId
                  ? {
                      ...p,
                      seedStartedAt: window.seedStartedAt,
                      seedEndsAt: window.seedEndsAt,
                      seedStatus: window.seedStatus,
                    }
                  : p,
              ),
            }
          : current,
      );
      // The successful start permanently locks the name, even if the reload fails.
      queryClient.setQueryData<CompanyProfile>(queryKey, (current) =>
        current ? { ...current, canEditName: false } : current,
      );
      setNotice({
        tone: "success",
        title: "Your seed round has started",
        description:
          "Investors can buy until IPO or the event cutoff. Your company name and team membership are now locked.",
      });
      await Promise.allSettled([refreshProfile(), snapshot.refetch()]);
      refreshMembership();
    } catch (error) {
      reportWriteError(error, "Couldn’t confirm seeding");
      const result = await snapshot.refetch();
      const latest =
        result.isSuccess && result.data.eventId === KICKSTART_EVENT_KEY
          ? result.data.projects.find((p) => p.projectId === projectId)
          : undefined;
      if (
        typeof latest?.seedStartedAt === "number" &&
        Number.isFinite(latest.seedStartedAt)
      ) {
        setNotice({
          tone: "info",
          title: "Your seed round has already started",
        });
      }
      await refreshProfile().catch(() => undefined);
      refreshMembership();
    } finally {
      setSeedConfirmation(false);
      writeInFlight.current = false;
      setAction(null);
    }
  }

  const profileProblem = profileRequiresSignIn(profile.error) || sessionExpired;
  const hasListing = !!company;
  const title = saved.companyName || props.team.team_name;
  const previewId = youtubeVideoId(draft.youtubeURL);
  const preview: Company = {
    ...company,
    projectId,
    companyName: draft.companyName.trim() || "Your company",
    blurb: draft.blurb,
    youtubeURL: previewId ? `https://www.youtube.com/watch?v=${previewId}` : "",
    seedStatus: company?.seedStatus ?? "NOT_STARTED",
    currentPriceCents: company?.currentPriceCents ?? 0,
    marketCapCents: company?.marketCapCents ?? 0,
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-4 md:space-y-5">
      <header className="flex items-center justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h1 className="text-[30px] font-medium md:text-[12px] md:text-[#1fbef9]">
            My company
          </h1>
          <div className="hidden flex-wrap items-center gap-3 md:flex">
            <h2 className="break-words text-[40px] font-medium leading-tight">
              {title}
            </h2>
            {company?.ticker && (
              <span className="text-sm text-[#1fbef9]">${company.ticker}</span>
            )}
            <ProfileBadge complete={complete} />
          </div>
        </div>
        <Button
          asChild
          className={`${teamSecondaryButton} hidden md:inline-flex`}
        >
          <Link href={exchangePath + "/catalog"}>View in catalog</Link>
        </Button>
        <span
          title={email}
          aria-label={`Signed in as ${email}`}
          className="grid size-9 shrink-0 place-items-center rounded-full border border-[#527096] bg-[#172c3c] text-[12px] text-[#82c3fb] md:hidden"
        >
          {email[0].toUpperCase()}
        </span>
      </header>
      <section
        className="space-y-3 rounded-2xl border border-[#263850] bg-[#101a2b] p-4 md:hidden"
        aria-label="Company summary"
      >
        <h2 className="break-words text-[20px] font-medium">
          {title}{" "}
          <span className="text-xs text-[#98a9c8]">
            {company?.ticker ? "$" + company.ticker : ""}
          </span>
        </h2>
        <ProfileBadge complete={complete} />
        <Button asChild className={`${teamSecondaryButton} w-full`}>
          <Link href={exchangePath + "/catalog"}>View in catalog</Link>
        </Button>
      </section>
      {props.created && (
        <StatusBanner
          tone="success"
          title="Company team created"
          description="Share your team code, then add a blurb and YouTube pitch. You can save a draft before you’re ready to seed."
        />
      )}
      <ol
        aria-label="Company setup progress"
        className="grid gap-4 rounded-2xl border border-[#263850] bg-[#101a2b]/75 p-4 md:grid-cols-4 md:gap-3"
      >
        {[
          {
            label: "Team formed",
            detail: removed
              ? "Membership changed"
              : `${props.team.members.length} ${props.team.members.length === 1 ? "member" : "members"}`,
            done: !removed,
          },
          {
            label: "Blurb + YouTube pitch",
            detail: complete ? "Saved" : "Complete your saved profile",
            done: complete,
          },
          {
            label: "Company in catalog",
            detail: marketKnown ? "Company available" : "Checking availability",
            done: hasListing && marketKnown,
          },
          {
            label: "Seed round",
            detail:
              seedState === "ACTIVE"
                ? "Seeding now"
                : seedState === "ENDED"
                  ? "Window ended"
                  : seedState === "LIVE"
                    ? "IPO live"
                    : "Start when you’re ready",
            done:
              typeof company?.seedStartedAt === "number" ||
              seedState === "LIVE",
          },
        ].map((step, index) => (
          <li key={step.label} className="flex min-w-0 items-start gap-3">
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full border text-xs ${step.done ? "border-[#38d3a2]/60 bg-[#38d3a2]/10 text-[#38d3a2]" : "border-[#527096] text-[#98a9c8]"}`}
            >
              {step.done ? <Check size={14} aria-hidden="true" /> : index + 1}
            </span>
            <div>
              <p className="text-[13px]">{step.label}</p>
              <p className="text-[12px] text-[#98a9c8]">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      {notice && <StatusBanner {...notice} />}
      {profile.isPending && (
        <StatusBanner tone="info" title="Loading your company profile…" />
      )}
      {profile.isError && (
        <StatusBanner
          tone="error"
          title={
            errorStatus(profile.error) === 404
              ? "Company profile not found"
              : "Couldn’t load the company profile"
          }
          description={profileErrorMessage(
            profile.error,
            "Your unsaved changes are still here. Try loading the profile again.",
          )}
          onRetry={action === null ? () => void profile.refetch() : undefined}
        />
      )}
      {profileProblem && (
        <Button asChild className={teamPrimaryButton}>
          <Link
            href={`/login?redirect=${encodeURIComponent(exchangePath + "/my-company")}`}
          >
            Sign in again
          </Link>
        </Button>
      )}
      {profile.data && !canEdit && !profile.isError && !removed && (
        <StatusBanner
          tone="warning"
          title={
            closed
              ? "Company profile editing has closed"
              : "Company profile is read-only"
          }
          description={
            closed
              ? "The event editing deadline has passed."
              : "The backend hasn’t granted editing access. Current team membership and an available company state are required. Contact an organizer if this is unexpected."
          }
          onRetry={action === null ? () => void profile.refetch() : undefined}
        />
      )}
      {profile.data && (
        <SeedRound
          company={company}
          snapshot={snapshot.data}
          now={serverNow}
          unavailable={!marketKnown}
          complete={complete}
          dirty={dirty}
          canStart={canStart}
          closed={closed}
          removed={removed}
          busy={busy}
          onRetry={() => void snapshot.refetch()}
          onConfirm={() => setSeedConfirmation(true)}
        />
      )}
      <div className="grid items-start gap-4 md:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] md:gap-7">
        <section
          className="min-w-0 rounded-2xl border border-[#263850] bg-[#101a2b] p-4 md:rounded-none md:border-0 md:bg-transparent md:p-4"
          aria-labelledby="company-profile-heading"
        >
          <form
            className="space-y-4"
            onSubmit={(event) => void save(event)}
            noValidate
            aria-busy={action === "save"}
          >
            <h2
              id="company-profile-heading"
              className="text-[16px] font-medium md:text-[12px] md:text-[#1fbef9]"
            >
              Company profile
            </h2>
            {profileFields.map((field) => {
              const id = `profile-${field}`;
              const locked =
                field === "companyName" && !!profile.data && !canEditName;
              const inputProps = {
                id,
                value: draft[field],
                disabled: busy || !form,
                readOnly: !canEdit || locked,
                "aria-invalid": !!errors[field],
                "aria-describedby": `${id}-hint ${id}-count${errors[field] ? ` ${id}-error` : ""}`,
                className: fieldClass,
                onChange: (
                  event: React.ChangeEvent<
                    HTMLInputElement | HTMLTextAreaElement
                  >,
                ) => {
                  const value = event.target.value;
                  setForm((current) =>
                    current
                      ? {
                          ...current,
                          draft: { ...current.draft, [field]: value },
                        }
                      : current,
                  );
                  setErrors((current) => ({ ...current, [field]: undefined }));
                },
              };
              return (
                <div key={field} className="space-y-1.5">
                  <div className="flex items-end justify-between gap-3">
                    <label htmlFor={id} className="text-[12px] text-[#b5c1da]">
                      {labels[field]}
                      {field === "companyName" ? " *" : ""}
                      {locked ? " (locked)" : ""}
                    </label>
                    <span
                      id={`${id}-count`}
                      className={`shrink-0 text-[11px] tabular-nums ${draft[field].trim().length > profileLimits[field] ? "text-[#ff879a]" : "text-[#98a9c8]"}`}
                    >
                      {draft[field].trim().length.toLocaleString()}/
                      {profileLimits[field].toLocaleString()}
                    </span>
                  </div>
                  {field === "blurb" ? (
                    <Textarea
                      {...inputProps}
                      rows={4}
                      className={`${fieldClass} h-auto min-h-[112px] py-3`}
                    />
                  ) : (
                    <Input
                      {...inputProps}
                      type="text"
                      inputMode={field.endsWith("URL") ? "url" : "text"}
                      autoComplete="off"
                      placeholder={
                        field === "youtubeURL"
                          ? "https://youtu.be/…"
                          : field === "twitterURL"
                            ? "https://x.com/…"
                            : "e.g. Plantry"
                      }
                    />
                  )}
                  <p
                    id={`${id}-hint`}
                    className="text-[12px] leading-5 text-[#98a9c8]"
                  >
                    {hints[field]}
                  </p>
                  {errors[field] && (
                    <p
                      id={`${id}-error`}
                      role="alert"
                      className="text-[13px] text-[#ff879a]"
                    >
                      {errors[field]}
                    </p>
                  )}
                </div>
              );
            })}
            {profile.data?.eventEndsAt != null && (
              <p className="text-[12px] text-[#98a9c8]">
                Profile editing ends{" "}
                {new Date(profile.data.eventEndsAt).toLocaleString()} (your
                local time).
              </p>
            )}
            <div className="flex flex-col gap-3 border-t border-[#263850] pt-4 md:flex-row md:items-center md:justify-end">
              <p
                role="status"
                className="text-[12px] text-[#98a9c8] md:mr-auto"
              >
                {dirty
                  ? "Unsaved changes"
                  : form
                    ? "Showing saved profile"
                    : profile.isError
                      ? "Saved profile unavailable"
                      : "Loading profile…"}
              </p>
              <Button
                type="submit"
                className={`${teamPrimaryButton} order-1 md:order-3`}
                disabled={busy || !canEdit || !dirty}
              >
                {action === "save"
                  ? "Saving…"
                  : complete
                    ? "Save changes"
                    : "Save draft"}
              </Button>
              <Button
                type="button"
                className={`${teamSecondaryButton} order-2`}
                disabled={busy || !dirty}
                onClick={() => {
                  setForm((current) =>
                    current
                      ? { ...current, draft: { ...current.saved } }
                      : current,
                  );
                  setErrors({});
                  setNotice(undefined);
                }}
              >
                Discard changes
              </Button>
            </div>
          </form>
        </section>
        <aside className="min-w-0 space-y-4">
          <AngledPanel className={teamPanelClass}>
            <div className="space-y-3">
              <h2 className="text-[12px] text-[#1fbef9]">
                {dirty ? "Preview · unsaved changes" : "Company preview"}
              </h2>
              <div className="overflow-hidden rounded-xl border border-[#263850] bg-[#080f1b]">
                <CompanyPitch company={preview} />
                <div className="space-y-2 p-3">
                  <p className="break-words text-[18px] font-medium">
                    {preview.companyName}
                  </p>
                  <p className="whitespace-pre-wrap break-words text-[13px] text-[#b5c1da]">
                    {draft.blurb || "Your company blurb will appear here."}
                  </p>
                </div>
              </div>
              <p className="text-[12px] text-[#98a9c8]">
                Save changes to update your company. Video playback doesn’t
                verify its visibility or length.
              </p>
            </div>
          </AngledPanel>
          <TeamManagement {...props} companyName={title} busy={busy} embedded />
        </aside>
      </div>
      <AlertDialog
        open={seedConfirmation}
        onOpenChange={(open) => {
          if (action !== "seed") setSeedConfirmation(open);
        }}
      >
        <AlertDialogContent className="w-[calc(100vw-32px)] max-w-[520px] rounded-2xl border-[#324a68] bg-[#101a2b] text-[#e6ebf6] sm:rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[24px]">
              Start your seed round?
            </AlertDialogTitle>
            <AlertDialogDescription
              className="space-y-3 text-[14px] leading-6 text-[#b5c1da]"
              asChild
            >
              <div>
                <p>
                  Investors can buy at the seed price until IPO preparation or
                  the event cutoff.
                </p>
                <p>
                  Your company name and team membership will lock permanently.
                  Other valid profile edits remain available until the event
                  deadline.
                </p>
                <p>Starting uses your saved profile.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:space-x-0">
            <AlertDialogCancel
              className={teamSecondaryButton}
              disabled={action === "seed"}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={teamPrimaryButton}
              disabled={!canStart || action === "seed"}
              onClick={(event) => {
                event.preventDefault();
                void startSeeding();
              }}
            >
              {action === "seed" ? "Starting…" : "Start seeding"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProfileBadge({ complete }: { complete: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] ${complete ? "border-[#38d3a2]/40 bg-[#38d3a2]/10 text-[#38d3a2]" : "border-[#527096] bg-[#172c3c] text-[#98a9c8]"}`}
    >
      {complete ? "Profile ready" : "Draft profile"}
    </span>
  );
}

function SeedRound({
  company,
  snapshot,
  now,
  unavailable,
  complete,
  dirty,
  canStart,
  closed,
  removed,
  busy,
  onRetry,
  onConfirm,
}: {
  company?: Company;
  snapshot?: Market;
  now: number;
  unavailable: boolean;
  complete: boolean;
  dirty: boolean;
  canStart: boolean;
  closed: boolean;
  removed: boolean;
  busy: boolean;
  onRetry: () => void;
  onConfirm: () => void;
}) {
  const state = company && windowState(company, now);
  const globalIpo =
    snapshot && (snapshot.phase !== "SEED" || snapshot.ipoAt !== null);
  let title = "Start your seed round";
  let description = "Open seed funding when your company is ready.";
  if (unavailable) {
    title = "Seed status unavailable";
    description = "Reload market status before starting seeding.";
  } else if (closed) {
    title = "The event has ended";
    description = "Seed funding is closed.";
  } else if (snapshot?.phase === "LIVE") {
    title = "Global IPO is live";
    description =
      "Seeding has closed. Company name and team membership remain locked.";
  } else if (globalIpo) {
    title = "Global IPO preparation has started";
    description =
      "Seeding has closed. Company name and team membership remain locked.";
  } else if (state === "ACTIVE") {
    title = "Seeding is open";
    description =
      "Investors can buy until IPO preparation or the event cutoff.";
  } else if (state === "ENDED") {
    title = "Seed funding is closed";
    description = "Your company name and team membership remain locked.";
  } else if (dirty)
    description =
      "Save or discard your changes before starting seeding. Starting never saves your draft automatically.";
  else if (!complete)
    description =
      "Save a company name, blurb, and valid YouTube pitch before starting seeding. Draft saves can leave the blurb or video blank.";
  else if (removed)
    description = "Only current team members can start seeding.";
  return (
    <section
      className="flex flex-col gap-4 rounded-2xl border border-[#1fbef9]/40 bg-[#101a2b]/75 p-4 md:flex-row md:items-center md:justify-between md:p-5"
      aria-label="Seed round"
    >
      <div className="min-w-0 space-y-1">
        <p className="text-[12px] text-[#1fbef9]">Seed round</p>
        <h2 className="text-[20px] font-medium tabular-nums">{title}</h2>
        <p className="max-w-3xl text-[13px] leading-5 text-[#b5c1da]">
          {description}
        </p>
        {typeof company?.seedStartedAt === "number" && (
          <p className="text-[12px] text-[#98a9c8]">
            Started {new Date(company.seedStartedAt).toLocaleString()}.
          </p>
        )}
      </div>
      {unavailable ? (
        <Button
          className={teamSecondaryButton}
          onClick={onRetry}
          disabled={busy}
        >
          Reload status
        </Button>
      ) : (
        state === "NOT_STARTED" &&
        !globalIpo &&
        !closed && (
          <Button
            className={`${teamPrimaryButton} shrink-0`}
            disabled={!canStart}
            onClick={onConfirm}
          >
            Start seeding
          </Button>
        )
      )}
    </section>
  );
}
