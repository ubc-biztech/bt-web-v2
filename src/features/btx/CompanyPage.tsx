import styles from "./btx.module.css";
import { MobileTradeSheet } from "./MobileTradeSheet";
import { TradeTicket } from "./TradeTicket";
import { compactMoney, countdown, companyName, exchangePath } from "./market";
import { useCompanyTeam } from "./accountQueries";
import { useTradeOrder } from "./useTradeOrder";
import type { MarketPageProps } from "./Kickstart2026";

import Link from "next/link";
import { useRouter } from "next/router";
import { CompanyPitch, AngledPanel, StatusBanner } from "./BtxUI";

import { PriceChart } from "./PriceChart";

const chip =
  "inline-flex items-center rounded-full border border-[#527096] px-3 font-medium";
const panel = "rounded-3xl border border-[#324a68] bg-[#0d1628]";

export function CompanyPage({
  market,
  now,
  userId,
  projectId = "",
  ownProject,
  quoteVersion = 0,
}: MarketPageProps) {
  const { query } = useRouter();
  const initialSide =
    query.side === "sell" && market.phase === "LIVE" ? "SELL" : "BUY";
  const team = useCompanyTeam(projectId);
  const ticket = useTradeOrder(
    userId,
    market,
    projectId,
    now,
    ownProject === projectId,
    quoteVersion,
    initialSide,
  );
  const company = ticket.company;
  if (!company)
    return <StatusBanner tone="warning" title="Company not found" />;
  const live = market.phase === "LIVE";
  const launching = market.phase === "IPO_PREPARING";
  const notStarted = company.seedStatus === "NOT_STARTED";
  const seedSeconds = notStarted
    ? 1800
    : Math.max(
        0,
        Math.ceil(
          (Math.min(company.seedEndsAt ?? now, market.eventEndsAt) - now) /
            1000,
        ),
      );
  const stage = live
    ? "Live"
    : launching
      ? "IPO launching"
      : notStarted
        ? "Seed not started"
        : ticket.seedOpen
          ? "Seed round open"
          : "Seed round ended";
  const unavailable =
    ticket.ownCompany ||
    now >= market.eventEndsAt ||
    (!live && !ticket.seedOpen);
  const hasOrder = !!ticket.order || !!ticket.notice;
  const tradeAction = hasOrder
    ? "View order"
    : launching
      ? "Trading paused"
      : unavailable
        ? "Buy unavailable"
        : live
          ? "Trade"
          : "Invest";
  return (
    <div className="grid gap-5 pb-[76px] md:pb-0 lg:grid-cols-[minmax(0,804fr)_minmax(0,522fr)]">
      <div className="flex min-w-0 flex-col gap-4">
        <Link
          href={exchangePath + "/catalog"}
          className="text-[13px] font-medium text-[#89dcff] md:hidden"
        >
          ← Back to catalog
        </Link>
        <section
          className={
            panel +
            " max-md:contents flex md:min-h-[380px] flex-1 flex-col gap-5 bg-gradient-to-b from-[#15263c] to-[#0d1528] p-4 sm:p-7 lg:min-h-[560px]"
          }
        >
          <header className="flex flex-wrap items-center gap-3">
            <h1
              className={`${styles.display} text-[28px] font-medium leading-[normal] lg:text-[38px]`}
            >
              {companyName(company)}
            </h1>
            {company.ticker && (
              <span
                className={
                  chip +
                  " max-md:rounded-none max-md:border-0 max-md:bg-transparent max-md:p-0 border-[#1fbef9]/50 bg-[#1fbef9]/10 py-1 text-[14px] text-[#1fbef9] lg:text-[11px]"
                }
              >
                ${company.ticker}
              </span>
            )}
            <span
              data-tone={
                launching
                  ? "accent"
                  : live || ticket.seedOpen
                    ? "active"
                    : notStarted
                      ? "neutral"
                      : "ended"
              }
              className={
                styles.statusPill +
                " " +
                chip +
                " ml-auto py-1 text-[11px] " +
                (ticket.seedOpen || live
                  ? "border-[#38d3a2]/50 bg-[#38d3a2]/10 text-[#38d3a2]"
                  : "text-[#a8b5d6]")
              }
            >
              ● {stage}
            </span>
          </header>
          {live ? (
            <div className="rounded-[20px] border border-[#82c3fb]/25 bg-[#82c3fb]/5 p-4 md:contents">
              <PriceChart company={company} now={now} ipoAt={market.ipoAt} />
            </div>
          ) : (
            <div className="max-md:contents md:mt-auto md:space-y-5">
              {!ticket.seedOpen && (
                <div className="md:hidden">
                  <StatusBanner
                    tone="warning"
                    title={
                      launching
                        ? "IPO is launching"
                        : notStarted
                          ? "This team hasn’t started seeding"
                          : "Seed window ended"
                    }
                    description={
                      launching
                        ? "Trading is paused for a moment while prices go live. This page will update on its own."
                        : notStarted
                          ? "Buying opens once a team member starts their 30-minute seed window."
                          : "Buying has closed for this team. Selling opens when the IPO launches."
                    }
                  />
                </div>
              )}
              <div className="flex flex-col gap-2 rounded-[20px] border border-[#89dcff]/35 bg-[#82c3fb]/5 p-4 md:contents">
                <p className="max-md:order-last text-[12px] text-[#1fbef9]">
                  {ticket.seedOpen || notStarted
                    ? "No price lines in seeding. Invest off the pitch"
                    : "Price chart appears after IPO."}
                </p>
                <div className="flex max-md:flex-col md:flex-wrap md:items-baseline md:gap-4">
                  <span
                    className={`${styles.display} max-md:font-[family-name:var(--btx-font-space-grotesk)] max-md:font-bold text-[34px] font-medium leading-[normal] md:text-[64px] tabular-nums text-white lg:text-[96px]`}
                  >
                    {launching ? "IPO" : countdown(seedSeconds)}
                  </span>
                  <span className="text-[13px] md:text-[15px]">
                    {launching
                      ? "setting opening prices"
                      : notStarted
                        ? "seed window, once the team starts"
                        : ticket.seedOpen
                          ? "left in seed window"
                          : "seed window closed"}
                  </span>
                </div>
              </div>
              <progress
                aria-label="Seed window elapsed"
                max={1800}
                value={launching ? 1800 : Math.max(0, 1800 - seedSeconds)}
                className="hidden md:block h-2 w-full appearance-none overflow-hidden rounded-full border-0 bg-[#303849] [&::-webkit-progress-bar]:bg-[#303849] [&::-webkit-progress-value]:bg-[#1fbef9] [&::-moz-progress-bar]:bg-[#1fbef9]"
              />
              <dl className="max-md:rounded-[20px] max-md:border max-md:border-[#82c3fb]/[.22] max-md:bg-[#82c3fb]/5 max-md:p-4 grid gap-3 text-[14px] max-md:[&>div]:flex max-md:[&>div]:items-center max-md:[&>div]:justify-between md:flex md:gap-8 md:text-[24px]">
                <div>
                  <dt className="text-[11px] text-[#a8b5d6]">Seed funding</dt>
                  <dd className={`${styles.display} font-medium`}>
                    {compactMoney(company.marketCapCents)}
                  </dd>
                </div>
                {company.netShares != null && (
                  <div>
                    <dt className="text-[11px] text-[#a8b5d6]">
                      Shares seeded
                    </dt>
                    <dd className={`${styles.display} font-medium`}>
                      {company.netShares.toLocaleString()} / 5,000
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </section>
        <MobileTradeSheet
          company={company}
          live={live}
          action={tradeAction}
          disabled={unavailable && !hasOrder}
        >
          {(onClose) => (
            <TradeTicket
              onClose={onClose}
              market={market}
              company={company}
              userId={userId}
              ticket={ticket}
            />
          )}
        </MobileTradeSheet>
      </div>
      <AngledPanel className="space-y-4">
        <header className="hidden items-center justify-between md:flex">
          <Link
            className={chip + " py-2 text-[13px]"}
            href={exchangePath + "/catalog"}
          >
            ← Back to catalog
          </Link>
          {ticket.seedOpen && !ticket.ownCompany && (
            <span className="rounded-full bg-[#82c3fb] px-3 py-1 text-[11px] font-medium text-[#0b1120]">
              Invest
            </span>
          )}
        </header>
        <CompanyPitch company={company} />
        {(company.blurb || company.description) && (
          <section className="rounded-2xl border border-[#263850] bg-[#090f1b] p-4">
            <h2 className="mb-2 text-[16px] font-medium text-[#1fbef9] lg:text-[11px] lg:font-normal">
              Blurb
            </h2>
            <p className="text-[14px] lg:font-[family-name:var(--btx-font-instrument-sans)] lg:text-[17px] lg:font-medium">
              {company.blurb || company.description}
            </p>
          </section>
        )}
        <section className="rounded-2xl border border-[#263850] bg-[#090f1b] p-4">
          <h2 className="mb-4 text-[16px] font-medium text-[#1fbef9] lg:text-[11px] lg:font-normal">
            Team
          </h2>
          {team.isLoading ? (
            <p role="status" className="text-[14px]">
              Loading team…
            </p>
          ) : team.isError ? (
            <StatusBanner
              tone="error"
              title="Couldn’t load team"
              onRetry={() => team.refetch()}
            />
          ) : team.data?.length ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {team.data.map((name, index) => (
                <li
                  key={name + index}
                  className="flex items-center gap-3 text-[14px] font-medium lg:text-[13px]"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#1fbef9] to-[#276aca] text-[10px] font-bold text-white lg:text-[12px]"
                  >
                    {name
                      .split(/\s+/)
                      .map((part) => part[0])
                      .filter(
                        (_, i, parts) => i === 0 || i === parts.length - 1,
                      )
                      .join("")
                      .toUpperCase()}
                  </span>
                  {name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[14px] text-[#a8b5d6]">
              {userId ? "No team members listed." : "Sign in to see the team."}
            </p>
          )}
        </section>
      </AngledPanel>
    </div>
  );
}
