import type { Notice } from "./BtxUI";

const priceChanged: Notice = {
  tone: "warning",
  title: "Price changed",
  description:
    "The price moved since you opened this ticket. Review the new price and confirm again.",
};

const errors = {
  INSUFFICIENT_FUNDS: {
    tone: "error",
    title: "Not enough cash",
    description:
      "You don’t have enough cash for this order, including the 2% fee. Lower the amount and try again.",
  },
  INSUFFICIENT_SHARES: {
    tone: "error",
    title: "Not enough shares",
    description:
      "You hold fewer shares than you’re trying to sell. Lower the quantity and try again.",
  },
  SEED_NOT_STARTED: {
    tone: "warning",
    title: "Seeding hasn’t started",
    description:
      "This team hasn’t started seeding yet. Buying opens when they do.",
  },
  SEED_WINDOW_ENDED: {
    tone: "warning",
    title: "Seed round closed",
    description:
      "Seed funding has closed for this company.",
  },
  SELL_NOT_AVAILABLE_BEFORE_IPO: {
    tone: "info",
    title: "Selling opens at IPO",
    description:
      "You can’t sell until the admin launches the IPO. Shares you own are safe.",
  },
  TRANSITION_UNAVAILABLE: {
    tone: "warning",
    title: "Trading paused",
    description: "Trading is paused while opening prices are set.",
  },
  EVENT_ENDED: { tone: "warning", title: "Market closed" },
  STALE_QUOTE: priceChanged,
  LIMIT_PRICE_EXCEEDED: priceChanged,
  FORBIDDEN: { tone: "error", title: "Trading unavailable" },
  VALIDATION_ERROR: { tone: "error", title: "Invalid order" },
  INVALID_TRADE_ID: { tone: "error", title: "Invalid trade ID" },
  TRADE_REJECTED: { tone: "error", title: "Order rejected" },
} satisfies Record<string, Notice>;

export type StockErrorCode = keyof typeof errors;

export function stockError(error: StockErrorCode, message?: string): Notice {
  const notice: Notice = errors[error];
  return notice.description || !message
    ? notice
    : { ...notice, description: message };
}
