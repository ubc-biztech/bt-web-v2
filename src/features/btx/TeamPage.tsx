import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import "@/components/ConfigureAmplify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  errorStatus,
  useCreateEventTeam,
  useEventTeam,
  useJoinEventTeam,
  useLeaveEventTeam,
  useRemoveEventTeamMember,
  type Team,
  type TeamMember,
} from "@/features/events/teams";
import { QueryProvider } from "@/lib/queryProvider";
import {
  useUserRegistrations,
  type Registration,
} from "@/queries/registrations";
import { useUserAttributes } from "@/queries/user";
import { getSafeRedirect } from "@/util/url";
import { useBtxProfile } from "./accountQueries";
import { BtxSidebar } from "./BtxSidebar";
import {
  AngledPanel,
  StatusBanner,
  type Notice,
  teamPrimaryButton as primaryButton,
  teamSecondaryButton as secondaryButton,
  teamPanelClass as panelClass,
} from "./BtxUI";
import { CompanyWorkspace } from "./CompanyWorkspace";
import { exchangePath, isBtxRegistrationStatus } from "./market";
import { market } from "./seedApi";
import {
  companyNameError,
  formationIsOpen,
  KICKSTART_EVENT_ID,
  KICKSTART_EVENT_KEY,
  KICKSTART_EVENT_PATH,
  KICKSTART_YEAR,
  teamCodeError,
  teamMembershipState,
} from "./teamRules";

const fieldClass =
  "h-[46px] rounded-2xl border-[#324a68] bg-[#080f1b] px-4 text-base text-[#e6ebf6] placeholder:text-[#98a9c8] focus-visible:ring-[#1fbef9] focus-visible:ring-offset-[#0b1120] aria-[invalid=true]:border-[#ff5c7a] md:text-[14px]";
const teamLoginPath = `/login?redirect=${encodeURIComponent(exchangePath + "/my-company")}`;

function requiresSignIn(error: unknown): boolean {
  return (
    errorStatus(error) === 401 ||
    (error instanceof Error && error.name === "UnauthenticatedUserError")
  );
}

function ErrorMessage({ id, children }: { id: string; children?: string }) {
  return children ? (
    <p id={id} role="alert" className="text-[14px] text-[#ff879a]">
      {children}
    </p>
  ) : null;
}

function TeamAccessState({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <AngledPanel className={`${panelClass} mx-auto my-10 max-w-xl space-y-5`}>
      <h1 className="text-[36px] font-medium">{title}</h1>
      {children}
    </AngledPanel>
  );
}

function EligibleTeamPage({
  email,
  eligible,
}: {
  email: string;
  eligible: boolean;
}) {
  const queryClient = useQueryClient();
  const team = useEventTeam(KICKSTART_EVENT_ID, KICKSTART_YEAR, email, {
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 15000,
    retry: false,
  });
  const create = useCreateEventTeam(KICKSTART_EVENT_ID, KICKSTART_YEAR, email);
  const join = useJoinEventTeam(KICKSTART_EVENT_ID, KICKSTART_YEAR, email);
  const leave = useLeaveEventTeam(KICKSTART_EVENT_ID, KICKSTART_YEAR, email);
  const remove = useRemoveEventTeamMember(
    KICKSTART_EVENT_ID,
    KICKSTART_YEAR,
    email,
  );
  const snapshot = useQuery({
    queryKey: ["btx", "snapshot"],
    queryFn: market,
    refetchInterval: 15000,
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: false,
  });
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [nameError, setNameError] = useState<string>();
  const [codeError, setCodeError] = useState<string>();
  const [notice, setNotice] = useState<Notice>();
  const [checkingTeam, setCheckingTeam] = useState(false);
  const [created, setCreated] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [removedTeam, setRemovedTeam] = useState<Team | null>(null);
  const lastTeam = useRef<Team | null>(null);
  const expectedDeparture = useRef(false);
  const membershipWrite = useRef(false);
  const currentTeam = team.data?.members.some(
    (member) => member.user_id === email,
  )
    ? team.data
    : null;
  const removedView =
    removedTeam ??
    (team.isSuccess && !currentTeam && !expectedDeparture.current
      ? lastTeam.current
      : null);
  const membershipState = teamMembershipState(
    snapshot.isSuccess ? snapshot.data : undefined,
    snapshot.data?.projects.find(
      (company) => company.projectId === currentTeam?.projectId,
    ),
  );
  const busy =
    create.isPending ||
    join.isPending ||
    leave.isPending ||
    remove.isPending ||
    checkingTeam ||
    team.isError ||
    sessionExpired;
  const formationOpen =
    eligible &&
    snapshot.isSuccess &&
    formationIsOpen(snapshot.data.eventId, snapshot.data.phase);

  const rememberMembership = useCallback(
    async (result: Team | null) => {
      const queryKey = ["registrations", email];
      await queryClient.cancelQueries({ queryKey });
      // Keep navigation in sync with confirmed membership. Immediate server reads
      // are eventually consistent and can still return the previous teamID.
      queryClient.setQueryData<Registration[]>(queryKey, (registrations) =>
        registrations?.map((registration) => {
          if (registration["eventID;year"] !== KICKSTART_EVENT_KEY)
            return registration;
          const updated = { ...registration };
          if (result) updated.teamID = result.team_code;
          else delete updated.teamID;
          return updated;
        }),
      );
    },
    [email, queryClient],
  );

  function refreshRelatedViews() {
    void queryClient.invalidateQueries({ queryKey: ["btx", "snapshot"] });
    void queryClient.invalidateQueries({ queryKey: ["kickstart-teams"] });
  }

  useEffect(() => {
    if (!team.isSuccess) return;
    if (currentTeam) {
      lastTeam.current = currentTeam;
      setRemovedTeam(null);
      void rememberMembership(currentTeam);
    } else {
      if (lastTeam.current && !expectedDeparture.current) {
        setRemovedTeam(lastTeam.current);
        setNotice(undefined);
      }
      lastTeam.current = null;
      void rememberMembership(null);
    }
  }, [currentTeam, rememberMembership, team.isSuccess]);

  async function recover(
    error: unknown,
    action: "create" | "join" | "leave" | "remove",
    member?: TeamMember,
  ) {
    const status = errorStatus(error);
    const message =
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof error.message === "string"
        ? error.message
        : "We couldn’t confirm the request. Check your team before trying again.";
    if (status === 404 && action === "join") {
      setCodeError(
        "Code not found. Check it with your teammate and try again.",
      );
      return;
    }
    setNotice({
      tone: "error",
      title:
        action === "remove"
          ? "Couldn’t remove member"
          : "Couldn’t " + action + " company",
      description: message,
    });
    if (requiresSignIn(error)) {
      setSessionExpired(true);
      void queryClient.invalidateQueries({ queryKey: ["userAttributes"] });
      return;
    }
    if (status === 403) {
      void queryClient.invalidateQueries({
        queryKey: ["registrations", email],
      });
    }
    // Reconcile uncertain writes and permission/target changes; never replay a
    // leave or removal automatically after a lost response.
    if (
      status === undefined ||
      status === 409 ||
      action === "leave" ||
      action === "remove"
    ) {
      setCheckingTeam(true);
      try {
        const [current] = await Promise.all([
          team.refetch(),
          snapshot.refetch(),
        ]);
        if (current.isSuccess) {
          const membership = current.data?.members.some(
            (row) => row.user_id === email,
          )
            ? current.data
            : null;
          if (action === "leave" && !membership) {
            // Clear the previous view before releasing the pending-leave flag.
            // Otherwise a delayed render can mislabel a confirmed voluntary
            // departure as removal by another member.
            lastTeam.current = null;
            setRemovedTeam(null);
            setCreated(false);
          }
          await rememberMembership(membership);
          if (action === "leave" && !membership) {
            setNotice({
              tone: "info",
              title: "You’re no longer on this company team.",
            });
          } else if (
            action === "remove" &&
            member &&
            membership &&
            !membership.members.some((row) => row.user_id === member.user_id)
          ) {
            setNotice({
              tone: "info",
              title: `${member.name} is no longer on the team.`,
            });
          } else if ((action === "create" || action === "join") && membership) {
            setNotice({
              tone: "info",
              title: "Your current team is shown below.",
            });
          }
        }
      } finally {
        setCheckingTeam(false);
      }
    }
  }

  async function leaveTeam() {
    if (
      !currentTeam ||
      busy ||
      membershipWrite.current ||
      membershipState !== "open"
    )
      return;
    membershipWrite.current = true;
    expectedDeparture.current = true;
    const name = currentTeam.team_name;
    try {
      await leave.mutateAsync();
      await rememberMembership(null);
      lastTeam.current = null;
      setRemovedTeam(null);
      setCreated(false);
      setNotice({ tone: "success", title: `You left ${name}.` });
      refreshRelatedViews();
    } catch (error) {
      await recover(error, "leave");
    } finally {
      expectedDeparture.current = false;
      membershipWrite.current = false;
    }
  }

  async function removeMember(member: TeamMember) {
    if (
      !currentTeam ||
      busy ||
      membershipWrite.current ||
      membershipState !== "open" ||
      currentTeam.leader_user_id !== email ||
      member.user_id === email ||
      !currentTeam.members.some((row) => row.user_id === member.user_id)
    )
      return;
    membershipWrite.current = true;
    try {
      await remove.mutateAsync(member.user_id);
      setNotice({
        tone: "success",
        title: `${member.name} was removed from the team.`,
      });
      refreshRelatedViews();
    } catch (error) {
      await recover(error, "remove", member);
    } finally {
      membershipWrite.current = false;
    }
  }

  async function createTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !formationOpen) return;
    const validation = companyNameError(name);
    setNameError(validation);
    if (validation) return;
    setNotice(undefined);
    try {
      const result = await create.mutateAsync(name.trim());
      await rememberMembership(result);
      setCreated(true);
      refreshRelatedViews();
    } catch (error) {
      await recover(error, "create");
    }
  }

  async function joinTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !formationOpen) return;
    const validation = teamCodeError(code);
    setCodeError(validation);
    if (validation) return;
    setNotice(undefined);
    try {
      await rememberMembership(await join.mutateAsync(code));
      setNotice({ tone: "success", title: "You joined the company team." });
      refreshRelatedViews();
    } catch (error) {
      await recover(error, "join");
    }
  }

  if (team.isPending) return <TeamAccessState title="Checking your team…" />;
  if (team.isError && !team.data)
    return (
      <div className="space-y-4">
        <StatusBanner
          tone="error"
          title="Couldn’t check your team"
          description="Check your current membership before creating or joining a company."
          onRetry={() => void team.refetch()}
        />
        {requiresSignIn(team.error) && (
          <Button asChild className={primaryButton}>
            <Link href={teamLoginPath}>Sign in again</Link>
          </Button>
        )}
      </div>
    );

  return (
    <div className="space-y-4 md:space-y-5">
      {notice && <StatusBanner {...notice} />}
      {team.isError && (
        <StatusBanner
          tone="warning"
          title="Couldn’t refresh your team"
          description="Your profile changes are still here. Reload your membership before making changes."
          onRetry={() => void team.refetch()}
        />
      )}
      {sessionExpired && (
        <Button asChild className={primaryButton}>
          <Link href={teamLoginPath}>Sign in again</Link>
        </Button>
      )}
      {currentTeam || removedView ? (
        <CompanyWorkspace
          key={(currentTeam ?? removedView)!.team_code}
          team={(currentTeam ?? removedView)!}
          email={email}
          created={created}
          removed={!currentTeam}
          membershipState={membershipState}
          checkingPermissions={
            snapshot.isPending ||
            (snapshot.isFetching && membershipState === "unavailable")
          }
          busy={busy}
          leaving={leave.isPending}
          removingUserId={remove.isPending ? remove.variables : undefined}
          onLeave={leaveTeam}
          onRemove={removeMember}
          onRefresh={() => {
            void team.refetch();
            void snapshot.refetch();
          }}
          onFindTeam={() => {
            lastTeam.current = null;
            setRemovedTeam(null);
            setCreated(false);
            setNotice(undefined);
          }}
        />
      ) : (
        <>
          <header className="relative space-y-1 pr-12 md:space-y-2 md:pr-0">
            <h1 className="text-[30px] font-medium leading-tight md:text-[48px]">
              Start your company
            </h1>
            <p className="max-w-xl text-[14px] text-[#b5c1da]">
              Your team is your company. Create one or join a teammate’s with
              their code.
            </p>
            <span
              title={email}
              aria-label={`Signed in as ${email}`}
              className="absolute right-0 top-3 grid size-9 place-items-center rounded-full border border-[#527096] bg-[#172c3c] text-[12px] text-[#82c3fb] md:hidden"
            >
              {email[0].toUpperCase()}
            </span>
          </header>
          {!eligible ? (
            <StatusBanner
              tone="warning"
              title="Finish your KickStart registration"
              description="A completed, accepted registration or event check-in is required to create or join a team."
            />
          ) : snapshot.isPending ? (
            <StatusBanner
              tone="info"
              title="Checking whether team formation is open…"
            />
          ) : snapshot.isError ? (
            <StatusBanner
              tone="error"
              title="Couldn’t check team formation"
              onRetry={() => void snapshot.refetch()}
            />
          ) : !formationOpen ? (
            <StatusBanner
              tone="warning"
              title="Team formation is closed"
              description="Company teams can’t be created or joined during or after IPO preparation. Contact an organizer for help."
            />
          ) : null}
          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            <AngledPanel className={panelClass}>
              <form
                className="flex h-full flex-col gap-3 md:gap-4"
                onSubmit={(event) => void createTeam(event)}
                noValidate
                aria-busy={create.isPending}
              >
                <p className="w-fit rounded-full border border-[#1fbef9]/50 bg-[#1fbef9]/10 px-2 py-0.5 text-[12px] text-[#1fbef9] md:rounded-none md:border-0 md:bg-transparent md:p-0">
                  Option 1
                </p>
                <h2 className="text-[20px] font-medium leading-[23px] md:text-[24px] md:leading-[29px]">
                  Create a company team
                </h2>
                <p className="text-[14px] leading-[17px] text-[#b5c1da] md:leading-5">
                  You become the leader. A company is created for your team, and
                  you’ll get a six-digit code to share.
                </p>
                <div className="mt-auto space-y-1.5 md:space-y-2">
                  <label
                    htmlFor="company-name"
                    className="block text-[12px] text-[#b5c1da]"
                  >
                    Company / team name
                  </label>
                  <Input
                    id="company-name"
                    className={fieldClass}
                    value={name}
                    autoComplete="off"
                    placeholder="e.g. Plantry"
                    disabled={busy}
                    aria-invalid={!!nameError}
                    aria-describedby={
                      nameError ? "company-name-error" : undefined
                    }
                    onChange={(event) => {
                      setName(event.target.value);
                      setNameError(undefined);
                    }}
                  />
                  <ErrorMessage id="company-name-error">
                    {nameError}
                  </ErrorMessage>
                </div>
                <Button
                  type="submit"
                  className={`${primaryButton} w-full`}
                  disabled={busy || !formationOpen}
                >
                  {create.isPending ? "Creating company…" : "Create company"}
                </Button>
              </form>
            </AngledPanel>
            <AngledPanel className={panelClass}>
              <form
                className="flex h-full flex-col gap-3 md:gap-4"
                onSubmit={(event) => void joinTeam(event)}
                noValidate
                aria-busy={join.isPending}
              >
                <p className="w-fit rounded-full border border-[#527096] bg-[#1b2c43] px-2 py-0.5 text-[12px] text-[#82c3fb] md:rounded-none md:border-0 md:bg-transparent md:p-0 md:text-[#1fbef9]">
                  Option 2
                </p>
                <h2 className="text-[20px] font-medium leading-[23px] md:text-[24px] md:leading-[29px]">
                  Join a company team
                </h2>
                <p className="text-[14px] leading-[17px] text-[#b5c1da] md:leading-5">
                  Ask your team leader for their six-digit code. You’ll join
                  their existing company.
                </p>
                <div className="relative mt-auto space-y-1.5 md:space-y-2">
                  <label
                    htmlFor="team-code"
                    className="block text-[12px] text-[#b5c1da]"
                  >
                    Six-digit team code
                  </label>
                  <div className="relative rounded-2xl focus-within:ring-2 focus-within:ring-[#1fbef9] focus-within:ring-offset-2 focus-within:ring-offset-[#0b1120] md:w-fit">
                    <Input
                      id="team-code"
                      className={`${fieldClass} md:absolute md:inset-0 md:h-full md:w-full md:opacity-0`}
                      value={code}
                      autoComplete="off"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      disabled={busy}
                      aria-invalid={!!codeError}
                      aria-describedby={
                        codeError ? "team-code-error" : undefined
                      }
                      onChange={(event) => {
                        setCode(
                          event.target.value.replace(/\D/g, "").slice(0, 6),
                        );
                        setCodeError(undefined);
                      }}
                    />
                    <div
                      aria-hidden="true"
                      className="hidden grid-cols-6 gap-2 md:grid"
                    >
                      {Array.from({ length: 6 }, (_, index) => (
                        <span
                          key={index}
                          className={`flex h-16 w-[50px] items-center justify-center rounded-2xl border bg-[#080f1b] text-[24px] ${codeError ? "border-[#ff5c7a]" : "border-[#324a68]"}`}
                        >
                          {code[index] ?? ""}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ErrorMessage id="team-code-error">{codeError}</ErrorMessage>
                </div>
                <Button
                  type="submit"
                  className={`${secondaryButton} h-[46px] w-full md:border-0 md:bg-[#1fbef9] md:text-[#071523] md:hover:bg-[#60d0fc]`}
                  disabled={busy || !formationOpen}
                >
                  {join.isPending ? "Joining company…" : "Join company"}
                </Button>
              </form>
            </AngledPanel>
          </div>
          {checkingTeam && (
            <p role="status" className="text-[14px] text-[#b5c1da]">
              Checking whether your request completed…
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 text-[12px] md:gap-3 md:text-[14px]">
            <span className="text-[#98a9c8]">Just here to invest?</span>
            <Link
              className="inline-flex min-h-10 items-center rounded-full text-[#82c3fb] hover:underline md:border md:border-[#324a68] md:px-5 md:text-[12px] md:text-[#e6ebf6]"
              href={exchangePath + "/catalog"}
            >
              Browse KickStart companies →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function TeamPage() {
  const router = useRouter();
  const auth = useUserAttributes();
  const email = auth.data?.email;
  const isAdmin = !!auth.data?.isAdmin;
  const registrations = useUserRegistrations(email || undefined);
  const profile = useBtxProfile(email ? (auth.data?.sub ?? "") : "", isAdmin);
  const eligible = registrations.data?.some(
    (registration) =>
      registration["eventID;year"] === KICKSTART_EVENT_KEY &&
      isBtxRegistrationStatus(registration.registrationStatus),
  );
  const hasTeam = registrations.data?.some(
    (registration) =>
      registration["eventID;year"] === KICKSTART_EVENT_KEY &&
      !!registration.teamID,
  );
  const loginPath = `/login?redirect=${encodeURIComponent(getSafeRedirect(router.asPath))}`;
  let content: ReactNode;
  if (auth.isPending)
    content = <TeamAccessState title="Checking your account…" />;
  else if (auth.isError)
    content = (
      <StatusBanner
        tone="error"
        title="Couldn’t check your account"
        onRetry={() => void auth.refetch()}
      />
    );
  else if (!auth.data)
    content = (
      <TeamAccessState title="Start your KickStart company">
        <p className="text-[#b5c1da]">
          Sign in with your BizTech account to create or join a company team.
        </p>
        <Button asChild className={primaryButton}>
          <Link href={loginPath}>Continue with BizTech account</Link>
        </Button>
      </TeamAccessState>
    );
  else if (!email)
    content = (
      <TeamAccessState title="Verify your email">
        <p className="text-[#b5c1da]">
          Verify your BizTech account email before creating or joining a
          company.
        </p>
        <Button asChild className={primaryButton}>
          <Link href="/verify">Verify email</Link>
        </Button>
        <Button className={secondaryButton} onClick={() => void auth.refetch()}>
          Check again
        </Button>
      </TeamAccessState>
    );
  else if (registrations.isPending)
    content = <TeamAccessState title="Checking your registration…" />;
  else if (registrations.isError)
    content = (
      <div className="space-y-4">
        <StatusBanner
          tone="error"
          title="Couldn’t check your registration"
          onRetry={() => void registrations.refetch()}
        />
        {requiresSignIn(registrations.error) && (
          <Button asChild className={primaryButton}>
            <Link href={loginPath}>Sign in again</Link>
          </Button>
        )}
      </div>
    );
  else if (!eligible && !hasTeam)
    content = (
      <TeamAccessState title="Finish your KickStart registration">
        <p className="text-[#b5c1da]">
          You need a completed, accepted KickStart 2026 registration or event
          check-in to create or join a company team.
        </p>
        <Button asChild className={primaryButton}>
          <Link href={KICKSTART_EVENT_PATH}>Go to KickStart event page</Link>
        </Button>
      </TeamAccessState>
    );
  else
    content = (
      <EligibleTeamPage key={email} email={email} eligible={!!eligible} />
    );

  return (
    <div className="flex min-h-screen bg-[#0b1120] text-[#e6ebf6]">
      {email && (
        <div className="hidden md:block">
          <BtxSidebar
            isAdmin={isAdmin}
            userId={auth.data?.sub ?? ""}
            {...profile}
          />
        </div>
      )}
      <main
        className={`min-w-0 flex-1 bg-[url(/assets/btx/market-background.webp)] bg-[length:100%_auto] bg-top bg-no-repeat px-6 pt-12 md:px-12 md:pb-8 md:pt-[120px] ${email ? "pb-[calc(88px+env(safe-area-inset-bottom))]" : "pb-8"}`}
      >
        {!email && (
          <Link href={exchangePath} aria-label="BTX exchange">
            <Image
              src="/assets/btx/sidebar/wordmark.svg"
              width={101}
              height={43}
              alt="BTX"
              unoptimized
            />
          </Link>
        )}
        <div className="mx-auto max-w-[1600px]">{content}</div>
      </main>
      {email && (
        <BtxSidebar
          variant="mobile"
          isAdmin={isAdmin}
          userId={auth.data?.sub ?? ""}
          {...profile}
        />
      )}
    </div>
  );
}

export default function TeamRoute() {
  return (
    <QueryProvider>
      <TeamPage />
    </QueryProvider>
  );
}
