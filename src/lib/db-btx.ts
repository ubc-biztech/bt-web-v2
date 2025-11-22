// src/lib/db-btx.ts

import { fetchBackend } from "./db";
import { API_URL } from "./dbconfig";

export interface BtxProject {
  projectId: string;
  eventId: string;
  ticker: string;
  name: string;
  description?: string;
  basePrice: number;
  currentPrice: number;
  netShares: number;
  totalBuyShares?: number;
  totalSellShares?: number;
  totalTrades?: number;
  totalVolume?: number;
  seedAmount?: number;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
  marketCap?: number;
}

export interface BtxAccount {
  userId: string;
  cashBalance: number;
  initialBalance: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface BtxPortfolioHolding {
  projectId: string;
  ticker: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  pnl: number;
}

export interface BtxPortfolioResponse {
  account: BtxAccount;
  totalEquityValue: number;
  totalPortfolioValue: number;
  holdings: BtxPortfolioHolding[];
}

export interface BtxTrade {
  projectId: string;
  tradeId: string;
  userId: string;
  eventId: string;
  side: "BUY" | "SELL";
  shares: number;
  price: number;
  cashDelta: number;
  createdAt: number;
}

export interface BtxTradeResult {
  trade: BtxTrade;
  project: BtxProject;
  account: BtxAccount;
}

export interface BtxPriceHistoryRow {
  projectId: string;
  ts: number;
  price: number;
  eventId?: string;
  source?: string;
}

// ENV / LOCAL DEV HELPERS
// API_URL already checks if local or stage
const LOCAL_BTX_BASE = API_URL;

function shouldUseLocalBtx(): boolean {
  if (typeof window === "undefined") return false;

  const host = window.location.hostname;
  const isLocalHost = host === "localhost" || host === "127.0.0.1";

  const useLocal = isLocalHost;

  // eslint-disable-next-line no-console
  //   console.log("[BTX] shouldUseLocalBtx =", {
  //     host,
  //     isLocalHost,
  //     useLocal,
  //   });

  return useLocal;
}

async function btxLocalFetch(path: string, options: RequestInit): Promise<any> {
  const url = `${LOCAL_BTX_BASE}${path}`;

  // eslint-disable-next-line no-console
  //console.log("[BTX] local fetch →", url, options);

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (options.method === "POST" || options.method === "PUT") {
    headers["Content-Type"] = "application/json";
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 8000);

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("[BTX] local fetch network error", err);
    throw new Error(
      `BTX local network error calling ${url} – check serverless-offline logs`,
    );
  }

  clearTimeout(timeoutId);

  const text = await res.text();
  let json: any = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch (err) {
      console.error("[BTX] local fetch JSON parse error", err, text);
      const e = new Error("BTX local response was not valid JSON");
      (e as any).raw = text;
      throw e;
    }
  }

  if (!res.ok) {
    console.error("[BTX] local fetch error", res.status, json);

    const apiMessage = json?.userMessage || json?.message || json?.error || "";
    const isServerError = res.status >= 500;

    const userMessage = isServerError
      ? "BTX backend returned an internal error."
      : apiMessage || "BTX request failed.";

    const e: any = new Error(userMessage);
    e.status = res.status;
    e.payload = json;
    e.debugMessage = `BTX local error ${res.status} at ${url}: ${
      apiMessage || "no server message"
    }`;

    throw e;
  }
  return json;
}

// API CALL

export async function btxFetchProjects(
  eventId?: string,
): Promise<BtxProject[]> {
  const qs = new URLSearchParams();
  if (eventId) qs.set("eventId", eventId);

  if (shouldUseLocalBtx()) {
    const json = await btxLocalFetch(
      `/btx/projects${qs.toString() ? `?${qs.toString()}` : ""}`,
      { method: "GET" },
    );
    return json.data as BtxProject[];
  }

  const res = await fetchBackend({
    endpoint: `/btx/projects${qs.toString() ? `?${qs.toString()}` : ""}`,
    method: "GET",
    authenticatedCall: false,
  });

  return res.data as BtxProject[];
}

export async function btxFetchMarketSnapshot(
  eventId?: string,
): Promise<{ projects: BtxProject[] }> {
  const qs = new URLSearchParams();
  if (eventId) qs.set("eventId", eventId);

  if (shouldUseLocalBtx()) {
    const json = await btxLocalFetch(
      `/btx/market/snapshot${qs.toString() ? `?${qs.toString()}` : ""}`,
      { method: "GET" },
    );
    return json.data as { projects: BtxProject[] };
  }

  const res = await fetchBackend({
    endpoint: `/btx/market/snapshot${qs.toString() ? `?${qs.toString()}` : ""}`,
    method: "GET",
    authenticatedCall: false,
  });

  return res.data as { projects: BtxProject[] };
}

export async function btxFetchPortfolio(
  eventId?: string,
): Promise<BtxPortfolioResponse> {
  const qs = new URLSearchParams();
  if (eventId) qs.set("eventId", eventId);

  if (shouldUseLocalBtx()) {
    const json = await btxLocalFetch(
      `/btx/portfolio${qs.toString() ? `?${qs.toString()}` : ""}`,
      { method: "GET" },
    );
    return json.data as BtxPortfolioResponse;
  }

  const res = await fetchBackend({
    endpoint: `/btx/portfolio${qs.toString() ? `?${qs.toString()}` : ""}`,
    method: "GET",
    authenticatedCall: true,
  });

  return res.data as BtxPortfolioResponse;
}

export async function btxBuyShares(
  projectId: string,
  shares: number,
): Promise<BtxTradeResult> {
  const payload = { projectId, shares };

  const useLocal = shouldUseLocalBtx();
  //console.log("[BTX] btxBuyShares useLocal =", useLocal);

  if (useLocal) {
    const json = await btxLocalFetch("/btx/market/buy", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    //console.log("[BTX] btxLocalFetch BUY response", json);
    return json.data as BtxTradeResult;
  }

  //console.log("[BTX] btxBuyShares using fetchBackend to", "/btx/market/buy");

  const res = await fetchBackend({
    endpoint: "/btx/market/buy",
    method: "POST",
    data: payload,
    authenticatedCall: true,
  });

  //console.log("[BTX] fetchBackend BUY response", res);

  return res.data as BtxTradeResult;
}

export async function btxSellShares(
  projectId: string,
  shares: number,
): Promise<BtxTradeResult> {
  const payload = { projectId, shares };

  if (shouldUseLocalBtx()) {
    const json = await btxLocalFetch("/btx/market/sell", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return json.data as BtxTradeResult;
  }

  const res = await fetchBackend({
    endpoint: "/btx/market/sell",
    method: "POST",
    data: payload,
    authenticatedCall: true,
  });

  return res.data as BtxTradeResult;
}

export async function btxFetchRecentTrades(
  projectId: string,
  limit = 20,
): Promise<BtxTrade[]> {
  const qs = new URLSearchParams({ projectId, limit: String(limit) });

  if (shouldUseLocalBtx()) {
    const json = await btxLocalFetch(`/btx/trades?${qs.toString()}`, {
      method: "GET",
    });

    return json.data as BtxTrade[];
  }

  const res = await fetchBackend({
    endpoint: `/btx/trades?${qs.toString()}`,
    method: "GET",
    authenticatedCall: false,
  });

  return res.data as BtxTrade[];
}

export async function btxFetchPriceHistory(
  projectId: string,
  params: { limit?: number; sinceTs?: number } = {},
): Promise<BtxPriceHistoryRow[]> {
  const { limit, sinceTs } = params;

  const qs = new URLSearchParams({ projectId });
  if (typeof limit === "number") qs.set("limit", String(limit));
  if (typeof sinceTs === "number") qs.set("since", String(sinceTs));

  const querySuffix = qs.toString() ? `?${qs.toString()}` : "";

  if (shouldUseLocalBtx()) {
    const json = await btxLocalFetch(`/btx/price-history${querySuffix}`, {
      method: "GET",
    });
    return json.data as BtxPriceHistoryRow[];
  }

  const res = await fetchBackend({
    endpoint: `/btx/price-history${querySuffix}`,
    method: "GET",
    authenticatedCall: false,
  });

  return res.data as BtxPriceHistoryRow[];
}

// Admin helper

export async function btxAdminCreateOrUpdateProject(params: {
  projectId: string;
  ticker: string;
  name?: string;
  description?: string;
  eventId?: string;
  seedAmount?: number;
}): Promise<BtxProject> {
  const res = await fetchBackend({
    endpoint: "/btx/admin/project",
    method: "POST",
    data: params,
    authenticatedCall: true,
  });

  return res.data as BtxProject;
}

export async function btxAdminSeedUpdate(params: {
  projectId: string;
  seedDelta?: number;
  seedAbsolute?: number;
}): Promise<BtxProject> {
  const res = await fetchBackend({
    endpoint: "/btx/admin/seed",
    method: "POST",
    data: params,
    authenticatedCall: true,
  });

  return res.data as BtxProject;
}

export async function btxAdminPhaseBump(params: {
  projectId: string;
  bumpType:
    | "KICKOFF_HYPE"
    | "VALIDATION_GOOD"
    | "VALIDATION_BAD"
    | "MVP_SHIPPED"
    | "USER_FEEDBACK_GOOD"
    | "USER_FEEDBACK_BAD"
    | "DEMO_QUALIFIER"
    | "DEMO_WINNER"
    | "MULTIPLY"
    | "ADD";
  multiplier?: number;
  delta?: number;
}): Promise<BtxProject> {
  const res = await fetchBackend({
    endpoint: "/btx/admin/phase-bump",
    method: "POST",
    data: params,
    authenticatedCall: true,
  });

  return res.data as BtxProject;
}
