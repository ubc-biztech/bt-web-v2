import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { errorStatus, eventTeamQueryKey } from "@/features/events/teams";
import { youtubeVideoId } from "@/features/product+/2026/submission/submission";
import {
  AngledPanel,
  CompanyPhoto,
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
  maxThumbnailBytes,
  profileErrorMessage,
  profileFields,
  profileIsComplete,
  profileLimits,
  profileRequiresSignIn,
  profileTextFields,
  profileValues,
  saveCompanyProfile,
  thumbnailTypes,
  uploadCompanyThumbnail,
  validateProfile,
  type CompanyProfile,
  type CompanyProfileFields,
  type ProfileErrors,
} from "./companyProfile";
import { exchangePath, listingState, marketStage } from "./market";
import { market, type Company } from "./seedApi";
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
  demoURL: "",
  logo: "",
};
type ProfileTextField = (typeof profileTextFields)[number];
const labels: Record<ProfileTextField, string> = {
  companyName: "Company name",
  blurb: "Company blurb",
  youtubeURL: "YouTube pitch video",
  twitterURL: "Twitter/X link (optional)",
  demoURL: "Live demo link (optional)",
};
const hints: Record<ProfileTextField, string> = {
  companyName:
    "Your company name locks when it receives funding or IPO preparation starts.",
  blurb:
    "Tell investors what your company does. You can leave this blank in a draft.",
  youtubeURL:
    "Aim for a 60-second pitch. Use a public or unlisted video; duration and visibility aren’t automatically verified.",
  twitterURL:
    "An HTTPS Twitter/X link. Leave this blank if you don’t have one.",
  demoURL: "An HTTPS link where people can try your project.",
};
const placeholders: Partial<Record<ProfileTextField, string>> = {
  companyName: "e.g. Plantry",
  youtubeURL: "https://youtu.be/…",
  twitterURL: "https://x.com/…",
  demoURL: "https://…",
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
  const [saving, setSaving] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const profile = useQuery({
    queryKey,
    queryFn: readProfile,
    enabled: !saving,
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
  const [thumbnail, setThumbnail] = useState<{
    file: File;
    preview: string;
    uploadedUrl?: string;
  }>();
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [notice, setNotice] = useState<Notice>();
  const [clock, setClock] = useState(Date.now());
  const thumbnailInput = useRef<HTMLInputElement>(null);
  const writeInFlight = useRef(false);
  const expiryRefreshed = useRef(false);
  // Let profile refreshes inspect current edits without rerunning on each edit.
  const currentForm = useRef(form);
  currentForm.current = form;
  const refetchProfile = profile.refetch;
  const refetchSnapshot = snapshot.refetch;
  const thumbnailPreview = thumbnail?.preview;

  useEffect(() => {
    if (thumbnailPreview) return () => URL.revokeObjectURL(thumbnailPreview);
  }, [thumbnailPreview]);

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
    !!form &&
    (!!thumbnail ||
      profileFields.some((field) => values[field] !== saved[field]));
  const thumbnailUrl = thumbnailPreview || draft.logo;
  const complete = !!form && profileIsComplete(saved);
  const canEdit =
    !!profile.data?.canEdit &&
    !profile.isError &&
    !removed &&
    !sessionExpired &&
    !closed;
  const canEditName = canEdit && !!profile.data?.canEditName;
  const busy = props.busy || saving;
  const company =
    snapshot.data?.eventId === KICKSTART_EVENT_KEY
      ? snapshot.data.projects.find((p) => p.projectId === projectId)
      : undefined;
  const seedState =
    snapshot.isSuccess && company
      ? listingState(company, marketStage(snapshot.data, serverNow))
      : undefined;

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
    // Manual refetches bypass enabled, so defer expiry reads during a write too.
    if (saving || !closed || expiryRefreshed.current) return;
    expiryRefreshed.current = true;
    void refetchProfile();
    void refetchSnapshot();
  }, [saving, closed, refetchProfile, refetchSnapshot]);

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

  function selectThumbnail(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    const error =
      !thumbnailTypes.includes(file.type) ||
      file.size === 0 ||
      file.size > maxThumbnailBytes
        ? "Choose a JPEG, PNG, or WebP image up to 2 MB."
        : undefined;
    setErrors((current) => ({ ...current, logo: error }));
    if (!error) setThumbnail({ file, preview: URL.createObjectURL(file) });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (writeInFlight.current || busy || !canEdit || !form) return;
    const submitted = {
      ...values,
      companyName: canEditName ? values.companyName : saved.companyName,
    };
    const validation = validateProfile(submitted);
    // A name-locked profile that was complete must stay complete.
    const mustStayComplete =
      typeof company?.seedStartedAt === "number" ||
      company?.seedSharesAtIpo != null ||
      ((!profile.data?.canEditName || (company?.netShares ?? 0) > 0) &&
        complete);
    if (mustStayComplete) {
      if (!submitted.blurb)
        validation.blurb =
          "Keep a company blurb when the completed profile is locked.";
      if (!submitted.youtubeURL)
        validation.youtubeURL =
          "Keep a valid YouTube pitch when the completed profile is locked.";
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
    if (!thumbnail && !Object.keys(patch).length) return;
    writeInFlight.current = true;
    setSaving(true);
    setNotice(undefined);
    let profileWriteStarted = false;
    try {
      await queryClient.cancelQueries({ queryKey });
      if (thumbnail) {
        const logo =
          thumbnail.uploadedUrl ??
          (await uploadCompanyThumbnail(projectId, thumbnail.file));
        if (!thumbnail.uploadedUrl)
          setThumbnail({ ...thumbnail, uploadedUrl: logo });
        submitted.logo = logo;
        patch.logo = logo;
      }
      profileWriteStarted = true;
      await saveCompanyProfile(projectId, patch);
      setThumbnail(undefined);
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
      reportWriteError(
        error,
        profileWriteStarted
          ? "Couldn’t save the company profile"
          : "Couldn’t upload the company thumbnail",
      );
      if (!profileWriteStarted) return;
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
          setThumbnail(undefined);
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
      setSaving(false);
    }
  }

  const profileProblem = profileRequiresSignIn(profile.error) || sessionExpired;
  const title = saved.companyName || props.team.team_name;
  const previewId = youtubeVideoId(draft.youtubeURL);
  const preview: Company = {
    ...company,
    projectId,
    companyName: draft.companyName.trim() || "Your company",
    blurb: draft.blurb,
    youtubeURL: previewId ? `https://www.youtube.com/watch?v=${previewId}` : "",
    logo: thumbnailUrl,
    demoURL: values.demoURL,
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
          description="Share your team code and add a blurb and YouTube pitch so investors can learn about your company."
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
            detail: seedState ? "Company available" : "Checking availability",
            done: !!seedState,
          },
          {
            label: "Funding",
            detail:
              seedState === "ACTIVE"
                ? "Seeding now"
                : seedState === "ENDED"
                  ? "Closed"
                  : seedState === "LIVE"
                    ? "IPO live"
                    : seedState === "PAUSED"
                      ? "Trading paused"
                      : "Checking status",
            done: seedState === "ACTIVE" || seedState === "LIVE",
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
          onRetry={saving ? undefined : () => void profile.refetch()}
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
          onRetry={saving ? undefined : () => void profile.refetch()}
        />
      )}
      {profile.data && (
        <SeedRound
          state={seedState}
          busy={busy}
          onRetry={() => void snapshot.refetch()}
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
            aria-busy={saving}
          >
            <h2
              id="company-profile-heading"
              className="text-[16px] font-medium md:text-[12px] md:text-[#1fbef9]"
            >
              Company profile
            </h2>
            {profileTextFields.map((field) => {
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
                      placeholder={placeholders[field]}
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
            <div className="space-y-1.5">
              <p className="text-[12px] text-[#b5c1da]">
                Company thumbnail (optional)
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {thumbnailUrl && (
                  <div className="relative grid aspect-[2.45] w-28 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#1d2a50]">
                    <CompanyPhoto logo={thumbnailUrl} emblemSize={24} />
                  </div>
                )}
                <input
                  ref={thumbnailInput}
                  type="file"
                  hidden
                  accept={thumbnailTypes.join(",")}
                  disabled={busy || !canEdit || !form}
                  onChange={selectThumbnail}
                />
                <Button
                  id="profile-logo"
                  type="button"
                  className={teamSecondaryButton}
                  disabled={busy || !canEdit || !form}
                  onClick={() => thumbnailInput.current?.click()}
                  aria-invalid={!!errors.logo}
                  aria-describedby={
                    errors.logo
                      ? "profile-logo-hint profile-logo-error"
                      : "profile-logo-hint"
                  }
                >
                  {thumbnailUrl ? "Replace thumbnail" : "Choose thumbnail"}
                </Button>
                {thumbnailUrl && canEdit && (
                  <Button
                    type="button"
                    className={teamSecondaryButton}
                    disabled={busy}
                    onClick={() => {
                      setThumbnail(undefined);
                      setForm((current) =>
                        current
                          ? {
                              ...current,
                              draft: { ...current.draft, logo: "" },
                            }
                          : current,
                      );
                      setErrors((current) => ({ ...current, logo: undefined }));
                    }}
                  >
                    Remove thumbnail
                  </Button>
                )}
              </div>
              {thumbnail && (
                <p
                  role="status"
                  className="truncate text-[12px] text-[#b5c1da]"
                >
                  {thumbnail.file.name}
                </p>
              )}
              <p
                id="profile-logo-hint"
                className="text-[12px] leading-5 text-[#98a9c8]"
              >
                JPEG, PNG, or WebP up to 2 MB. Shown on your catalog card.
              </p>
              {errors.logo && (
                <p
                  id="profile-logo-error"
                  role="alert"
                  className="text-[13px] text-[#ff879a]"
                >
                  {errors.logo}
                </p>
              )}
            </div>
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
                {saving ? "Saving…" : complete ? "Save changes" : "Save draft"}
              </Button>
              <Button
                type="button"
                className={`${teamSecondaryButton} order-2`}
                disabled={busy || !dirty}
                onClick={() => {
                  setThumbnail(undefined);
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
  state,
  busy,
  onRetry,
}: {
  state?: ReturnType<typeof listingState>;
  busy: boolean;
  onRetry: () => void;
}) {
  const funding = {
    ACTIVE: [
      "Seeding is open",
      "Investors can buy at $100 per share until IPO preparation or the event cutoff.",
    ],
    LIVE: ["Live trading", "Investors can buy and sell at market prices."],
    PAUSED: [
      "Trading paused",
      "Trading resumes when the market phase changes.",
    ],
    ENDED: ["Funding closed", "This listing is closed for trading."],
  };
  const [title, description] = state
    ? funding[state]
    : ["Funding status unavailable", "Reload the market to check funding."];
  return (
    <section
      className="flex flex-col gap-4 rounded-2xl border border-[#1fbef9]/40 bg-[#101a2b]/75 p-4 md:flex-row md:items-center md:justify-between md:p-5"
      aria-label="Funding"
    >
      <div className="min-w-0 space-y-1">
        <p className="text-[12px] text-[#1fbef9]">Funding</p>
        <h2 className="text-[20px] font-medium tabular-nums">{title}</h2>
        <p className="max-w-3xl text-[13px] leading-5 text-[#b5c1da]">
          {description}
        </p>
      </div>
      {!state && (
        <Button
          className={teamSecondaryButton}
          onClick={onRetry}
          disabled={busy}
        >
          Reload status
        </Button>
      )}
    </section>
  );
}
