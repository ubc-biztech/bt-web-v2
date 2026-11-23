import { MobileTradeResult } from "./MobileTradeResult";
import styles from "./btx.module.css";
import Link from "next/link";
import { useRouter } from "next/router";
import type { Company, Market } from "./seedApi";
import type { useTradeOrder } from "./useTradeOrder";
import { money, percent } from "./market";
import { tradeButton, StatusBanner } from "./BtxUI";
import { stockError } from "./stockError";
import { usePortfolio } from "./accountQueries";

export type TradeTicketProps = {
  onClose?: () => void;
  market: Market;
  company: Company;
  userId: string;
  ticket: ReturnType<typeof useTradeOrder>;
};

export function TradeTicket(props: TradeTicketProps) {
  const { onClose, market, company, ticket } = props;
  const form = <TradeForm {...props} />;
  return onClose ? (
    <MobileTradeResult
      onClose={onClose}
      market={market}
      company={company}
      ticket={ticket}
    >
      {form}
    </MobileTradeResult>
  ) : (
    form
  );
}

function TradeForm({
  onClose,
  market,
  company,
  userId,
  ticket,
}: TradeTicketProps) {
  const companyPath = useRouter().asPath;
  const { data: portfolio } = usePortfolio(market.eventId, userId);
  const holding = portfolio?.holdings.find(
    (h) => h.projectId === company.projectId,
  )?.shares;
  const { canConfirm, fetchingQuote, preview, quantity, quantityLocked, side } =
    ticket;
  const buying = side === "BUY";
  const live = market.phase === "LIVE";
  const launching = market.phase === "IPO_PREPARING";
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

  const quoteErrorCode = ticket.quoteError?.data?.code;
  let errorCode = quoteErrorCode;
  let errorMessage = quoteErrorCode ? ticket.quoteError?.message : undefined;
  if (!errorCode) {
    if (launching) errorCode = "TRANSITION_UNAVAILABLE";
    else if (ticket.ownCompany) {
      errorCode = "FORBIDDEN";
      errorMessage = "You can’t trade shares in your own company.";
    } else if (seedUnavailable) {
      errorCode =
        company.seedStatus === "NOT_STARTED"
          ? "SEED_NOT_STARTED"
          : "SEED_WINDOW_ENDED";
    } else if (balanceError) errorCode = balanceError;
  }
  const notice =
    ticket.notice ?? (errorCode && stockError(errorCode, errorMessage));
  const retryQuote =
    !ticket.notice && quoteErrorCode && ticket.canQuote
      ? ticket.requestQuote
      : undefined;
  const actionEnabled = ticket.orderNotFound
    ? !ticket.busy
    : !fetchingQuote && (canConfirm ? !balanceError : ticket.canQuote);

  let orderLabel = preview ? "Refresh price" : "Get quote";
  if (fetchingQuote) orderLabel = "Getting price…";
  else if (ticket.busy) orderLabel = "Placing order…";
  else if (ticket.orderNotFound) orderLabel = "Retry original order";
  else if (ticket.order) orderLabel = "Checking order…";
  else if (canConfirm && preview) {
    orderLabel = ticket.priceChanged
      ? `Confirm at new price · ${money(preview.priceCents)}`
      : `${buying ? "Buy" : "Sell"} ${quantity} at ${money(preview.priceCents)}`;
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

  const lockedSell = onClose && !buying && !live && !ticket.order;
  return (
    <section
      aria-label="Trade ticket"
      className="flex flex-col gap-4 md:block md:space-y-5 md:rounded-3xl md:border md:border-[#324a68] md:bg-[#0d1628] md:p-5"
    >
      <div className="contents md:flex md:flex-wrap md:items-center md:gap-3">
        <div className="flex flex-1 max-md:gap-1 max-md:bg-[#82c3fb]/[.08] rounded-full bg-[#080e1a] p-1">
          {(["BUY", "SELL"] as const).map((s) => (
            <button
              key={s}
              disabled={quantityLocked || (!onClose && s === "SELL" && !live)}
              aria-pressed={side === s}
              onClick={() => ticket.changeSide(s)}
              className="flex-1 rounded-full max-md:py-[9px] max-md:leading-[normal] max-md:text-[#bdc8e3] max-md:aria-pressed:text-[#0b1120] px-5 py-2 text-[14px] font-medium capitalize lg:font-bold aria-pressed:bg-[#89dcff] aria-pressed:text-[#0a1524] disabled:opacity-40"
            >
              {s.toLowerCase()}
            </button>
          ))}
        </div>
        {lockedSell ? (
          <>
            <StatusBanner {...stockError("SELL_NOT_AVAILABLE_BEFORE_IPO")} />
            <button disabled className={tradeButton}>
              Sell unavailable
            </button>
          </>
        ) : (
          <>
            <label className="flex items-center justify-between gap-2 rounded-xl border border-[#324a68] bg-[#080e1a] px-3 py-2 text-[13px] text-[#a8b5d6] lg:text-[12px]">
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
                className="min-w-0 flex-1 bg-transparent md:w-12 md:flex-none text-[22px] font-bold text-white lg:text-[18px] lg:font-medium"
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
                  className={
                    styles.filterChip +
                    " inline-flex items-center rounded-full border border-[#527096] px-3 py-1 text-[13px] font-medium aria-pressed:bg-[#89dcff] aria-pressed:text-[#081121] lg:text-[12px]"
                  }
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
                onClick={
                  canConfirm || ticket.orderNotFound
                    ? ticket.submitOrder
                    : ticket.requestQuote
                }
              >
                {orderLabel}
              </button>
            )}
          </>
        )}
      </div>
      {!lockedSell && (
        <dl className="grid gap-3 text-[14px] md:grid-cols-5">
          {quoteDetails.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-2 md:block">
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
      )}
      {ticket.ownCompany && (
        <StatusBanner
          tone="info"
          title="Your team"
          description="You can’t invest in your own company."
        />
      )}
      {!lockedSell && notice && (
        <StatusBanner {...notice} onRetry={retryQuote} />
      )}
      {ticket.order && (
        <StatusBanner
          tone={ticket.statusUnknown ? "warning" : "info"}
          title={
            ticket.orderNotFound
              ? "Order not found yet"
              : ticket.statusUnknown
                ? "Order status unavailable"
                : "Checking order status…"
          }
          description={
            ticket.order.projectId !== company.projectId
              ? `Pending order for ${market.projects.find((p) => p.projectId === ticket.order?.projectId)?.companyName ?? ticket.order.projectId}`
              : undefined
          }
        />
      )}
    </section>
  );
}
