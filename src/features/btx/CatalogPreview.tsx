import Link from "next/link";
import { catalogPill, CompanyPitch } from "./BtxUI";
import {
  compactMoney,
  companyName,
  exchangePath,
  windowLabel,
  windowState,
  windowPillTone,
  type MarketStage,
} from "./market";
import type { Company } from "./seedApi";
import styles from "./btx.module.css";

export function CatalogPreview({
  company,
  now,
  stage,
  ownProject,
  onClose,
}: {
  company: Company;
  now: number;
  stage: MarketStage;
  ownProject?: string;
  onClose: () => void;
}) {
  const state = windowState(company, now);
  const companyPath =
    exchangePath + "/company/" + encodeURIComponent(company.projectId);
  const canTrade =
    company.projectId !== ownProject &&
    (stage === "live" || (stage === "open" && state === "ACTIVE"));
  const sharesSeeded =
    company.seedStatus === "LIVE" ? company.seedSharesAtIpo : company.netShares;
  // Whole-share seed buys identify the investor count only at zero or one share.
  const seedInvestors =
    sharesSeeded === 0 || sharesSeeded === 1 ? sharesSeeded : "Unavailable";
  return (
    <div className="max-md:space-y-5 md:flex md:flex-col md:gap-5 px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-3 md:min-h-full md:p-7">
      <div
        aria-hidden="true"
        className="mx-auto h-1 w-10 rounded-full bg-[#52617d] md:hidden"
      />
      <header className="flex items-center justify-between max-md:float-right">
        <span className="hidden md:inline text-[12px] text-slate-400">
          Preview
        </span>
        <button
          aria-label="Close preview"
          className={catalogPill}
          onClick={onClose}
        >
          ×
        </button>
      </header>
      <h2
        id="catalog-preview-title"
        className={`${styles.display} text-[22px] md:text-[38px] font-medium leading-[normal]`}
      >
        {companyName(company)}{" "}
        {company.ticker && (
          <small className="max-md:block max-md:border-0 max-md:p-0 rounded-full border border-sky-400/50 px-2 py-1 align-middle font-[family-name:var(--btx-font-space-grotesk)] text-[11px] text-sky-300">
            ${company.ticker}
          </small>
        )}
        <span
          data-tone={windowPillTone(state)}
          className={
            styles.statusPill +
            " max-md:mt-2 max-md:inline-block md:ml-2 rounded-full border border-[#82C3FB]/35 px-3 py-1 align-middle font-[family-name:var(--btx-font-space-grotesk)] text-[11px] text-sky-200"
          }
        >
          {(state === "ACTIVE" || state === "LIVE") && (
            <span className="md:hidden">● </span>
          )}
          {windowLabel(company, now)}
        </span>
      </h2>
      <CompanyPitch company={company} />
      <p className="text-[13px] md:text-[15px]">
        {company.blurb || company.description}
      </p>
      <dl className="grid grid-cols-3 gap-2 max-md:[&>div]:rounded-xl max-md:[&>div]:border max-md:[&>div]:border-white/15 max-md:[&>div]:p-2 md:flex md:flex-wrap md:justify-between md:gap-4 md:rounded-xl md:border md:border-white/15 md:p-4 md:text-[18px] font-medium">
        <div>
          <dt className="text-[11px] font-normal text-slate-400">
            {company.seedStatus === "LIVE" ? "Market cap" : "Seed funding"}
          </dt>
          <dd>{compactMoney(company.marketCapCents)}</dd>
        </div>
        {sharesSeeded != null && (
          <div>
            <dt className="text-[11px] font-normal text-[#a8b5d6]">
              Shares seeded
            </dt>
            <dd>{sharesSeeded.toLocaleString()} / 5,000</dd>
          </div>
        )}
        <div>
          <dt className="text-[11px] font-normal text-[#a8b5d6]">Investors</dt>
          <dd>{seedInvestors}</dd>
        </div>
        <div className="hidden md:block">
          <dt className="text-[11px] font-normal text-slate-400">Window</dt>
          <dd>{windowLabel(company, now)}</dd>
        </div>
      </dl>
      {state === "ACTIVE" && (
        <p className="hidden md:block rounded-xl border border-sky-300/25 bg-sky-300/10 p-3 text-[12px]">
          Buy at a fixed {compactMoney(company.currentPriceCents)} while the
          window is open. Selling opens at IPO. Trade from the full page.
        </p>
      )}
      <div className="flex flex-col gap-3 md:mt-auto md:flex-row">
        {canTrade && (
          <Link
            className="rounded-full bg-[#1fbef9] py-3 text-center font-medium text-[#0b1120] md:hidden"
            href={companyPath + "?trade=1"}
          >
            {stage === "live" ? "Trade" : "Invest"}
          </Link>
        )}
        <Link
          className="flex-1 rounded-full border border-[#527096] py-3 text-center font-medium md:bg-[#1fbef9] md:text-[#0b1120]"
          href={companyPath}
        >
          View full page<span className="hidden md:inline"> →</span>
        </Link>
        <button className={catalogPill + " hidden md:block"} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
