import {
  type MarketStage,
  companyName,
  compactMoney,
  timeLeft,
  windowState,
  windowLabel,
} from "./market";
import { useCompanyTeam } from "./accountQueries";
import type { ReactNode } from "react";
import { CompanyPhoto } from "./BtxUI";
import type { Company } from "./seedApi";

export type CardProps = {
  company: Company;
  now: number;
  own: boolean;
  highlight: (value: string) => ReactNode;
  // Compact cards also reflect the event-wide state on the landing screen.
  stage: MarketStage;
};
const action = {
  ACTIVE: "Invest",
  NOT_STARTED: "Not open",
  ENDED: "Closed",
  LIVE: "Trade",
};
const badge = "rounded-full px-3 py-1 text-xs";
const imageArea =
  "relative grid w-full place-items-center bg-gradient-to-b from-[#1d2a50] to-[#131b32]";
function CompanyTitle({
  company,
  highlight,
}: Pick<CardProps, "company" | "highlight">) {
  return (
    <span className="flex flex-wrap items-center gap-2 font-medium">
      {highlight(companyName(company))}
      {company.ticker && (
        <small className="rounded-full border border-sky-400/50 bg-sky-400/10 px-2 py-0.5 text-xs text-[#1fbef9]">
          {highlight("$" + company.ticker)}
        </small>
      )}
    </span>
  );
}

export function ExchangeCard({
  company,
  now,
  own,
  stage,
  highlight,
}: CardProps) {
  const state = windowState(company, now);
  const before = stage === "waiting" && state === "NOT_STARTED";
  const after = stage === "closed" || stage === "launching";
  const amount = compactMoney(company.marketCapCents);
  const priceChange = (company.currentPriceCents - 10000) / 100;
  const summary = before
    ? "Opens after Kickoff"
    : after
      ? company.marketCapCents
        ? amount + " raised"
        : "No seed round"
      : state === "LIVE"
        ? compactMoney(company.currentPriceCents)
        : amount;
  const status = own
    ? "Yours"
    : after
      ? "Seed ended"
      : state === "LIVE"
        ? (priceChange >= 0 ? "+" : "") + priceChange.toFixed(1) + "%"
        : state === "ACTIVE"
          ? "● " + timeLeft(company, now)
          : windowLabel(company, now);
  return (
    <>
      <span className={imageArea + " aspect-[2.55]"}>
        <CompanyPhoto logo={company.logo} emblemSize={44} />
        {(own || (!before && !after)) && (
          <span
            className={
              "absolute right-2 top-2 border border-[#527096] bg-[#101c32] " +
              badge
            }
          >
            {own ? "Your team" : action[state]}
          </span>
        )}
      </span>
      <span className="flex flex-1 flex-col gap-2 p-3">
        <CompanyTitle company={company} highlight={highlight} />
        <span className="line-clamp-2 text-xs leading-4 text-[#bdc8e3]">
          {company.blurb || company.description}
        </span>
      </span>
      <span className="flex items-center justify-between gap-1 px-3 pb-3 text-sm">
        <span>{summary}</span>
        {(!before || own) && (
          <span
            className={
              badge +
              " border border-current/30 " +
              (own
                ? "bg-slate-400/15 text-[#a8b5d6]"
                : after || state === "ENDED"
                  ? "bg-amber-300/10 text-[#ffddad]"
                  : state === "ACTIVE" || (state === "LIVE" && priceChange >= 0)
                    ? "bg-emerald-400/10 text-[#38d3a2]"
                    : state === "LIVE"
                      ? "text-[#ff5c7a]"
                      : "text-[#a8b5d6]")
            }
          >
            {status}
          </span>
        )}
      </span>
    </>
  );
}

export function FullCatalogCard({ company, now, own, highlight }: CardProps) {
  const state = windowState(company, now);
  const team = useCompanyTeam(company.projectId);
  return (
    <>
      <span className={imageArea + " aspect-[2.45]"}>
        <CompanyPhoto logo={company.logo} emblemSize={60} />
        <span
          className={
            "absolute left-3 top-3 font-semibold text-[#0b1424] " +
            badge +
            " " +
            (own || state === "NOT_STARTED"
              ? "bg-[#8997bc]"
              : state === "ENDED"
                ? "bg-[#ffddad]"
                : "bg-[#38d3a2]")
          }
        >
          {own ? "Your team" : windowLabel(company, now)}
        </span>
        {!own && (state === "ACTIVE" || state === "LIVE") && (
          <span
            className={
              "absolute right-4 top-3 bg-[#82c3fb] font-semibold text-[#0b1120] " +
              badge
            }
          >
            {action[state]}
          </span>
        )}
      </span>
      <span className="flex min-h-[132px] flex-1 flex-col gap-2 p-4 text-xl">
        <CompanyTitle company={company} highlight={highlight} />
        <span className="line-clamp-2 text-sm italic text-[#bdc8e3]">
          {company.blurb || company.description}
        </span>
      </span>
      <span className="flex min-h-12 w-full items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
        <span className="flex -space-x-1" aria-label={team.data?.join(", ")}>
          {team.data?.map((name, i) => (
            <span
              key={i}
              title={name}
              className="grid size-6 place-items-center rounded-full border border-[#101b2d] bg-sky-600 text-xs text-white"
            >
              {name[0]}
            </span>
          ))}
        </span>
        <span className="text-sm">
          <small className="mr-2 text-[#a8b5d6]">
            {state === "LIVE" ? "Price" : "Seeded"}
          </small>
          {compactMoney(
            state === "LIVE"
              ? company.currentPriceCents
              : company.marketCapCents,
          )}
        </span>
      </span>
    </>
  );
}
