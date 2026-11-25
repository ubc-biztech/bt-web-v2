import styles from "./btx.module.css";
import { companyName, type MarketStage } from "./market";
import Image from "next/image";
import { AngledPanel, StatusBanner } from "./BtxUI";
import { PriceChart } from "./PriceChart";
import { TopFunded } from "./TopFunded";
import type { Market } from "./seedApi";

const seedStages = {
  open: {
    title: "Seeding is open",
    description:
      "Buy at a fixed price while the seed round is open. Selling opens at IPO.",
    badge: "● Seed round open",
    tone: "active",
  },
  closed: {
    title: "Seeding is closed",
    description: "Companies and their seed totals are still available to browse.",
    badge: "Seeding closed",
    tone: "ended",
  },
  launching: {
    title: "IPO is launching",
    description:
      "The market is paused while IPO prices are set. Trading opens in a moment.",
    badge: "IPO launching",
    tone: "accent",
  },
  waiting: {
    title: "Seeding hasn’t started",
    description:
      "Teams can open seed funding after kickoff. Browse the pitches while you wait.",
    badge: "Seeding not started",
    tone: "neutral",
  },
};

export function ExchangeOverview({
  market,
  now,
  stage,
}: {
  market: Market;
  now: number;
  stage: MarketStage;
}) {
  const projects = market.projects;
  const launching = stage === "launching";
  const seedStage = seedStages[stage === "live" ? "waiting" : stage];
  const description =
    projects.length || (stage !== "waiting" && stage !== "live")
      ? seedStage.description
      : "Companies show up here once teams create them. Buying opens as teams start seeding.";
  const featured = projects[0];

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {launching && (
        <div className="md:hidden">
          <StatusBanner
            tone="warning"
            title={seedStage.title}
            description={description}
          />
        </div>
      )}
      {market.phase === "LIVE" && featured ? (
        <section className="flex md:min-h-96 flex-1 flex-col gap-4 rounded-3xl border border-[#82c3fb]/25 bg-[#0d1629] p-4 md:p-7">
          <h2
            className={`${styles.display} text-[22px] md:text-[40px] font-medium`}
          >
            {companyName(featured)}{" "}
            {featured.ticker && (
              <small className="font-[family-name:var(--btx-font-space-grotesk)] text-[11px] text-sky-300">
                ${featured.ticker}
              </small>
            )}
          </h2>
          <span
            data-tone="active"
            className={styles.statusPill + " self-start md:hidden"}
          >
            ● Live
          </span>
          <PriceChart company={featured} now={now} ipoAt={market.ipoAt} />
        </section>
      ) : (
        <section
          className="max-md:contents md:flex md:min-h-80 flex-1 flex-col justify-end gap-4 rounded-3xl border border-[#82C3FB]/35 bg-cover bg-center p-5 lg:p-9"
          style={{
            backgroundImage:
              "linear-gradient(180deg, transparent 0%, rgba(3,9,19,.28) 40%, rgba(3,9,19,.95) 100%),url(/assets/btx/seed-hero.jpg)",
          }}
        >
          <div className="flex flex-col gap-2.5 rounded-[20px] border border-[#82c3fb]/35 bg-[#82c3fb]/5 p-4 md:contents">
            <span
              data-tone={seedStage.tone}
              className={styles.statusPill + " self-start md:hidden"}
            >
              {seedStage.badge}
            </span>
            {!!projects.length && (
              <h2
                className={`${styles.display} text-[22px] font-medium tracking-tight md:text-[48px] xl:text-[64px] xl:leading-none`}
              >
                {seedStage.title}
              </h2>
            )}
            <p className="text-[13px] md:text-[16px]">{description}</p>
          </div>
          <div className={stage === "live" ? "hidden md:contents" : "contents"}>
            <MarketTimeline stage={stage} />
          </div>
        </section>
      )}
      <TopFunded
        projects={projects}
        now={now}
        live={market.phase === "LIVE"}
        final={stage === "closed" || launching}
        launching={launching}
      />
    </div>
  );
}

function MarketTimeline({ stage }: { stage: MarketStage }) {
  const ipo = stage === "launching" || stage === "closed";
  const currentStep = stage === "live" ? 2 : ipo ? 1 : 0;
  const stages = [
    [
      "seeding",
      "Seeding",
      ipo
        ? "Seed round closed"
        : stage === "open"
          ? "Now: seed round"
          : "Opens after kickoff",
    ],
    [
      "ipo",
      "IPO",
      stage === "launching"
        ? "Launching now"
        : stage === "closed"
          ? "Next up: Pitch Day"
          : "Forced on Pitch Day",
    ],
    [
      "live",
      "Live trading",
      stage === "launching"
        ? "Opens right after IPO"
        : "Buy + sell, open market",
    ],
  ];

  return (
    <ol
      aria-label="Market stages"
      className="max-md:rounded-[20px] max-md:border max-md:border-[#82c3fb]/[.22] max-md:bg-[#82c3fb]/5 max-md:p-4 max-md:gap-3 relative isolate max-w-[672px] grid gap-2 md:grid-cols-3 md:gap-4 xl:gap-8 md:before:absolute md:before:inset-x-4 md:before:top-1/2 md:before:-z-10 md:before:h-0.5 md:before:bg-[#82C3FB]/35"
    >
      {stages.map(([icon, title, detail], index) => {
        const current = index === currentStep;
        return (
          <li
            key={icon}
            aria-current={current ? "step" : undefined}
            className="max-md:grid max-md:grid-cols-[auto_1fr_auto] max-md:items-center max-md:gap-x-3 max-md:!border-0 max-md:!bg-transparent max-md:p-0 min-w-0 rounded-[18px] border border-white/[.12] bg-[#0A1429]/90 p-2 text-[#A8B5D6] sm:p-3 aria-[current=step]:border-[#1FBEF9]/80 aria-[current=step]:bg-[#0d3270]/90 aria-[current=step]:text-[#E6EBF6]"
          >
            <Image
              src={`/assets/btx/stages/${icon}.svg`}
              width={100}
              height={62}
              alt=""
              unoptimized
              className="mb-1 hidden h-auto max-w-full md:block"
            />
            <span
              className={`max-md:row-span-2 max-md:font-bold max-md:text-[13px] text-[11px] ${current ? "text-[#1FBEF9]" : ""}`}
            >
              {index < currentStep ? "✓" : "0" + (index + 1)}
            </span>
            <p
              className={`${styles.display} max-md:font-[family-name:var(--btx-font-space-grotesk)] text-[15px] font-medium`}
            >
              {title}
            </p>
            <p className="max-md:col-start-2 max-md:row-start-2 md:mt-1 text-[12px]">
              {detail}
            </p>
            {current && (
              <span
                data-tone="accent"
                className={
                  styles.statusPill +
                  " col-start-3 row-start-1 row-span-2 md:hidden"
                }
              >
                Now
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Placeholder({ className }: { className: string }) {
  return (
    <div className={`bg-[#82C3FB]/10 motion-safe:animate-pulse ${className}`} />
  );
}

export function ExchangeRecovery({
  lastTriedAt,
  retrying,
  onRetry,
}: {
  lastTriedAt: number;
  retrying: boolean;
  onRetry: () => void;
}) {
  const lastTried = new Date(lastTriedAt);

  return (
    <section
      aria-labelledby="btx-recovery-title"
      className="flex flex-col items-center gap-3.5 rounded-[20px] border border-[#82c3fb]/[.22] bg-[#17213f]/30 px-5 py-14 text-center leading-[normal] md:px-10 md:py-24 max-md:items-stretch max-md:border-0 max-md:bg-transparent max-md:p-0 max-md:text-left"
    >
      <span
        aria-hidden="true"
        className="hidden size-14 place-items-center md:grid rounded-full border border-[#ff5c7a]/50 bg-[#ff5c7a]/[.14] text-[24px] font-bold text-[#ff5c7a]"
      >
        !
      </span>
      <div
        role="alert"
        className="space-y-1 rounded-[14px] border border-[#ff5c7a]/40 bg-[#ff5c7a]/10 p-4 md:space-y-3.5 md:border-0 md:bg-transparent md:p-0"
      >
        <h1
          id="btx-recovery-title"
          className={`${styles.display} text-[16px] font-medium text-[#e6ebf6] md:text-[28px]`}
        >
          <span
            aria-hidden="true"
            className="mr-2 inline-grid size-5 place-items-center rounded-full bg-[#ff5c7a]/20 text-xs text-[#ff5c7a] md:hidden"
          >
            !
          </span>
          Couldn’t load the exchange
        </h1>
        <p className="text-[14px] text-[#a8b5d6]">
          We couldn’t reach BTX. Your cash and holdings are safe. Check your
          connection and try again.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className="rounded-full border border-[#82c3fb]/40 bg-[#1fbef9] px-[22px] py-[13px] text-[14px] font-medium text-[#0b1120] disabled:opacity-60"
      >
        {retrying ? "Trying again…" : "Try again"}
      </button>
      <p role="status" className="text-[12px] text-[#9eabcb]">
        Last tried{" "}
        <time dateTime={lastTried.toISOString()}>
          {lastTried.toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
          })}
        </time>
      </p>
    </section>
  );
}

export function ExchangeLoading() {
  return (
    <>
      <div
        role="status"
        aria-label="Loading the exchange"
        className="space-y-4 md:hidden"
      >
        <Placeholder className="h-[110px] w-[100px] rounded-[10px]" />
        {[0, 1].map((index) => (
          <div
            key={index}
            aria-hidden="true"
            className="overflow-hidden rounded-[20px] border border-[#82c3fb]/[.22] bg-[#82c3fb]/5"
          >
            <Placeholder className="h-[150px] w-[100px] rounded-[10px]" />
            <div className="space-y-2.5 p-4">
              <Placeholder className="h-[18px] w-40 rounded" />
              <Placeholder className="h-3 w-[100px] rounded" />
              <Placeholder className="h-3 w-[200px] max-w-full rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="hidden md:grid items-start gap-5 text-[#a8b5d6] lg:grid-cols-[minmax(0,804fr)_minmax(0,522fr)]">
        <div className="min-w-0">
          <div aria-hidden="true" className="space-y-4">
            <Placeholder className="h-14 w-[56%] rounded-xl" />
            <Placeholder className="h-[18px] rounded-md" />
            <Placeholder className="h-36 w-5/6 rounded-[20px]" />

            <div className="flex items-center justify-between pt-1">
              <Placeholder className="h-6 w-[105px] rounded-lg" />
              <Placeholder className="h-3 w-[77px] rounded-md" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="space-y-2.5 rounded-[20px] border border-[#82C3FB]/15 bg-[#17213F]/30 p-3 sm:p-4"
                >
                  <Placeholder className="h-[18px] w-40 rounded-md" />
                  <Placeholder className="h-3 rounded-md" />
                </div>
              ))}
            </div>
          </div>

          <p role="status" className="mt-4 text-[14px]">
            Loading the exchange…
          </p>
        </div>

        <AngledPanel aria-hidden="true">
          <div className="mb-3.5 flex items-center justify-between gap-3">
            <Placeholder className="h-6 w-[30%] rounded-lg" />
            <Placeholder className="h-9 w-1/4 rounded-full" />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className="min-w-0 space-y-2.5 rounded-[20px] border border-[#82C3FB]/15 bg-[#17213F]/30 p-3.5"
              >
                <Placeholder className="aspect-[202/86] rounded-xl" />
                <Placeholder className="h-3.5 w-[55%] rounded-md" />
                <Placeholder className="h-2.5 rounded-md" />
                <Placeholder className="h-[22px] w-[35%] rounded-full" />
              </div>
            ))}
          </div>
        </AngledPanel>
      </div>
    </>
  );
}
