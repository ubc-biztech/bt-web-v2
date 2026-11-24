import { fetchBackend } from "@/lib/db";
import type { StockErrorCode } from "./stockError";

export interface Company {
  projectId: string;
  companyName?: string;
  logo?: string;
  ticker?: string;
  marketCapCents: number;
  netShares?: number;
  seedSharesAtIpo?: number | null;
  seedStartedAt?: number | null;
  name?: string;
  blurb?: string;
  description?: string;
  youtubeURL?: string;
  seedStatus: "ACTIVE" | "ENDED" | "NOT_STARTED" | "LIVE";
  seedEndsAt?: number;
  currentPriceCents: number;
}

export interface Market {
  eventId: string;
  phase: "SEED" | "IPO_PREPARING" | "IPO_LAUNCHING" | "LIVE";
  serverTime: number;
  ipoAt?: number | null;
  eventEndsAt: number;
  projects: Company[];
}

export interface TradeOrder {
  side?: "BUY" | "SELL";
  projectId: string;
  tradeId: string;
  shares: number;
  limitPriceCents: number;
}

export interface Trade extends TradeOrder {
  status: "PENDING" | "FILLED" | "REJECTED";
  side: "BUY" | "SELL";
  createdAt: number;
  cashDeltaCents?: number;
  rejection?: { code: StockErrorCode; message: string };
}

export interface TradeRequestError {
  status?: number;
  message?: string;
  data?: { code?: StockErrorCode };
}

export interface Quote {
  phase: Market["phase"];
  startPriceCents: number;
  endPriceCents: number;
  priceCents: number;
  feeCents: number;
  totalCostCents: number | null;
  proceedsCents: number | null;
  side: "BUY" | "SELL";
  expiresAt: number;
  projectId: string;
  shares: number;
}

interface Portfolio {
  account: { cashBalanceCents: number };
  holdings: { projectId: string; shares: number }[];
}

async function read<T>(path: string, authenticatedCall = true): Promise<T> {
  const response = await fetchBackend({
    endpoint: "/btx/" + path,
    method: "GET",
    authenticatedCall,
  });

  return response.data;
}

export const market = () => read<Market>("market/snapshot", false);
export const portfolio = () => read<Portfolio>("portfolio");

export const quote = (projectId: string, shares: number, side: Trade["side"]) =>
  read<Quote>(
    "market/quote?" +
      new URLSearchParams({ projectId, shares: String(shares), side }),
  );

// BTX project IDs use an event key and team code. Trade IDs are UUIDs.
export const tradeStatus = ({ projectId, tradeId }: TradeOrder) =>
  read<Trade>(`trades/${projectId}/${tradeId}`);

export async function placeOrder({
  side = "BUY",
  ...order
}: TradeOrder): Promise<Trade> {
  const { data } = await fetchBackend({
    endpoint: "/btx/market/" + side.toLowerCase(),
    method: "POST",
    data: order,
  });
  return data;
}

// UUIDv7 uses a 48-bit Unix millisecond timestamp and random remaining bits.
export function tradeId() {
  const time = Date.now().toString(16).padStart(12, "0");
  const random = crypto.randomUUID();

  return time.slice(0, 8) + "-" + time.slice(8) + "-7" + random.slice(15);
}

export async function priceHistory(projectId: string, from: number) {
  const points: { ts: number; priceCents: number }[] = [];
  const params = new URLSearchParams({ projectId });
  let nextPageKey: string | null;
  do {
    const page = await fetchBackend({
      endpoint: "/btx/price-history?" + params,
      method: "GET",
      authenticatedCall: false,
    });
    points.push(...page.data);
    nextPageKey = page.nextPageKey;
    if (nextPageKey) params.set("prevPageKey", nextPageKey);
  } while (
    nextPageKey &&
    points.length &&
    points[points.length - 1].ts >= from
  );
  return points;
}
