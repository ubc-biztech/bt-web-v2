import typography from "./typography.module.css";
import { companyName, type MarketStage } from "./market";
import Image from "next/image";
import { AngledPanel } from "./BtxUI";
import { PriceChart } from "./PriceChart";
import { TopFunded } from "./TopFunded";
import type { Market } from "./seedApi";

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
  const open = stage === "open";
  const closed = stage === "closed";
  const title = launching
    ? "IPO is launching"
    : open
      ? "Seeding is open"
      : closed
        ? "Seeding is closed"
        : "Seeding hasn’t started";
  const description = launching
    ? "The market is paused while IPO prices are set. Trading opens in a moment."
    : open
      ? "Buy at a fixed price while the seed round is open. Selling opens at IPO."
      : closed
        ? "All seed windows have ended. Selling and open trading start when IPO launches on Pitch Day."
        : projects.length
          ? "Each team opens its own 30-minute seed window after kickoff. Browse the pitches while you wait."
          : "Companies show up here once teams create them. A team’s seed window starts when it chooses to start.";
  const featured = projects[0];

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {market.phase === "LIVE" && featured ? (
        <section className="flex min-h-96 flex-1 flex-col gap-4 rounded-3xl border border-[#82c3fb]/25 bg-[#0d1629] p-7">
          <h2 className={`${typography.display} text-[40px] font-medium`}>
            {companyName(featured)}{" "}
            {featured.ticker && (
              <small className="font-[family-name:var(--btx-font-space-grotesk)] text-[11px] text-sky-300">
                ${featured.ticker}
              </small>
            )}
          </h2>
          <PriceChart company={featured} now={now} ipoAt={market.ipoAt} />
        </section>
      ) : (
        <section
          className="flex min-h-80 flex-1 flex-col justify-end gap-4 rounded-3xl border border-[#82C3FB]/35 bg-cover bg-center p-5 lg:p-9"
          style={{
            backgroundImage:
              "linear-gradient(180deg, transparent 0%, rgba(3,9,19,.28) 40%, rgba(3,9,19,.95) 100%),url(/assets/btx/seed-hero.jpg)",
          }}
        >
          {!!projects.length && (
            <h2
              className={`${typography.display} text-[48px] font-medium tracking-tight xl:text-[64px] xl:leading-none`}
            >
              {title}
            </h2>
          )}
          <p className="text-[16px]">{description}</p>
          <MarketTimeline stage={stage} />
        </section>
      )}
      <TopFunded
        projects={projects}
        now={now}
        live={market.phase === "LIVE"}
        final={closed || launching}
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
        ? "Seed windows ended"
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
    ["live", "Live trading", "Buy + sell, open market"],
  ];

  return (
    <ol
      aria-label="Market stages"
      className="relative isolate max-w-[672px] grid grid-cols-3 gap-2 sm:gap-4 xl:gap-8 before:absolute before:inset-x-4 before:top-1/2 before:-z-10 before:h-0.5 before:bg-[#82C3FB]/35"
    >
      {stages.map(([icon, title, detail], index) => {
        const current = index === currentStep;
        return (
          <li
            key={icon}
            aria-current={current ? "step" : undefined}
            className="min-w-0 rounded-[18px] border border-white/[.12] bg-[#0A1429]/90 p-2 text-[#A8B5D6] sm:p-3 aria-[current=step]:border-[#1FBEF9]/80 aria-[current=step]:bg-[#0d3270]/90 aria-[current=step]:text-[#E6EBF6]"
          >
            <Image
              src={`/assets/btx/stages/${icon}.svg`}
              width={100}
              height={62}
              alt=""
              unoptimized
              className="mb-1 h-auto max-w-full"
            />
            <span className={`text-[11px] ${current ? "text-[#1FBEF9]" : ""}`}>
              0{index + 1}
            </span>
            <p className={`${typography.display} text-[15px] font-medium`}>
              {title}
            </p>
            <p className="mt-1 text-[12px]">{detail}</p>
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
      className="flex flex-col items-center gap-3.5 rounded-[20px] border border-[#82c3fb]/[.22] bg-[#17213f]/30 px-5 py-14 text-center leading-[normal] sm:px-10 sm:py-24"
    >
      <span
        aria-hidden="true"
        className="grid size-14 place-items-center rounded-full border border-[#ff5c7a]/50 bg-[#ff5c7a]/[.14] text-[24px] font-bold text-[#ff5c7a]"
      >
        !
      </span>
      <div role="alert" className="space-y-3.5">
        <h1
          id="btx-recovery-title"
          className={`${typography.display} text-[28px] font-medium text-[#e6ebf6]`}
        >
          We couldn’t load the exchange
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
    <div className="grid items-start gap-5 text-[#a8b5d6] lg:grid-cols-[minmax(0,804fr)_minmax(0,522fr)]">
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
                <Placeholder className="h-4 w-1/2 rounded-md" />
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

        <div className="grid grid-cols-2 gap-3">
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
  );
}
