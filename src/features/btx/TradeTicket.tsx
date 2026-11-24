import Link from "next/link";
import { useRouter } from "next/router";
import type { Company, Market } from "./seedApi";
import type { useTradeOrder } from "./useTradeOrder";
import { money, percent } from "./market";
import { StatusBanner } from "./BtxUI";
import { stockError } from "./stockError";
import { usePortfolio } from "./accountQueries";

const tradeButton =
  "rounded-full bg-[#1fbef9] px-5 py-3 text-[15px] font-medium text-[#061323] lg:text-[14px] disabled:bg-[#1e2a40] disabled:text-[#a8b5d6]";

export function TradeTicket({
  market,
  company,
  userId,
  ticket,
}: {
  market: Market;
  company: Company;
  userId: string;
  ticket: ReturnType<typeof useTradeOrder>;
}) {
  const companyPath = useRouter().asPath;
  const { data: portfolio } = usePortfolio(market.eventId, userId);
  const holding = portfolio?.holdings.find(
    (h) => h.projectId === company.projectId,
  )?.shares;
  const { canConfirm, fetchingQuote, preview, quantity, quantityLocked, side } =
    ticket;
  const buying = side === "BUY";
  const live = market.phase === "LIVE";
  const launching = market.phase === "IPO_LAUNCHING";
  const seedUnavailable = !live && !ticket.seedOpen;
  const total = buying ? preview?.totalCostCents : preview?.proceedsCents;

  const balanceError =
    preview &&
    portfolio &&
    (buying
      ? total != null &&
        total > portfolio.account.cashBalanceCents &&
        "INSUFFICIENT_FUNDS"
      : Number(quantity) > (holding ?? 0) && "INSUFFICIENT_SHARES");

  let errorCode = ticket.quoteError;
  if (!errorCode) {
    if (launching) errorCode = "TRANSITION_UNAVAILABLE";
    else if (seedUnavailable) {
      errorCode =
        company.seedStatus === "NOT_STARTED"
          ? "SEED_NOT_STARTED"
          : "SEED_WINDOW_ENDED";
    } else if (balanceError) errorCode = balanceError;
  }
  const notice = ticket.notice ?? (errorCode && stockError(errorCode));
  const retryQuote =
    !ticket.notice && ticket.quoteError && ticket.canQuote
      ? ticket.requestQuote
      : undefined;
  const actionEnabled =
    !fetchingQuote && (canConfirm ? !balanceError : ticket.canQuote);

  let orderLabel = preview ? "Refresh price" : "Get quote";
  if (fetchingQuote) orderLabel = "Getting price…";
  else if (ticket.busy) orderLabel = "Placing order…";
  else if (ticket.order && !ticket.orderNotFound)
    orderLabel = "Checking order…";
  else if (canConfirm && preview) {
    orderLabel = `${buying ? "Buy" : "Sell"} ${quantity} at ${money(preview.priceCents)}`;
  } else if (launching) orderLabel = "Trading paused";
  else if (ticket.ownCompany || seedUnavailable) orderLabel = "Buy unavailable";

  const impact =
    preview?.phase === "LIVE" &&
    preview.startPriceCents > 0 &&
    Number.isFinite(preview.endPriceCents)
      ? percent(
          (preview.endPriceCents - preview.startPriceCents) /
            preview.startPriceCents,
        )
      : "—";
  const quoteDetails = [
    [
      live ? "Est. price" : "Seed price",
      money(preview?.priceCents ?? company.currentPriceCents),
    ],
    live ? ["Impact", impact] : ["Shares", "× " + quantity],
    ["Fee 2%", preview ? money(preview.feeCents) : "—"],
    [
      buying ? "Total debit" : "Net proceeds",
      total != null ? money(total) : "—",
    ],
    live
      ? ["You own", holding != null ? holding + " sh" : "—"]
      : ["Selling", "Opens at IPO"],
  ];

  return (
    <section
      aria-label="Trade ticket"
      className="space-y-5 rounded-3xl border border-[#324a68] bg-[#0d1628] p-5"
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 rounded-full bg-[#080e1a] p-1">
          {(["BUY", "SELL"] as const).map((s) => (
            <button
              key={s}
              disabled={quantityLocked || (s === "SELL" && !live)}
              aria-pressed={side === s}
              onClick={() => ticket.changeSide(s)}
              className="flex-1 rounded-full px-5 py-2 text-[14px] font-medium capitalize lg:font-bold aria-pressed:bg-[#89dcff] aria-pressed:text-[#0a1524] disabled:opacity-40"
            >
              {s.toLowerCase()}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-[#324a68] bg-[#080e1a] px-3 py-2 text-[13px] text-[#a8b5d6] lg:text-[12px]">
          <input
            type="text"
            inputMode="numeric"
            pattern="[1-9][0-9]*"
            aria-label="Shares"
            value={quantity}
            onChange={(e) => {
              const input = e.currentTarget;
              if (input.validity.patternMismatch) input.reportValidity();
              else ticket.changeQuantity(input.value);
            }}
            title="Enter a positive whole number of shares"
            disabled={quantityLocked}
            className="w-12 bg-transparent text-[22px] font-bold text-white lg:text-[18px] lg:font-medium"
          />{" "}
          shares
        </label>
        <div className="flex gap-1">
          {["1", "10", "50", "100"].map((preset) => (
            <button
              key={preset}
              disabled={quantityLocked}
              aria-pressed={preset === quantity}
              onClick={() => ticket.changeQuantity(preset)}
              className="inline-flex items-center rounded-full border border-[#527096] px-3 py-1 text-[13px] font-medium aria-pressed:bg-[#89dcff] aria-pressed:text-[#081121] lg:text-[12px]"
            >
              {preset}
            </button>
          ))}
        </div>
        {!userId ? (
          <Link
            className={tradeButton}
            href={{ pathname: "/login", query: { redirect: companyPath } }}
          >
            Sign in to invest
          </Link>
        ) : (
          <button
            className={tradeButton}
            disabled={!actionEnabled}
            onClick={canConfirm ? ticket.confirmPurchase : ticket.requestQuote}
          >
            {orderLabel}
          </button>
        )}
      </div>
      <dl className="grid grid-cols-2 gap-3 text-[14px] sm:grid-cols-5">
        {quoteDetails.map(([label, value]) => (
          <div key={label}>
            <dt className="mb-1 text-[14px] text-[#a8b5d6] lg:text-[11px]">
              {label}
            </dt>
            <dd
              className={`font-medium lg:text-[16px] ${label === "Selling" ? "text-[#ffddad]" : ""}`}
            >
              {fetchingQuote ? (
                <span
                  aria-label="Loading price"
                  className="mt-1 block h-3 w-12 animate-pulse rounded-full bg-[#19253b]"
                />
              ) : (
                value
              )}
            </dd>
          </div>
        ))}
      </dl>
      {ticket.ownCompany && (
        <StatusBanner
          tone="info"
          title="Your team"
          description="You can’t invest in your own company."
        />
      )}
      {notice && <StatusBanner {...notice} onRetry={retryQuote} />}
      {ticket.order &&
        (ticket.orderNotFound ? (
          <StatusBanner
            tone="warning"
            title="Order status unavailable"
            description="Request a fresh quote to retry with the original order ID."
          />
        ) : (
          <StatusBanner tone="info" title="Checking order status…" />
        ))}
    </section>
  );
}
