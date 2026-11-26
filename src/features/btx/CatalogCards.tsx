import styles from "./btx.module.css";
import {
  type MarketStage,
  companyName,
  compactMoney,
  percent,
  listingState,
  listingLabel,
  listingPillTone,
} from "./market";
import { useCompanyTeam } from "./accountQueries";
import type { ReactNode } from "react";
import { CompanyPhoto } from "./BtxUI";
import type { Company } from "./seedApi";

export type CardProps = {
  company: Company;
  own: boolean;
  highlight: (value: string) => ReactNode;
  stage: MarketStage;
};
const action = {
  ACTIVE: "Invest",
  PAUSED: "Paused",
  ENDED: "Closed",
  LIVE: "Trade",
};
const badge = "rounded-full px-3 py-1 text-[11px] font-medium";
const imageArea =
  "relative grid w-full place-items-center bg-gradient-to-b from-[#1d2a50] to-[#131b32]";
function CompanyTitle({
  company,
  highlight,
}: Pick<CardProps, "company" | "highlight">) {
  return (
    <span className="flex flex-wrap items-center gap-2 font-medium">
      <span
        className={
          styles.display +
          " max-md:font-[family-name:var(--btx-font-space-grotesk)] max-md:text-[18px]"
        }
      >
        {highlight(companyName(company))}
      </span>
      {company.ticker && (
        <small className="max-md:border-0 max-md:bg-transparent max-md:p-0 max-md:text-[13px] rounded-full border border-sky-400/50 bg-sky-400/10 px-2 py-0.5 text-[11px] text-[#1fbef9]">
          {highlight("$" + company.ticker)}
        </small>
      )}
    </span>
  );
}

export function MobileCatalogCard({
  company,
  own,
  highlight,
  stage,
}: CardProps) {
  const state = listingState(company, stage);
  const open = state === "ACTIVE" || state === "LIVE";
  const status = (open ? "● " : "") + listingLabel(state);

  return (
    <span className="flex w-full flex-col md:hidden">
      <span className={imageArea + " h-[150px] overflow-hidden"}>
        {company.logo && <CompanyPhoto logo={company.logo} emblemSize={44} />}
        <span className="absolute inset-x-3 bottom-2.5 flex items-center justify-between">
          <span
            className={styles.statusPill}
            data-tone={listingPillTone(state)}
          >
            {status}
          </span>
          {own && (
            <span className={styles.statusPill} data-tone="accent">
              Your team
            </span>
          )}
        </span>
      </span>
      <span className="flex flex-col gap-2 px-4 py-3.5">
        <CompanyTitle company={company} highlight={highlight} />
        <span className="text-[13px] text-[#a8b5d6]">
          {company.blurb || company.description}
        </span>
        <span className="flex items-center justify-between gap-2 pt-1">
          <span className="flex flex-col">
            <strong className="text-[16px] font-bold">
              {state === "PAUSED"
                ? "—"
                : compactMoney(
                    state === "LIVE"
                      ? company.currentPriceCents
                      : company.marketCapCents,
                  )}
            </strong>
            <small className="text-[#9eabcb]">
              {state === "LIVE"
                ? percent((company.currentPriceCents - 10000) / 10000)
                : state === "PAUSED"
                  ? "paused"
                  : "seeded"}
            </small>
          </span>
          <span
            className={
              "rounded-full border px-[18px] py-[9px] text-[13px] leading-[normal] font-medium " +
              (!own && open
                ? "border-[#82c3fb]/40 bg-[#1fbef9] text-[#0b1120]"
                : "border-[#82c3fb]/15 bg-[#82c3fb]/5 text-[#9eabcb]")
            }
          >
            {own ? "Yours" : action[state]}
          </span>
        </span>
      </span>
    </span>
  );
}

export function ExchangeCard({ company, own, stage, highlight }: CardProps) {
  const state = listingState(company, stage);
  const open = state === "ACTIVE" || state === "LIVE";
  const amount = compactMoney(company.marketCapCents);
  const priceChange = (company.currentPriceCents - 10000) / 100;
  const summary =
    state === "LIVE"
      ? compactMoney(company.currentPriceCents)
      : state === "PAUSED"
        ? "—"
        : amount + " raised";
  const status = own
    ? "Yours"
    : state === "LIVE"
      ? (priceChange >= 0 ? "+" : "") + priceChange.toFixed(1) + "%"
      : listingLabel(state);
  return (
    <>
      <span className={imageArea + " aspect-[2.55]"}>
        <CompanyPhoto logo={company.logo} emblemSize={44} />
        {(own || open) && (
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
      <span className="flex flex-1 flex-col gap-2 p-3 text-[15px]">
        <CompanyTitle company={company} highlight={highlight} />
        <span className="line-clamp-2 text-[11px] font-normal leading-4 text-[#bdc8e3]">
          {company.blurb || company.description}
        </span>
      </span>
      <span className="flex items-center justify-between gap-1 px-3 pb-3 text-[12px] font-medium">
        <span>{summary}</span>
        <span
          className={
            badge +
            " border border-current/30 " +
            (own
              ? "bg-slate-400/15 text-[#a8b5d6]"
              : !open
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
      </span>
    </>
  );
}

export function FullCatalogCard({ company, stage, own, highlight }: CardProps) {
  const state = listingState(company, stage);
  const team = useCompanyTeam(company.projectId);
  return (
    <>
      <span className={imageArea + " aspect-[2.45]"}>
        <CompanyPhoto logo={company.logo} emblemSize={60} />
        <span
          className={
            "absolute left-3 top-3 text-[#0b1424] " +
            badge +
            " " +
            (own || state === "PAUSED"
              ? "bg-[#8997bc]"
              : state === "ENDED"
                ? "bg-[#ffddad]"
                : "bg-[#38d3a2]")
          }
        >
          {own ? "Your team" : listingLabel(state)}
        </span>
        {!own && (state === "ACTIVE" || state === "LIVE") && (
          <span
            className={
              "absolute right-4 top-3 bg-[#82c3fb] text-[#0b1120] " + badge
            }
          >
            {action[state]}
          </span>
        )}
      </span>
      <span className="flex min-h-[132px] flex-1 flex-col gap-2 p-4 text-[20px]">
        <CompanyTitle company={company} highlight={highlight} />
        <span className="line-clamp-2 text-[14px] italic text-[#bdc8e3]">
          {company.blurb || company.description}
        </span>
      </span>
      <span className="flex min-h-12 w-full items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
        <span className="flex -space-x-1" aria-label={team.data?.join(", ")}>
          {team.data?.map((name, i) => (
            <span
              key={i}
              title={name}
              className="grid size-6 place-items-center rounded-full border border-[#101b2d] bg-sky-600 text-[12px] text-white"
            >
              {name[0]}
            </span>
          ))}
        </span>
        <span className="text-[14px]">
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
