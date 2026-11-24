import Link from "next/link";
import { companyName, exchangePath, compactMoney, money } from "./market";
import type { AccountTrade, Holding, Market } from "./seedApi";
import styles from "./Portfolio.module.css";
export const outline =
  "inline-flex rounded-full border border-[#324a68] px-3 py-1.5 text-xs disabled:opacity-40";
export function sellPath(id: string) {
  return (
    exchangePath +
    "/company/" +
    encodeURIComponent(id) +
    "?side=sell&trade=1#trade-ticket"
  );
}

export function tradeTime(ts: number, now: number) {
  if (Math.abs(now - ts) < 60000) return "Just now";
  const date = new Date(ts);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    ...(date.toDateString() !== new Date(now).toDateString() && {
      month: "short",
      day: "numeric",
    }),
  });
}
export function SignedAmount({
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

export function CompanyLabel({
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
    <span className="inline-flex max-w-full flex-wrap items-center gap-2 whitespace-normal">
      <span className="max-w-full [overflow-wrap:anywhere]">{label}</span>
      {symbol && (
        <small className="rounded-full border border-[#1fbef9]/35 bg-[#1fbef9]/10 px-2 py-0.5 text-xs text-[#1fbef9]">
          ${symbol}
        </small>
      )}
    </span>
  );
}

export function MobileHoldings({
  holdings,
  market,
  sellOpen,
}: {
  holdings: Holding[];
  market: Market;
  sellOpen: boolean;
}) {
  return (
    <ul className="space-y-4 md:hidden" aria-label="Holdings">
      {holdings.map((h) => (
        <li key={h.projectId} className={styles.card}>
          <header className={styles.row}>
            <CompanyLabel market={market} {...h} />
            <span className={styles.pill}>
              {h.shares.toLocaleString()} shares
            </span>
          </header>
          <dl className={styles.metrics}>
            {(
              [
                ["Avg price", Math.round(h.costBasisCents / h.shares)],
                ["Price", h.currentPriceCents],
                ["Value", h.marketValueCents],
              ] as const
            ).map(([label, cents]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{compactMoney(cents)}</dd>
              </div>
            ))}
          </dl>
          <footer className={styles.row}>
            <strong
              className={
                h.pnlCents < 0
                  ? "text-[#ff5c7a]"
                  : h.pnlCents > 0
                    ? "text-[#38d3a2]"
                    : ""
              }
            >
              {h.pnlCents > 0 && "+"}
              {compactMoney(h.pnlCents)}
              {h.costBasisCents > 0 &&
                ` · ${h.pnlCents > 0 ? "+" : ""}${((100 * h.pnlCents) / h.costBasisCents).toFixed(1)}%`}
            </strong>
            {sellOpen ? (
              <Link href={sellPath(h.projectId)} className={outline}>
                Sell
              </Link>
            ) : (
              <button disabled className={outline}>
                Sell locked
              </button>
            )}
          </footer>
        </li>
      ))}
    </ul>
  );
}
export function MobileHistory({
  trades,
  market,
  now,
}: {
  trades: AccountTrade[];
  market: Market;
  now: number;
}) {
  return (
    <ul className="space-y-4 md:hidden" aria-label="Trade history">
      {trades.map((trade) => {
        const filled = !trade.status || trade.status === "FILLED";
        return (
          <li key={trade.tradeId} className={styles.card}>
            <header className={styles.row}>
              <div>
                <CompanyLabel market={market} projectId={trade.projectId} />
                <time
                  className="block text-xs text-[#a8b5d6]"
                  dateTime={new Date(trade.createdAt).toISOString()}
                >
                  {tradeTime(trade.createdAt, now)}
                </time>
              </div>
              <span className={styles.pill} data-side={trade.side}>
                {trade.side.toLowerCase()}
              </span>
            </header>
            <div className={styles.row}>
              <span>
                {trade.shares} shares @{" "}
                {filled && trade.priceCents != null
                  ? compactMoney(trade.priceCents)
                  : "—"}
              </span>
              <span>
                Fee{" "}
                {filled && trade.feeCents != null
                  ? compactMoney(trade.feeCents)
                  : "—"}
              </span>
            </div>
            <div className={styles.row}>
              <span>Cash change</span>
              <strong>
                {trade.status === "PENDING" ? (
                  "Processing…"
                ) : trade.status === "REJECTED" ? (
                  "Rejected"
                ) : trade.cashDeltaCents == null ? (
                  "—"
                ) : trade.cashDeltaCents > 0 ? (
                  <SignedAmount cents={trade.cashDeltaCents} positiveSign />
                ) : (
                  money(trade.cashDeltaCents)
                )}
              </strong>
            </div>
            {filled &&
              trade.side === "SELL" &&
              trade.realizedPnlCents != null && (
                <div className={styles.row}>
                  <span>Realized P&amp;L</span>
                  <SignedAmount cents={trade.realizedPnlCents} positiveSign />
                </div>
              )}
          </li>
        );
      })}
    </ul>
  );
}
