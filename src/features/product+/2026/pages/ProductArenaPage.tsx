import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
  type SVGProps,
} from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useUserAttributes } from "@/queries/user";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ArenaLogoAsset from "@/assets/2026/product+/product-arena-logo.svg";
import CalendarAsset from "@/assets/2026/product+/arena-calendar.svg";
import LockAsset from "@/assets/2026/product+/registration-lock.svg";
import CompleteAsset from "@/assets/2026/product+/arena-complete.svg";
import UpvoteAsset from "@/assets/2026/product+/arena-upvote.svg";
import ArenaBackdrop from "../components/ArenaBackdrop";
import ArenaPlayer from "../components/ArenaPlayer";
import ArenaVoteBurst, {
  VOTE_BURST_DURATION_MS,
} from "../components/ArenaVoteBurst";
import { GlassCard, ProductButton } from "../components/ProductPlusUI";
import {
  audienceQueryKey,
  getAudienceSubmissions,
  postAudienceVote,
  useAudienceSubmissions,
} from "../queries/audience";
import {
  formatArenaDate,
  partitionSubmissions,
  votingPhase,
  type AudienceResponse,
  type VoteChoice,
} from "../arena";
import { PRODUCT_PLUS_COMPANION_PATH, productPlusLoginPath } from "../access";
import { productHeadingFont } from "../font";
import { cn } from "@/lib/utils";
import { UnauthenticatedUserError } from "@/lib/dbUtils";

type Svg = ComponentType<SVGProps<SVGSVGElement>>;
const ArenaLogo = ArenaLogoAsset as unknown as Svg;
const Calendar = CalendarAsset as unknown as Svg;
const Lock = LockAsset as unknown as Svg;
const Complete = CompleteAsset as unknown as Svg;
const Upvote = UpvoteAsset as unknown as Svg;

function ArenaModal({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange(open: boolean): void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#081440]/[0.28]" />
        <DialogPrimitive.Content
          className={cn(
            productHeadingFont.variable,
            "fixed left-1/2 top-1/2 z-50 flex w-[calc(100vw-32px)] max-w-[560px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-5 rounded-[40px] border border-white/70 bg-white/85 px-14 py-12 text-center font-product-body text-product-ink shadow-[0_4px_20px_rgba(97,80,184,0.08)] backdrop-blur-[14.5px] [color-scheme:light] max-[640px]:rounded-[28px] max-[640px]:px-6 max-[640px]:py-8",
          )}
        >
          <Lock aria-hidden="true" />
          <DialogTitle className="font-product-heading text-[40px] font-normal leading-[1.2] tracking-normal text-product-ink max-[640px]:text-[30px]">
            {title}
          </DialogTitle>
          <DialogDescription
            className={
              description
                ? "text-[16px] leading-5 text-product-muted"
                : "sr-only"
            }
          >
            {description ??
              "Sign in to record your vote. You can watch pitches without signing in."}
          </DialogDescription>
          {children}
          <DialogPrimitive.Close
            aria-label="Close dialog"
            className="absolute right-5 top-4 rounded-full px-2 text-[24px] text-product-muted focus-visible:outline focus-visible:outline-product-primary"
          >
            ×
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function ArenaIntroModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange(open: boolean): void;
}) {
  const steps = [
    {
      title: "Watch each pitch",
      description:
        "Every team shares a 1–2 minute video. Teams appear in random order.",
    },
    {
      title: "Upvote or Downvote",
      description:
        "Tap Upvote or Downvote to rate a pitch, then Next to watch another team.",
    },
    {
      title: "Votes are final",
      description: "You can’t change a vote once it’s cast.",
    },
  ];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#081440]/[0.28]" />
        <DialogPrimitive.Content
          className={cn(
            productHeadingFont.variable,
            "fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[560px] -translate-x-1/2 -translate-y-1/2 flex-col items-center overflow-y-auto rounded-[36px] border border-white/70 bg-white/85 px-[52px] py-10 font-product-body text-product-ink shadow-[0_4px_20px_rgba(97,80,184,0.08)] backdrop-blur-[14.5px] [color-scheme:light] max-[480px]:rounded-[28px] max-[480px]:px-6 max-[480px]:py-8",
          )}
        >
          <DialogTitle className="mb-3 text-center font-product-heading text-[32px] font-normal leading-10 tracking-[-0.8px] text-product-ink max-[480px]:text-[26px] max-[480px]:leading-8">
            How Product Arena works
          </DialogTitle>
          <DialogDescription className="sr-only">
            Watch pitches and cast one final vote per team.
          </DialogDescription>
          <ol className="flex w-full flex-col gap-4">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="flex items-start gap-4 rounded-[20px] border border-white/70 bg-white/60 px-[18px] py-4"
              >
                <span
                  aria-hidden="true"
                  className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-product-primary to-[#a59bce] text-[14px] font-semibold leading-5 text-white"
                >
                  {index + 1}
                </span>
                <div className="min-w-0 text-left">
                  <h3 className="text-[14px] font-semibold leading-5 text-product-ink">
                    {step.title}
                  </h3>
                  <p className="text-[12px] leading-4 text-product-muted">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <ProductButton
            className="mt-7 min-h-11 w-[186px] py-2.5 font-normal"
            onClick={() => onOpenChange(false)}
          >
            Got it
          </ProductButton>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function ArenaState({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="relative grid min-h-[888px] place-items-center px-8 pb-[136px] pt-12 max-[850px]:min-h-[720px] max-[640px]:min-h-[calc(100dvh-104px)] max-[640px]:px-4 max-[640px]:pb-24">
      <GlassCard className="flex w-full max-w-[640px] flex-col items-center gap-5 rounded-[40px] px-14 py-12 text-center max-[640px]:rounded-[28px] max-[640px]:px-6 max-[640px]:py-8">
        {icon}
        <h1
          id="arena-heading"
          className="font-product-heading text-[40px] font-normal leading-[1.2] tracking-normal max-[640px]:text-[30px]"
        >
          {title}
        </h1>
        {description ? (
          <p className="text-[16px] leading-5 text-product-muted">
            {description}
          </p>
        ) : null}
        {children ? (
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {children}
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}

function ArenaContent({
  embedded,
  identity,
  authReady,
  authFailed,
}: {
  embedded: boolean;
  identity: string | null;
  authReady: boolean;
  authFailed: boolean;
}) {
  const router = useRouter();
  const client = useQueryClient();
  const audience = useAudienceSubmissions(identity, authReady);
  const data = audience.data;
  const { refetch } = audience;
  const opensAt = data?.voting_opens_at;
  const closesAt = data?.voting_deadline;
  const [now, setNow] = useState(() => Date.now());
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [queueCodes, setQueueCodes] = useState<string[] | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [watching, setWatching] = useState(!!identity || embedded);
  const [finished, setFinished] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [voteBurst, setVoteBurst] = useState<{
    choice: VoteChoice;
    id: number;
  } | null>(null);
  const voting = useRef(false);
  const lastVoteChoice = useRef<VoteChoice>("accept");
  const [notice, setNotice] = useState("");
  const [voteFailed, setVoteFailed] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const nav = useRef<HTMLElement | null>(null);
  const [navHeight, setNavHeight] = useState(64);
  const phase = data ? votingPhase(data, now) : null;
  const submissions = data?.submissions;
  const { unvoted } = useMemo(
    () => partitionSubmissions(submissions ?? []),
    [submissions],
  );
  const teams = useMemo(() => {
    if (reviewing) return submissions ?? [];
    if (queueCodes === null) return unvoted;
    const byCode = new Map(
      submissions?.map((entry) => [entry.team_code, entry]),
    );
    return queueCodes.flatMap((code) => {
      const entry = byCode.get(code);
      return entry ? [entry] : [];
    });
  }, [reviewing, submissions, queueCodes, unvoted]);
  const selectedIndex = teams.findIndex(
    (entry) => entry.team_code === selectedCode,
  );
  const index = Math.max(
    0,
    selectedIndex >= 0
      ? selectedIndex
      : reviewing
        ? 0
        : teams.findIndex((entry) => !entry.has_voted),
  );
  const team = teams[index];
  const introKey = `productplus:2026:arena-intro:v2:${identity}`;
  const loginHref = productPlusLoginPath(router.asPath);

  // Keep the current pitch in place after voting; new unvoted entries join the end.
  useEffect(() => {
    if (!submissions) return;
    setQueueCodes((current) => {
      if (current === null) return unvoted.map((entry) => entry.team_code);
      const known = new Set(current);
      const added = unvoted
        .filter((entry) => !known.has(entry.team_code))
        .map((entry) => entry.team_code);
      return added.length ? [...current, ...added] : current;
    });
  }, [submissions, unvoted]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!voteBurst) return;
    const timer = window.setTimeout(
      () => setVoteBurst(null),
      VOTE_BURST_DURATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [voteBurst]);

  // Re-read server config at each boundary, including the opening transition.
  useEffect(() => {
    if (!opensAt || !closesAt) return;
    const timers = [opensAt, closesAt].map((date) => {
      const delay = Date.parse(date) - Date.now();
      if (delay <= 0 || delay > 2147483646) return undefined;
      return window.setTimeout(() => {
        setNow(Date.now());
        void refetch();
      }, delay + 1);
    });
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [opensAt, closesAt, refetch]);

  useEffect(() => {
    if (!identity || phase !== "open") return;
    try {
      setIntroOpen(localStorage.getItem(introKey) !== "dismissed");
    } catch {
      setIntroOpen(true);
    }
  }, [identity, introKey, phase]);

  useEffect(() => {
    if (embedded) return;
    const element = nav.current;
    if (!element) return;
    const observer = new ResizeObserver(() =>
      setNavHeight(element.getBoundingClientRect().height),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [embedded]);

  useEffect(() => {
    if (embedded) return;
    let previousY = window.scrollY;
    const update = () => {
      const y = window.scrollY;
      setNavVisible(y <= 24 || y < previousY);
      previousY = y;
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [embedded]);

  function dismissIntro(open: boolean) {
    setIntroOpen(open);
    if (!open) {
      try {
        localStorage.setItem(introKey, "dismissed");
      } catch {
        /* Optional persistence. */
      }
    }
  }

  function navigate(nextIndex: number) {
    if (voting.current || nextIndex < 0) return;
    setNotice("");
    setVoteFailed(false);
    const next =
      reviewing || nextIndex < index
        ? teams[nextIndex]
        : teams.slice(nextIndex).find((entry) => !entry.has_voted);
    if (next) setSelectedCode(next.team_code);
    else setFinished(true);
  }

  async function vote(choice: VoteChoice) {
    if (
      !team ||
      reviewing ||
      voting.current ||
      team.has_voted ||
      phase !== "open"
    )
      return;
    if (!identity) {
      setLoginOpen(true);
      return;
    }
    voting.current = true;
    lastVoteChoice.current = choice;
    setPending(true);
    setNotice("");
    setVoteFailed(false);
    const code = team.team_code;
    setSelectedCode(code);
    try {
      await postAudienceVote(code, choice);
      client.setQueryData<AudienceResponse>(
        audienceQueryKey(identity),
        (current) =>
          current
            ? {
                ...current,
                submissions: current.submissions.map((entry) =>
                  entry.team_code === code
                    ? { ...entry, has_voted: true }
                    : entry,
                ),
              }
            : current,
      );
      setNotice(
        choice === "accept" ? "Upvote recorded." : "Downvote recorded.",
      );
      setVoteBurst((previous) => ({
        choice,
        id: (previous?.id ?? 0) + 1,
      }));
    } catch (error) {
      const status =
        error && typeof error === "object" && "status" in error
          ? error.status
          : null;
      if (status === 401 || error instanceof UnauthenticatedUserError) {
        setLoginOpen(true);
      } else if (status === 409 || status === 403) {
        // 409 can also mean the submission disappeared. Only lock if the read confirms a vote.
        try {
          const refreshed = await getAudienceSubmissions(identity);
          client.setQueryData(audienceQueryKey(identity), refreshed);
          if (
            refreshed.submissions.find((entry) => entry.team_code === code)
              ?.has_voted
          ) {
            setNotice(
              "You’ve already voted on this team. Your vote is locked.",
            );
          } else {
            setVoteFailed(true);
            setNotice(
              status === 403
                ? "Voting is unavailable. Please check the voting window."
                : "This submission changed. Please try again or continue to another team.",
            );
          }
        } catch {
          setVoteFailed(true);
          setNotice("Couldn’t confirm your voting status. Please try again.");
        }
      } else {
        setVoteFailed(true);
        setNotice("Couldn’t record your vote. Please try again.");
      }
    } finally {
      voting.current = false;
      setPending(false);
    }
  }

  const portalButton = (
    <ProductButton asChild variant="secondary">
      <Link href={`${PRODUCT_PLUS_COMPANION_PATH}/portal`}>Back to portal</Link>
    </ProductButton>
  );
  let content: ReactNode;
  if (!authReady || audience.isPending) {
    content = <ArenaState title="Loading Product Arena…" />;
  } else if (audience.isError && !data) {
    content = (
      <ArenaState
        title="Pitches couldn’t load"
        description="Please try again to load the teams and voting window."
      >
        <ProductButton onClick={() => void audience.refetch()}>
          Try again
        </ProductButton>
        {portalButton}
      </ArenaState>
    );
  } else if (phase === "upcoming") {
    content = (
      <ArenaState
        title="Voting opens soon"
        icon={<Lock aria-hidden="true" />}
        description={`Voting opens when submissions close on ${formatArenaDate(data!.voting_opens_at)}. Come back then to watch the pitches and cast your vote.`}
      >
        {portalButton}
      </ArenaState>
    );
  } else if (!submissions?.length) {
    content = (
      <ArenaState
        title="No pitches yet"
        description="There are no submitted pitches to watch. Check back soon."
      >
        <ProductButton onClick={() => void audience.refetch()}>
          Refresh pitches
        </ProductButton>
        {portalButton}
      </ArenaState>
    );
  } else if (
    finished ||
    !teams.length ||
    (!reviewing && selectedIndex < 0 && !unvoted.length)
  ) {
    content = (
      <ArenaState
        title={
          unvoted.length ? "You’ve reached the end" : "You’re all caught up"
        }
        icon={<Complete aria-hidden="true" />}
        description="Thanks for watching! Your votes help decide the Audience Award."
      >
        {portalButton}
        {unvoted.length && phase === "open" ? (
          <ProductButton
            onClick={() => {
              setReviewing(false);
              setFinished(false);
              setQueueCodes(unvoted.map((entry) => entry.team_code));
              setSelectedCode(unvoted[0].team_code);
              setNotice("");
              setVoteFailed(false);
            }}
          >
            Continue voting
          </ProductButton>
        ) : null}
        <ProductButton
          variant="secondary"
          onClick={() => {
            setFinished(false);
            setReviewing(true);
            setSelectedCode(submissions[0].team_code);
            setNotice("");
            setVoteFailed(false);
          }}
        >
          Rewatch all videos
        </ProductButton>
      </ArenaState>
    );
  } else if (!watching && phase === "open") {
    content = (
      <ArenaState
        title="Welcome to Product Arena"
        description="Watch the 1 minute pitch from every competing team, then Upvote or Downvote. Continue with your email to get started."
      >
        <ProductButton onClick={() => setLoginOpen(true)}>
          Continue with email to vote
        </ProductButton>
        <ProductButton variant="secondary" onClick={() => setWatching(true)}>
          Watch pitches
        </ProductButton>
      </ArenaState>
    );
  } else {
    const locked = team.has_voted === true;
    const canVote = phase === "open" && !reviewing && !locked && !pending;
    content = (
      <div
        className={cn(
          "relative mx-auto flex min-h-[calc(100dvh-var(--arena-top,80px))] w-[min(960px,max(320px,calc((100dvh-var(--arena-top,80px)-270px)*1.777778+44px)))] max-w-full flex-col gap-3 px-4 pb-4 max-[640px]:min-h-0 max-[640px]:w-full max-[640px]:flex-1 max-[640px]:justify-center max-[640px]:pt-4",
          embedded &&
            "max-[640px]:pb-[calc(108px+env(safe-area-inset-bottom))]",
        )}
      >
        {phase === "closed" || phase === "paused" ? (
          <GlassCard className="!rounded-[28px] !p-4 text-center" role="status">
            <h2 className="font-product-heading text-[24px]">
              {phase === "closed"
                ? "Voting has closed"
                : "Voting is currently unavailable"}
            </h2>
            <p className="mt-2 text-product-muted">
              You can still watch the pitches. Results stay private until the
              Audience Award is announced.
            </p>
            <ProductButton
              variant="secondary"
              className="mt-3"
              onClick={() => void audience.refetch()}
            >
              Refresh voting status
            </ProductButton>
          </GlassCard>
        ) : null}
        <ArenaPlayer
          key={team.team_code}
          team={team}
          position={index + 1}
          total={teams.length}
          pending={pending}
          onPrevious={() => navigate(index - 1)}
          onNext={() => navigate(index + 1)}
          onFinished={() => navigate(teams.length)}
        />
        {reviewing ? (
          <p
            role="status"
            className="text-center text-[13px] text-product-muted"
          >
            Rewatching all pitches. You&apos;ve already voted on this one!
          </p>
        ) : null}
        <div className="grid grid-cols-2 gap-4 max-[480px]:gap-3">
          <button
            type="button"
            disabled={!canVote || authFailed}
            onClick={() => void vote("reject")}
            className="flex h-10 items-center justify-center gap-2 [&>svg]:size-5 rounded-[28px] border border-[#eab9c3]/60 bg-[#fff1f2]/70 px-4 text-[14px] font-semibold text-[#9c5360] shadow-[0_4px_20px_rgba(156,83,96,0.08),inset_0_1px_2px_rgba(255,255,255,0.65)] backdrop-blur-[14.5px] enabled:hover:bg-[#ffe4e6]/80 enabled:active:bg-[#ffe4e6] disabled:cursor-default disabled:opacity-40 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-product-primary max-[480px]:h-11 max-[480px]:px-4"
          >
            <Upvote
              aria-hidden="true"
              className="rotate-180 [&_path]:stroke-current"
            />
            {pending && lastVoteChoice.current === "reject"
              ? "Voting…"
              : "Downvote"}
          </button>
          <button
            type="button"
            disabled={!canVote || authFailed}
            onClick={() => void vote("accept")}
            className="flex h-10 items-center justify-center gap-2 [&>svg]:size-5 rounded-[28px] border border-white/90 bg-[#e8e0ff] px-4 text-[14px] font-semibold text-product-primary shadow-[0_4px_10px_rgba(97,79,184,0.18),inset_0_1px_2px_rgba(255,255,255,0.8)] enabled:hover:bg-[#ddd2ff] enabled:active:bg-product-primary enabled:active:text-white disabled:cursor-default disabled:opacity-50 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-product-primary max-[480px]:h-11 max-[480px]:px-4"
          >
            <Upvote aria-hidden="true" />
            {pending && lastVoteChoice.current === "accept"
              ? "Voting…"
              : "Upvote"}
          </button>
        </div>
        {notice ? (
          <p
            role={voteFailed ? "alert" : "status"}
            className={cn(
              "rounded-full border border-white/70 bg-white/85 px-6 py-3 text-center",
              voteFailed ? "text-[#9c3030]" : "text-product-primary",
            )}
          >
            {notice}
            {voteFailed && canVote ? (
              <button
                type="button"
                onClick={() => void vote(lastVoteChoice.current)}
                className="ml-2 font-semibold underline underline-offset-4"
              >
                Retry vote
              </button>
            ) : null}
          </p>
        ) : null}
        {authFailed ? (
          <p
            role="alert"
            className="rounded-[28px] bg-white/70 p-4 text-center"
          >
            Your account status couldn’t load. You can watch pitches.{" "}
            <button
              type="button"
              className="underline"
              onClick={() =>
                void client.invalidateQueries({ queryKey: ["userAttributes"] })
              }
            >
              Retry account check
            </button>
          </p>
        ) : null}
        <p className="mt-auto rounded-[24px] border border-white/70 bg-white/60 px-4 py-2.5 text-center text-[12px] leading-4 text-product-muted shadow-[0_4px_20px_rgba(97,80,184,0.08)] backdrop-blur-[14.5px] max-[640px]:mt-1">
          Your vote is final and cannot be changed. Results stay private until
          the Audience Award is announced at Product+ Summit.
        </p>
      </div>
    );
  }

  return (
    <section
      className={cn(
        "relative isolate min-h-[100dvh] overflow-hidden bg-product-lavender text-product-ink max-[640px]:flex max-[640px]:flex-col",
        embedded
          ? "rounded-[32px] max-[640px]:rounded-none max-[640px]:min-h-[100dvh]"
          : "min-h-screen pt-[104px]",
      )}
      style={
        {
          "--arena-top": `${embedded ? 80 : navHeight + 40}px`,
          ...(embedded ? {} : { paddingTop: navHeight + 40 }),
        } as CSSProperties
      }
      aria-labelledby="arena-heading"
    >
      <ArenaBackdrop />
      {voteBurst ? (
        <ArenaVoteBurst key={voteBurst.id} choice={voteBurst.choice} />
      ) : null}
      {!embedded ? (
        <header
          ref={(element) => {
            nav.current = element;
            element?.toggleAttribute("inert", !navVisible);
          }}
          aria-hidden={!navVisible}
          className={cn(
            "fixed inset-x-6 top-6 z-30 flex min-h-16 items-center justify-between gap-6 rounded-[32px] border border-white/70 bg-white/60 px-6 py-2 shadow-[0_4px_20px_rgba(97,80,184,0.08),inset_0_1px_2px_rgba(255,255,255,0.65)] backdrop-blur-[14.5px] transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none max-[640px]:inset-x-4 max-[640px]:top-4 max-[640px]:grid max-[640px]:grid-cols-[1fr_auto] max-[640px]:gap-3 max-[640px]:px-4",
            !navVisible &&
              "pointer-events-none -translate-y-[calc(100%+24px)] opacity-0",
          )}
        >
          <Link
            href="/productplus/audience"
            aria-label="Product+ Arena"
            className="shrink-0 focus-visible:outline focus-visible:outline-product-primary"
          >
            <ArenaLogo aria-hidden="true" />
          </Link>
          <div className="flex items-center gap-4 max-[640px]:contents">
            {data && (identity || watching || phase !== "open") ? (
              <div className="flex items-center gap-3 max-[640px]:col-span-2 max-[640px]:row-start-2">
                <Calendar aria-hidden="true" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] text-product-muted">
                    Voting closes
                  </span>
                  <time
                    dateTime={data.voting_deadline}
                    className="text-[14px] font-semibold"
                  >
                    {formatArenaDate(data.voting_deadline)}
                  </time>
                </div>
              </div>
            ) : null}
            {!identity ? (
              <ProductButton
                variant="secondary"
                className="max-[640px]:col-start-2 max-[640px]:row-start-1"
                onClick={() => setLoginOpen(true)}
              >
                Log in
              </ProductButton>
            ) : null}
          </div>
        </header>
      ) : (
        <div className="relative z-[1] flex justify-end px-6 py-5 text-[13px] text-product-muted">
          {data ? (
            <>
              Voting closes&nbsp;
              <time dateTime={data.voting_deadline}>
                {formatArenaDate(data.voting_deadline)}
              </time>
            </>
          ) : null}
        </div>
      )}
      <div className="relative z-[1] max-[640px]:flex max-[640px]:flex-1 max-[640px]:flex-col">
        {content}
      </div>
      <ArenaModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        title="Log in to vote"
      >
        <ProductButton asChild className="min-w-[200px]">
          <Link href={loginHref}>Log in</Link>
        </ProductButton>
      </ArenaModal>
      <ArenaIntroModal open={introOpen} onOpenChange={dismissIntro} />
    </section>
  );
}

export default function ProductArenaPage({
  embedded = true,
}: {
  embedded?: boolean;
}) {
  const user = useUserAttributes();
  const identity = user.data?.sub ?? user.data?.email ?? null;
  return (
    <ArenaContent
      key={identity ?? "guest"}
      embedded={embedded}
      identity={identity}
      authReady={!user.isPending}
      authFailed={user.isError}
    />
  );
}
