import Link, { type LinkProps } from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { usePortfolio } from "./accountQueries";
import { StatusBanner } from "./BtxUI";
import type { MarketPageProps } from "./Kickstart2026";
import { companyName, exchangePath, money } from "./market";
import { accountTrades, type Holding, type Market } from "./seedApi";

const portfolioPath = exchangePath + "/portfolio";
const historyPath = portfolioPath + "/history";
const panel =
  "overflow-hidden rounded-2xl border border-[#263b56] bg-[#10192c]/90";
const cell = "px-4 py-3";
const numeric = cell + " text-right tabular-nums";
const outline =
  "inline-flex rounded-full border border-[#324a68] px-3 py-1.5 text-xs disabled:opacity-40";
const primary =
  "inline-flex rounded-full bg-[#1fbef9] px-4 py-2 text-sm font-medium text-[#081221]";
const pageSize = 10;

function PortfolioFrame({
  isAdmin,
  history = false,
  children,
}: {
  isAdmin: MarketPageProps["isAdmin"];
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

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-medium tracking-tight">Portfolio</h1>
          <p className="mt-1 text-sm text-[#a8b5d6]">
            {history
              ? "Every buy and sell for KickStart."
              : "Your holdings and cash for KickStart."}
          </p>
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
              className="rounded-full px-4 py-2 aria-[current=page]:bg-[#89dcff] aria-[current=page]:text-[#081221]"
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

function SignedAmount({
  cents,
  positiveSign = false,
}: {
  cents: number;
  positiveSign?: boolean;
}) {
  const color =
    cents > 0 ? "text-[#38d3a2]" : cents < 0 ? "text-[#ff5c7a]" : "";
  return (
    <span className={color}>
      {positiveSign && cents > 0 ? "+" : ""}
      {money(cents)}
    </span>
  );
}

function CompanyLabel({
  market,
  projectId,
  name,
  ticker,
}: Pick<Holding, "projectId" | "name" | "ticker"> & { market: Market }) {
  const listing = market.projects.find(
    (project) => project.projectId === projectId,
  );
  const symbol = listing?.ticker || ticker;
  const label = listing ? companyName(listing) : name || projectId;
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      {label}
      {symbol && (
        <small className="rounded-full border border-[#1fbef9]/35 bg-[#1fbef9]/10 px-2 py-0.5 text-xs text-[#1fbef9]">
          ${symbol}
        </small>
      )}
    </span>
  );
}

function EmptyPanel({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description?: string;
  href?: LinkProps["href"];
  action?: string;
}) {
  return (
    <div
      className={
        panel + " grid place-items-center gap-3 px-5 py-14 text-center"
      }
    >
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
}: MarketPageProps) {
  const result = usePortfolio(market.eventId, userId, isAdmin === false, 15000);
  const data = result.data;
  const sellOpen = market.phase === "LIVE" && now < market.eventEndsAt;
  const holdings = data?.holdings.filter(({ shares }) => shares > 0) ?? [];

  return (
    <PortfolioFrame isAdmin={isAdmin}>
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
          <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {(
              [
                [
                  "Portfolio value",
                  data.totalPortfolioValueCents,
                  "Cash + holdings",
                ],
                ["Cash", data.account.cashBalanceCents, "Available to trade"],
                [
                  "Holdings value",
                  data.totalEquityValueCents,
                  holdings.length
                    ? `${holdings.length} companies`
                    : "No companies yet",
                ],
                [
                  "Total profit / loss",
                  data.totalPnlCents,
                  `Realized ${money(data.realizedPnlCents)} · Unrealized ${money(data.unrealizedPnlCents)}`,
                ],
              ] as const
            ).map(([label, cents, note]) => (
              <div className={panel + " px-4 py-3"} key={label}>
                <dt className="text-xs text-[#a8b5d6]">{label}</dt>
                <dd className="my-1 text-2xl tabular-nums">
                  {label === "Total profit / loss" ? (
                    <SignedAmount cents={cents} positiveSign />
                  ) : (
                    money(cents)
                  )}
                </dd>
                <dd className="text-xs text-[#a8b5d6]">{note}</dd>
              </div>
            ))}
          </dl>
          {!holdings.length ? (
            <EmptyPanel
              title="No investments yet"
              description={`You have ${money(data.account.cashBalanceCents)} to invest. Pick a company and buy your first shares.`}
              href={exchangePath + "/catalog"}
              action="Browse companies"
            />
          ) : (
            <>
              {market.phase !== "LIVE" && (
                <StatusBanner
                  tone="info"
                  title="Selling is locked until IPO"
                  description="Seed shares carry over to live trading, when selling opens."
                />
              )}
              <div className={panel}>
                <div className="overflow-x-auto">
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
                                href={
                                  exchangePath +
                                  "/company/" +
                                  encodeURIComponent(holding.projectId) +
                                  "?side=sell#trade-ticket"
                                }
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
                <p className="border-t border-[#263b56]/60 px-4 py-3 text-xs text-[#a8b5d6]">
                  Cost basis includes the 2% fee. Grants increase cash and total
                  allocation, so they don’t count as profit.
                </p>
              </div>
            </>
          )}
        </>
      )}
    </PortfolioFrame>
  );
}

export function PortfolioHistory({ market, userId, isAdmin }: MarketPageProps) {
  const [cursors, setCursors] = useState<string[]>([]);
  const cursor = cursors.at(-1);
  const result = useQuery({
    queryKey: ["btx-seed", market.eventId, userId, "history", cursor],
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
          ? `Showing ${offset + 1}–${offset + count} transactions`
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
          className="rounded-full bg-[#89dcff] px-3 py-1.5 text-[#081221]"
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
    <PortfolioFrame history isAdmin={isAdmin}>
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
        <div className={panel}>
          <div className="overflow-x-auto">
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
                          {new Date(trade.createdAt).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
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
