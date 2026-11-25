import Link, { type LinkProps } from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, type ReactNode } from "react";
import { usePortfolio } from "./accountQueries";
import {
  MobileHistory,
  MobileHoldings,
  sellPath,
  tradeTime,
  SignedAmount,
  CompanyLabel,
  outline,
} from "./PortfolioRows";
import styles from "./Portfolio.module.css";
import { MobilePageTitle, StatusBanner } from "./BtxUI";
import type { MarketPageProps } from "./Kickstart2026";
import { exchangePath, money } from "./market";
import { accountTrades } from "./seedApi";

const portfolioPath = exchangePath + "/portfolio";
const historyPath = portfolioPath + "/history";
const panel =
  "overflow-hidden rounded-[20px] border border-[#82c3fb]/[.22] bg-[#17213f]/30";
const cell = "px-4 py-3";
const numeric = cell + " text-right tabular-nums";
const primary =
  "inline-flex rounded-full bg-[#1fbef9] px-4 py-2 text-sm font-medium text-[#081221]";
function signed(cents: number) {
  return (cents > 0 ? "+" : "") + money(cents);
}

function PortfolioFrame({
  isAdmin,
  initials,
  history = false,
  children,
}: {
  isAdmin: MarketPageProps["isAdmin"];
  initials?: string;
  history?: boolean;
  children: ReactNode;
}) {
  if (isAdmin === undefined) {
    return <StatusBanner tone="info" title="Checking access…" />;
  }
  if (isAdmin) {
    return (
      <StatusBanner
        tone="info"
        title="Portfolio is available to participants"
      />
    );
  }

  const detail = history
    ? "Every buy and sell for KickStart."
    : "Your holdings and cash for KickStart.";
  return (
    <div className="mx-auto w-full max-w-[1344px] space-y-4 max-sm:px-2 md:space-y-5 lg:pt-7">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <MobilePageTitle
          title="Portfolio"
          detail={detail}
          initials={initials}
        />
        <div className="hidden md:block">
          <h1 className={styles.title}>Portfolio</h1>
          <p className="mt-1 text-sm text-[#a8b5d6]">{detail}</p>
        </div>
        <nav
          aria-label="Portfolio views"
          className="inline-flex rounded-full bg-[#091121] p-1 text-sm"
        >
          {[
            [portfolioPath, "Holdings"],
            [historyPath, "History"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={
                href === (history ? historyPath : portfolioPath)
                  ? "page"
                  : undefined
              }
              className="flex-1 text-center rounded-full px-5 py-2 aria-[current=page]:bg-[#89dcff] aria-[current=page]:text-[#081221]"
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}

function EmptyPanel({
  title,
  description,
  href,
  action,
  icon,
}: {
  title: string;
  description?: string;
  href?: LinkProps["href"];
  action?: string;
  icon?: string;
}) {
  return (
    <div
      className={
        panel + " grid place-items-center gap-3 px-5 py-14 text-center"
      }
    >
      {icon && (
        <span
          aria-hidden
          className="grid size-12 place-items-center rounded-full bg-[#1fbef9]/10 text-2xl text-[#89dcff]"
        >
          {icon}
        </span>
      )}
      <h2 className="text-xl font-medium">{title}</h2>
      {description && <p className="text-sm text-[#a8b5d6]">{description}</p>}
      {href && (
        <Link className={primary} href={href}>
          {action}
        </Link>
      )}
    </div>
  );
}

export function PortfolioPage({
  market,
  userId,
  isAdmin,
  now,
  initials,
}: MarketPageProps) {
  const result = usePortfolio(market.eventId, userId, isAdmin === false, 15000);
  const data = result.data;
  const sellOpen = market.phase === "LIVE" && now < market.eventEndsAt;
  const holdings = data?.holdings.filter(({ shares }) => shares > 0) ?? [];

  return (
    <PortfolioFrame isAdmin={isAdmin} initials={initials}>
      {!userId ? (
        <EmptyPanel
          title="Sign in to view your portfolio"
          href={{ pathname: "/login", query: { redirect: portfolioPath } }}
          action="Sign in"
        />
      ) : !data ? (
        result.isError ? (
          <StatusBanner
            tone="error"
            title="Couldn’t load your portfolio"
            description={result.error.message}
            onRetry={() => result.refetch()}
          />
        ) : (
          <StatusBanner tone="info" title="Loading portfolio…" />
        )
      ) : (
        <>
          <dl className={styles.summary}>
            {(
              [
                [
                  "Portfolio value",
                  data.totalPortfolioValueCents,
                  "Cash + holdings",
                ],
                [
                  "Cash",
                  data.account.cashBalanceCents,
                  market.phase === "LIVE"
                    ? "Available to trade"
                    : "Available to buy",
                ],
                [
                  "Holdings value",
                  data.totalEquityValueCents,
                  holdings.length
                    ? `${holdings.length} ${holdings.length === 1 ? "company" : "companies"}`
                    : "No companies yet",
                ],
                [
                  "Total profit / loss",
                  data.totalPnlCents,
                  `Realized ${signed(data.realizedPnlCents)} · Unrealized ${signed(data.unrealizedPnlCents)}`,
                ],
              ] as const
            ).map(([label, cents, note]) => (
              <div className={styles.stat} key={label}>
                <dt className="text-[12px] text-[#a8b5d6]">{label}</dt>
                <dd className="my-1 tabular-nums">
                  {label === "Total profit / loss" ? (
                    <SignedAmount cents={cents} positiveSign />
                  ) : (
                    money(cents)
                  )}
                </dd>
                <dd className="text-[12px] text-[#a8b5d6]">{note}</dd>
              </div>
            ))}
          </dl>
          {!holdings.length ? (
            <>
              <div className="md:hidden">
                <EmptyPanel
                  title="No holdings yet"
                  description={
                    market.phase === "LIVE"
                      ? "Buy shares in a company and it will show up here."
                      : "Invest in a company during its seed window and it will show up here."
                  }
                  href={exchangePath + "/catalog"}
                  action="Browse catalog"
                />
              </div>
              <div className="hidden md:block">
                <EmptyPanel
                  icon="$"
                  title="No investments yet"
                  description={`You have ${money(data.account.cashBalanceCents)} to invest. Pick a company and buy your first shares.`}
                  href={exchangePath + "/catalog"}
                  action="Browse companies"
                />
              </div>
            </>
          ) : (
            <>
              {market.phase !== "LIVE" && (
                <StatusBanner
                  tone="info"
                  title="Selling is locked until IPO"
                  description="You can buy during seed windows. Selling opens when the admin launches the IPO."
                />
              )}
              <MobileHoldings
                holdings={holdings}
                market={market}
                sellOpen={sellOpen}
              />
              <div className={styles.tablePanel}>
                <div className="hidden overflow-x-auto md:block">
                  <table
                    className="w-full whitespace-nowrap text-sm"
                    aria-label="Holdings"
                  >
                    <thead className="bg-[#172339] text-xs text-[#a8b5d6]">
                      <tr>
                        <th className={cell + " text-left"} scope="col">
                          Company
                        </th>
                        {[
                          "Shares",
                          "Avg price",
                          "Cost basis",
                          "Price",
                          "Value",
                          "Unrealized P&L",
                        ].map((label) => (
                          <th key={label} className={numeric} scope="col">
                            {label}
                          </th>
                        ))}
                        <th className={numeric} scope="col">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((holding) => (
                        <tr
                          key={holding.projectId}
                          className="border-t border-[#263b56]/60"
                        >
                          <td className={cell}>
                            <CompanyLabel market={market} {...holding} />
                          </td>
                          <td className={numeric}>
                            {holding.shares.toLocaleString()}
                          </td>
                          <td className={numeric}>
                            {money(
                              Math.round(
                                holding.costBasisCents / holding.shares,
                              ),
                            )}
                          </td>
                          <td className={numeric}>
                            {money(holding.costBasisCents)}
                          </td>
                          <td className={numeric}>
                            {money(holding.currentPriceCents)}
                          </td>
                          <td className={numeric}>
                            {money(holding.marketValueCents)}
                          </td>
                          <td className={numeric}>
                            <SignedAmount
                              cents={holding.pnlCents}
                              positiveSign
                            />
                            {!!holding.costBasisCents && (
                              <small className="block text-[#a8b5d6]">
                                {(
                                  (100 * holding.pnlCents) /
                                  holding.costBasisCents
                                ).toFixed(1)}
                                %
                              </small>
                            )}
                          </td>
                          <td className={numeric}>
                            {sellOpen ? (
                              <Link
                                className={outline}
                                href={sellPath(holding.projectId)}
                              >
                                Sell
                              </Link>
                            ) : (
                              <button className={outline} disabled>
                                Sell
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="md:border-t border-[#263b56]/60 md:px-4 md:py-3 text-xs text-[#a8b5d6]">
                  Cost basis includes the 2% fee. Admin grants raise your cash
                  and total allocation, so they don’t count as profit.
                </p>
              </div>
            </>
          )}
        </>
      )}
    </PortfolioFrame>
  );
}

export function PortfolioHistory(props: MarketPageProps) {
  const [pageSize, setPageSize] = useState(10);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const sync = () => setPageSize(query.matches ? 5 : 10);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return <HistoryView key={pageSize} {...props} pageSize={pageSize} />;
}

function HistoryView({
  market,
  userId,
  isAdmin,
  initials,
  now,
  pageSize,
}: MarketPageProps & { pageSize: number }) {
  const [cursors, setCursors] = useState<string[]>([]);
  const cursor = cursors.at(-1);
  const result = useQuery({
    queryKey: ["btx-seed", market.eventId, userId, "history", pageSize, cursor],
    queryFn: () => accountTrades(pageSize, cursor),
    enabled: !!userId && isAdmin === false,
    refetchInterval: ({ state }) =>
      state.data?.data.some((trade) => trade.status === "PENDING")
        ? 2000
        : 15000,
  });
  const page = result.data;
  const next = page?.nextPageKey;
  const offset = cursors.length * pageSize;

  const count = page?.data.length ?? 0;
  const pagination = (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#263b56]/60 px-4 py-3 text-xs text-[#a8b5d6]">
      <span>
        {count
          ? `Showing ${offset + 1}–${offset + count}${next ? "" : ` of ${offset + count}`} transactions`
          : "No transactions on this page."}
      </span>
      <nav aria-label="Trade history pages" className="flex items-center gap-2">
        <button
          className={outline}
          disabled={!cursor}
          onClick={() => setCursors((keys) => keys.slice(0, -1))}
        >
          Previous
        </button>
        <span
          aria-current="page"
          className="hidden md:inline rounded-full bg-[#89dcff] px-3 py-1.5 text-[#081221]"
        >
          {cursors.length + 1}
        </span>
        <button
          className={outline}
          disabled={!next}
          onClick={() => next && setCursors((keys) => [...keys, next])}
        >
          Next
        </button>
      </nav>
    </footer>
  );
  return (
    <PortfolioFrame history isAdmin={isAdmin} initials={initials}>
      {!userId ? (
        <EmptyPanel
          title="Sign in to view your trade history"
          href={{ pathname: "/login", query: { redirect: historyPath } }}
          action="Sign in"
        />
      ) : !page ? (
        <div className={panel}>
          {result.isError ? (
            <StatusBanner
              tone="error"
              title="Couldn’t load trade history"
              description={result.error.message}
              onRetry={() => result.refetch()}
            />
          ) : (
            <StatusBanner tone="info" title="Loading trade history…" />
          )}
          {cursor && pagination}
        </div>
      ) : !page.data.length && !cursor && !next ? (
        <EmptyPanel
          title="No trades yet"
          description="Your buys and sells will appear here."
          href={exchangePath + "/catalog"}
          action="Browse companies"
        />
      ) : (
        <div className={styles.tablePanel}>
          <MobileHistory trades={page.data} market={market} now={now} />
          <div className="hidden overflow-x-auto md:block">
            <table
              className="w-full whitespace-nowrap text-sm"
              aria-label="Trade history"
            >
              <thead className="bg-[#172339] text-xs text-[#a8b5d6]">
                <tr>
                  {[
                    "Time",
                    "Company",
                    "Type",
                    "Shares",
                    "Price",
                    "Fee",
                    "Cash change",
                    "Realized P&L",
                  ].map((label, index) => (
                    <th
                      key={label}
                      scope="col"
                      className={index < 3 ? cell + " text-left" : numeric}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {page.data.map((trade) => {
                  const filled = !trade.status || trade.status === "FILLED";
                  return (
                    <tr
                      key={trade.tradeId}
                      className="border-t border-[#263b56]/60"
                    >
                      <td className={cell + " text-[#a8b5d6]"}>
                        <time
                          dateTime={new Date(trade.createdAt).toISOString()}
                        >
                          {tradeTime(trade.createdAt, now)}
                        </time>
                      </td>
                      <td className={cell}>
                        <CompanyLabel
                          market={market}
                          projectId={trade.projectId}
                        />
                      </td>
                      <td className={cell}>
                        <span
                          className={
                            "rounded-full border px-2 py-0.5 text-xs capitalize " +
                            (trade.side === "BUY"
                              ? "border-[#38d3a2]/40 bg-[#38d3a2]/10 text-[#38d3a2]"
                              : "border-[#ffddad]/40 bg-[#ffddad]/10 text-[#ffddad]")
                          }
                        >
                          {trade.side.toLowerCase()}
                        </span>
                      </td>
                      <td className={numeric}>
                        {trade.shares.toLocaleString()}
                      </td>
                      <td className={numeric}>
                        {filled && trade.priceCents != null
                          ? money(trade.priceCents)
                          : "—"}
                      </td>
                      <td className={numeric}>
                        {filled && trade.feeCents != null
                          ? money(trade.feeCents)
                          : "—"}
                      </td>
                      <td className={numeric}>
                        {trade.status === "PENDING" ? (
                          <span className="rounded-full border border-[#ffddad]/40 px-2 py-0.5 text-xs text-[#ffddad]">
                            Processing…
                          </span>
                        ) : trade.status === "REJECTED" ? (
                          <span
                            title={trade.rejection?.message}
                            className="text-[#ff5c7a]"
                          >
                            Rejected
                          </span>
                        ) : trade.cashDeltaCents == null ? (
                          "—"
                        ) : trade.cashDeltaCents > 0 ? (
                          <SignedAmount
                            cents={trade.cashDeltaCents}
                            positiveSign
                          />
                        ) : (
                          money(trade.cashDeltaCents)
                        )}
                      </td>
                      <td className={numeric}>
                        {filled && trade.realizedPnlCents != null ? (
                          <SignedAmount
                            cents={trade.realizedPnlCents}
                            positiveSign
                          />
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {pagination}
        </div>
      )}
    </PortfolioFrame>
  );
}
