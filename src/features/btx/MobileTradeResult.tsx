import Link from "next/link";
import type { ReactNode } from "react";
import { tradeButton, StatusBanner } from "./BtxUI";
import { exchangePath, money } from "./market";
import { stockError } from "./stockError";
import type { TradeTicketProps } from "./TradeTicket";

export function MobileTradeResult({
  company,
  market,
  ticket,
  onClose,
  children,
}: Pick<TradeTicketProps, "company" | "market" | "ticket"> & {
  onClose: () => void;
  children: ReactNode;
}) {
  if (ticket.receipt) {
    const fill = ticket.receipt;
    return (
      <div className="space-y-4">
        <StatusBanner
          tone="success"
          title="Order filled"
          description="Your trade went through. Your portfolio and cash have been updated."
        />
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt>{fill.side === "BUY" ? "Bought" : "Sold"}</dt>
            <dd>{fill.shares} shares</dd>
          </div>
          {fill.cashDeltaCents != null && (
            <div className="flex justify-between">
              <dt>{fill.side === "BUY" ? "Total debit" : "Net proceeds"}</dt>
              <dd>{money(Math.abs(fill.cashDeltaCents))}</dd>
            </div>
          )}
        </dl>
        <button
          className={tradeButton}
          onClick={() => {
            ticket.dismissReceipt();
            onClose();
          }}
        >
          Done
        </button>
      </div>
    );
  }
  if (ticket.statusUnknown && !ticket.orderNotFound) {
    return (
      <div className="space-y-4">
        <StatusBanner
          tone="warning"
          title="We’re not sure this went through"
          description="We’ll keep checking this order. You can close the ticket and come back to it."
        />
        <button className={tradeButton} onClick={onClose}>
          Close
        </button>
      </div>
    );
  }
  if (
    market.phase === "SEED" &&
    !ticket.seedOpen &&
    !ticket.order &&
    company.seedStatus !== "NOT_STARTED"
  ) {
    return (
      <div className="flex flex-col gap-4">
        <StatusBanner {...stockError("SEED_WINDOW_ENDED")} />
        <Link href={exchangePath + "/catalog"} className={tradeButton}>
          Back to catalog
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}
