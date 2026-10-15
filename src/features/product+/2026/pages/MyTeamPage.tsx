import {
  useRef,
  useState,
  type ComponentType,
  type FormEvent,
  type SVGProps,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { useUserAttributes } from "@/queries/user";
import { cn } from "@/lib/utils";
import CopyIcon from "@/assets/2026/product+/copy.svg";
import CopyConfirmedIcon from "@/assets/2026/product+/team-copy-confirmed.svg";
import {
  GlassCard,
  PageHeading,
  Pill,
  ProductButton,
  ProductToast,
} from "../components/ProductPlusUI";
import {
  errorStatus,
  useCreateTeam,
  useJoinTeam,
  useLeaveTeam,
  useProductPlusTeam,
  useRemoveTeamMember,
  type Team,
} from "../team";

type Svg = ComponentType<SVGProps<SVGSVGElement>>;
const Copy = CopyIcon as unknown as Svg;
const CopyConfirmed = CopyConfirmedIcon as unknown as Svg;

const TOAST_DURATION_MS = 4000;
const COPIED_DURATION_MS = 2000;
const GENERIC_ERROR = "Something went wrong. Please try again.";
const ALREADY_ON_TEAM = "You're already on a team for this event.";

type ShowToast = (tone: "success" | "error", message: string) => void;

const fieldErrorClass =
  "border-[#c4566c] focus-visible:outline-[#c4566c] bg-white/70";

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} className="-mt-4 text-[13px] leading-[18px] text-[#a8324a]">
      {children}
    </p>
  );
}

function CreateTeamCard({
  email,
  showToast,
  onAlreadyOnTeam,
}: {
  email: string | undefined;
  showToast: ShowToast;
  onAlreadyOnTeam: () => void;
}) {
  const create = useCreateTeam(email);
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState("");
  const name = teamName.trim();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name || create.isPending) return;
    setError("");
    create.mutate(name, {
      onSuccess: () =>
        showToast(
          "success",
          "Team created. Share the code with your teammates.",
        ),
      onError: (err) => {
        if (errorStatus(err) === 409) {
          setError(
            `${ALREADY_ON_TEAM} Leave your current team first to create another.`,
          );
          showToast("error", ALREADY_ON_TEAM);
          onAlreadyOnTeam();
        } else {
          setError(GENERIC_ERROR);
          showToast("error", "Couldn't create your team. Please try again.");
        }
      },
    });
  };

  return (
    <GlassCard className="max-[1200px]:p-6">
      <form className="flex h-full flex-col gap-6" onSubmit={submit} noValidate>
        <Pill>One teammate does this</Pill>
        <div>
          <h2>Create a team</h2>
          <p className="mt-2 text-product-muted">
            You&apos;ll get a 6-digit code to share with everyone else.
          </p>
        </div>
        <label className="flex flex-col gap-2 font-semibold">
          Team name
          <Input
            className={cn(
              "h-14 min-h-14 w-full rounded-[16px] border border-[rgba(97,79,184,0.08)] bg-white/30 px-4 py-3 text-[14px] font-normal max-[640px]:text-[16px] leading-5 text-product-ink shadow-[0_1px_2px_rgba(97,79,184,0.05)] placeholder:text-product-muted focus-visible:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-product-primary focus-visible:ring-0 focus-visible:ring-offset-0",
              error && fieldErrorClass,
            )}
            value={teamName}
            onChange={(event) => {
              setTeamName(event.target.value);
              setError("");
            }}
            placeholder="Team name"
            autoComplete="off"
            aria-invalid={!!error}
            aria-describedby={error ? "create-team-error" : undefined}
          />
        </label>
        {error ? <FieldError id="create-team-error">{error}</FieldError> : null}
        <ProductButton
          type="submit"
          className="mt-auto w-full"
          disabled={!name || create.isPending}
        >
          {create.isPending ? "Creating team…" : "Create team"}
        </ProductButton>
      </form>
    </GlassCard>
  );
}

function JoinTeamCard({
  email,
  showToast,
  onAlreadyOnTeam,
}: {
  email: string | undefined;
  showToast: ShowToast;
  onAlreadyOnTeam: () => void;
}) {
  const join = useJoinTeam(email);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const complete = code.length === 6;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!complete || join.isPending) return;
    setError("");
    join.mutate(code, {
      onSuccess: (team) =>
        showToast("success", `You joined ${team.team_name}.`),
      onError: (err) => {
        const status = errorStatus(err);
        if (status === 404) {
          setError(
            "Code not found. Check the code with your teammate and try again.",
          );
        } else if (status === 409) {
          setError(
            `${ALREADY_ON_TEAM} Leave your current team first to join another.`,
          );
          showToast("error", ALREADY_ON_TEAM);
          onAlreadyOnTeam();
        } else {
          setError(GENERIC_ERROR);
          showToast("error", "Couldn't join the team. Please try again.");
        }
      },
    });
  };

  return (
    <GlassCard className="max-[1200px]:p-6">
      <form className="flex h-full flex-col gap-6" onSubmit={submit} noValidate>
        <Pill>Everyone else</Pill>
        <div>
          <h2>Join a team</h2>
          <p className="mt-2 text-product-muted">
            Got a code from your teammate? Enter it to join their team.
          </p>
        </div>
        <label
          className="flex flex-col gap-2 font-semibold"
          htmlFor="team-code"
        >
          Team code
        </label>
        <div className="relative -mt-4 focus-within:rounded-[18px] focus-within:outline focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-product-primary">
          <input
            id="team-code"
            aria-label="Six-digit team code"
            aria-invalid={!!error}
            aria-describedby={error ? "join-team-error" : undefined}
            autoComplete="off"
            inputMode="numeric"
            maxLength={6}
            className="absolute z-[1] h-full w-full cursor-text border-0 bg-transparent text-[16px] text-transparent caret-transparent opacity-0"
            value={code}
            onChange={(event) => {
              setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
              setError("");
            }}
          />
          <div
            aria-hidden="true"
            className="grid grid-cols-6 gap-3 max-[1200px]:gap-2 max-[640px]:gap-[6px]"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <span
                key={index}
                className={cn(
                  "flex h-[72px] items-center justify-center rounded-[18px] border border-white/70 bg-white/60 text-[20px] text-product-muted shadow-[0_8px_28px_rgba(97,80,184,0.08)] max-[1200px]:h-16 max-[640px]:h-14",
                  code[index] && "text-product-ink",
                  error && "border-[#c4566c]",
                )}
              >
                {code[index] || "–"}
              </span>
            ))}
          </div>
        </div>
        {error ? <FieldError id="join-team-error">{error}</FieldError> : null}
        <ProductButton
          type="submit"
          className="mt-auto w-full"
          disabled={!complete || join.isPending}
        >
          {join.isPending ? "Joining team…" : "Join team"}
        </ProductButton>
      </form>
    </GlassCard>
  );
}

function TeamCodeBox({
  code,
  showToast,
}: {
  code: string;
  showToast: ShowToast;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_DURATION_MS);
    } catch {
      showToast("error", "Couldn't copy the code. Please copy it manually.");
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-5 rounded-[24px] border-[1.5px] px-5 py-[14px] transition-colors duration-150 max-[1200px]:gap-3 max-[1200px]:p-3 max-[640px]:w-full max-[640px]:flex-wrap max-[640px]:justify-between",
        copied
          ? "border-[#7cc4a3] bg-[#e5f5ed]"
          : "border-[rgba(97,79,184,0.45)] bg-product-lavender",
      )}
    >
      <div className="flex flex-col gap-[2px]">
        <span className="text-[11px] text-product-muted">Team Code</span>
        <strong
          className={cn(
            "font-product-heading text-[32px] font-normal leading-10 tracking-[1.92px] max-[640px]:text-[28px] max-[640px]:leading-9",
            copied ? "text-[#246953]" : "text-product-primary",
          )}
        >
          {code}
        </strong>
      </div>
      <ProductButton
        type="button"
        variant="secondary"
        onClick={copy}
        aria-label={copied ? "Team code copied" : "Copy team code"}
        className={cn(
          "min-h-10 shrink-0 gap-2 px-4 py-2 text-[13px] leading-5 shadow-none [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0",
          copied
            ? "bg-[#cdeadb] text-[#215c47] hover:bg-[#cdeadb] hover:text-[#215c47]"
            : "bg-[rgba(97,79,184,0.12)]",
        )}
      >
        {copied ? (
          <CopyConfirmed aria-hidden="true" width={16} height={16} />
        ) : (
          <Copy aria-hidden="true" />
        )}
        {copied ? "Copied" : "Tap to copy"}
      </ProductButton>
      <span className="sr-only" role="status">
        {copied ? "Team code copied" : ""}
      </span>
    </div>
  );
}

function TeamView({
  team,
  email,
  showToast,
  onStale,
}: {
  team: Team;
  email: string | undefined;
  showToast: ShowToast;
  onStale: () => void;
}) {
  const leave = useLeaveTeam(email);
  const remove = useRemoveTeamMember(email);
  const isLeader = team.leader_user_id === email;

  const leaveTeam = () =>
    leave.mutate(undefined, {
      onSuccess: () => showToast("success", `You left ${team.team_name}.`),
      onError: (err) => {
        if (errorStatus(err) === 404) onStale();
        showToast("error", "Couldn't leave the team. Please try again.");
      },
    });

  const removeMember = (userID: string, name: string) =>
    remove.mutate(userID, {
      onSuccess: () =>
        showToast("success", `${name} was removed from the team.`),
      onError: (err) => {
        if (errorStatus(err) === 404) onStale();
        showToast("error", `Couldn't remove ${name}. Please try again.`);
      },
    });

  return (
    <GlassCard className="mx-auto mt-4 flex max-w-[800px] flex-col items-start gap-6 max-[640px]:mt-0">
      <div className="flex w-full items-start justify-between gap-6 max-[960px]:flex-wrap">
        <div className="min-w-0">
          <h2 className="break-words">{team.team_name}</h2>
          <p className="mt-2 text-product-muted">
            Share this code so teammates can join.
          </p>
        </div>
        <TeamCodeBox code={team.team_code} showToast={showToast} />
      </div>
      <ul className="m-0 flex w-full list-none flex-col gap-3 p-0">
        {team.members.map((member) => {
          const memberIsLeader = member.user_id === team.leader_user_id;
          const removing =
            remove.isPending && remove.variables === member.user_id;
          return (
            <li
              key={member.user_id}
              className="flex min-h-[72px] items-center gap-4 rounded-[16px] border border-[rgba(97,79,184,0.16)] bg-white/60 px-4 py-3 max-[640px]:gap-[10px] max-[640px]:p-[10px]"
            >
              <span className="flex h-10 w-10 shrink-0 grow-0 basis-10 items-center justify-center rounded-full bg-product-lavender text-[14px] font-semibold text-product-ink">
                {initialsOf(member.name)}
              </span>
              <strong className="min-w-0 flex-1 break-words">
                {member.name}
              </strong>
              {memberIsLeader ? (
                <Pill className="min-w-[104px] max-[640px]:min-w-0">
                  Leader
                </Pill>
              ) : isLeader ? (
                <ProductButton
                  type="button"
                  variant="secondary"
                  disabled={remove.isPending || leave.isPending}
                  onClick={() => removeMember(member.user_id, member.name)}
                  aria-label={`Remove ${member.name}`}
                  className="max-[640px]:min-h-10 max-[640px]:px-3 max-[640px]:py-2"
                >
                  {removing ? "Removing…" : "Remove"}
                </ProductButton>
              ) : null}
            </li>
          );
        })}
      </ul>
      <ProductButton
        type="button"
        variant="secondary"
        disabled={leave.isPending || remove.isPending}
        onClick={leaveTeam}
      >
        {leave.isPending ? "Leaving team…" : "Leave team"}
      </ProductButton>
    </GlassCard>
  );
}

export default function MyTeamPage() {
  const queryClient = useQueryClient();
  const { data: user } = useUserAttributes();
  const email = user?.email;
  const team = useProductPlusTeam(email);
  const [toast, setToast] = useState<{
    id: number;
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const toastId = useRef(0);

  const showToast: ShowToast = (tone, message) => {
    const id = ++toastId.current;
    setToast({ id, tone, message });
    // Skip if a newer toast has replaced this one
    setTimeout(
      () => setToast((current) => (current?.id === id ? null : current)),
      TOAST_DURATION_MS,
    );
  };
  const refetchTeam = () => {
    void queryClient.invalidateQueries({ queryKey: ["productPlusTeam"] });
  };

  if (team.isPending) {
    return (
      <section
        className="flex min-h-[360px] items-center justify-center text-product-muted"
        aria-live="polite"
      >
        Loading your team…
      </section>
    );
  }

  if (team.isError) {
    return (
      <section
        className="flex min-h-[360px] flex-col items-center justify-center gap-5 text-center"
        aria-live="polite"
      >
        <h1>We couldn’t load your team</h1>
        <p className="text-[14px] leading-5 text-product-muted">
          Please try again to continue.
        </p>
        <ProductButton type="button" onClick={() => void team.refetch()}>
          Try again
        </ProductButton>
      </section>
    );
  }

  return (
    <div className="relative pt-12 max-[640px]:pt-0">
      {toast ? (
        <ProductToast key={toast.id} tone={toast.tone}>
          {toast.message}
        </ProductToast>
      ) : null}
      {team.data ? (
        <>
          <PageHeading title="My team" />
          <TeamView
            team={team.data}
            email={email}
            showToast={showToast}
            onStale={refetchTeam}
          />
        </>
      ) : (
        <>
          <PageHeading
            title="Create or join a team"
            description="Create your team once, then share the code. Teammates join with that code."
          />
          <div className="grid grid-cols-2 gap-6 pt-10 max-[1200px]:gap-4 max-[1200px]:pt-4 max-[960px]:grid-cols-1 max-[640px]:pt-0">
            <CreateTeamCard
              email={email}
              showToast={showToast}
              onAlreadyOnTeam={refetchTeam}
            />
            <JoinTeamCard
              email={email}
              showToast={showToast}
              onAlreadyOnTeam={refetchTeam}
            />
          </div>
        </>
      )}
    </div>
  );
}
