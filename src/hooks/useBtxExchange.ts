import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  btxFetchMarketSnapshot,
  btxFetchPortfolio,
  btxFetchRecentTrades,
  btxBuyShares,
  btxSellShares,
  btxFetchPriceHistory,
  BtxProject as BtxProjectDto,
  BtxTrade as BtxTradeDto,
  BtxPortfolioResponse,
  BtxPriceHistoryRow,
} from "@/lib/db-btx";

const EVENT_ID = "kickstart";

export interface BtxProject extends BtxProjectDto {}

export interface BtxProjectView extends BtxProject {
  priceChange: number;
  priceChangePct: number;
}

export interface BtxTrade extends BtxTradeDto {}

export interface BtxAccount {
  userId: string;
  cashBalance: number;
  initialBalance: number;
  createdAt: number;
  updatedAt: number;
}

export interface BtxHolding {
  projectId: string;
  ticker: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  pnl: number;
}

export interface BtxPortfolio extends BtxPortfolioResponse {}

export type WsStatus = "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "ERROR";

export interface PricePoint {
  ts: number;
  price: number;
  source?: string;
}

interface UseBtxExchangeOptions {
  eventId?: string;
  pollIntervalMs?: number;
  useWebSocket?: boolean;
}

const normalizeTs = (ts: number | undefined | null): number => {
  const val = ts ?? Date.now();
  return val < 1e12 ? val * 1000 : val;
};

export function useBtxExchange({
  eventId = EVENT_ID,
  pollIntervalMs = 4000,
  useWebSocket = true,
}: UseBtxExchangeOptions = {}) {
  const [projects, setProjects] = useState<BtxProjectView[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [trades, setTrades] = useState<BtxTrade[]>([]);
  const [portfolio, setPortfolio] = useState<BtxPortfolio | null>(null);

  const [loadingSnapshot, setLoadingSnapshot] = useState(false);
  const [loadingTrades, setLoadingTrades] = useState(false);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [isSubmittingTrade, setIsSubmittingTrade] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);

  const [wsStatus, setWsStatus] = useState<WsStatus>("DISCONNECTED");

  const [priceHistory, setPriceHistory] = useState<
    Record<string, PricePoint[]>
  >({});

  const isMountedRef = useRef(true);
  const lastPricesRef = useRef<Map<string, number>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSnapshot = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      setLoadingSnapshot(true);
      const { projects: rawProjects } = await btxFetchMarketSnapshot(eventId);

      if (!isMountedRef.current) return;

      const lastPrices = new Map(lastPricesRef.current);

      const enriched: BtxProjectView[] = rawProjects.map((p) => {
        const price = Number(p.currentPrice || p.basePrice || 0);
        const prev = lastPrices.get(p.projectId) ?? price;
        const change = price - prev;
        const pct = prev > 0 ? (change / prev) * 100 : 0;

        lastPrices.set(p.projectId, price);

        return {
          ...p,
          priceChange: change,
          priceChangePct: pct,
        };
      });

      lastPricesRef.current = lastPrices;
      enriched.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));

      if (!isMountedRef.current) return;

      setProjects(enriched);

      setSelectedProjectId((prev) => {
        if (!prev && enriched.length) {
          return enriched[0].projectId;
        }
        return prev;
      });

      setPriceHistory((prev) => {
        const next: Record<string, PricePoint[]> = { ...prev };

        enriched.forEach((p) => {
          const projectId = p.projectId;
          const price = Number(p.currentPrice || p.basePrice || 0);
          if (!Number.isFinite(price)) return;

          const ts = normalizeTs(p.updatedAt);
          const existing = next[projectId] || [];

          if (existing.length > 2000) {
            next[projectId] = existing.slice(-2000);
            return;
          }

          if (existing.length > 0) {
            const last = existing[existing.length - 1];
            if (ts <= last.ts) {
              return;
            }
          }

          const updated = [
            ...existing,
            { ts, price, source: "snapshot" as const },
          ];

          next[projectId] = updated;
        });

        return next;
      });
    } catch (err: any) {
      console.error("[BTX] snapshot error", err);
      if (isMountedRef.current) {
        setError(
          typeof err?.message === "string"
            ? err.message
            : "Failed to load BTX snapshot",
        );
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingSnapshot(false);
      }
    }
  }, [eventId]);

  const fetchPortfolioFn = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      setLoadingPortfolio(true);
      setPortfolioError(null);

      const p = await btxFetchPortfolio(eventId);

      if (!isMountedRef.current) return;

      setPortfolio(p);
    } catch (err: any) {
      console.error("[BTX] portfolio error", err);

      if (!isMountedRef.current) return;

      if (err?.status === 401) {
        setPortfolio(null);
        return;
      }

      setPortfolioError(
        typeof err?.message === "string"
          ? err.message
          : "Failed to load BTX portfolio",
      );
    } finally {
      if (isMountedRef.current) {
        setLoadingPortfolio(false);
      }
    }
  }, [eventId]);

  const fetchTrades = useCallback(async (projectId: string) => {
    if (!projectId || !isMountedRef.current) return;

    try {
      setLoadingTrades(true);
      const rows = await btxFetchRecentTrades(projectId, 50);

      if (!isMountedRef.current) return;

      setTrades(rows);
    } catch (err) {
      console.error("[BTX] trades error", err);
    } finally {
      if (isMountedRef.current) {
        setLoadingTrades(false);
      }
    }
  }, []);

  const fetchPriceHistoryFn = useCallback(async (projectId: string) => {
    if (!projectId || !isMountedRef.current) return;

    try {
      const rows: BtxPriceHistoryRow[] = await btxFetchPriceHistory(projectId, {
        limit: 10000,
      });

      if (!isMountedRef.current) return;

      setPriceHistory((prev) => {
        const normalized = rows
          .map((r) => ({
            ts: normalizeTs(r.ts),
            price: r.price,
            source: r.source,
          }))
          .sort((a, b) => a.ts - b.ts);

        const existing = prev[projectId] || [];

        if (existing.length < 5) {
          return {
            ...prev,
            [projectId]: normalized,
          };
        }

        const maxFetchedTs =
          normalized.length > 0 ? normalized[normalized.length - 1].ts : 0;

        const newerLiveUpdates = existing.filter((pt) => pt.ts > maxFetchedTs);
        const merged = [...normalized, ...newerLiveUpdates];

        const deduped = new Map<number, PricePoint>();
        for (const pt of merged) {
          deduped.set(pt.ts, pt);
        }

        return {
          ...prev,
          [projectId]: Array.from(deduped.values()).sort((a, b) => a.ts - b.ts),
        };
      });
    } catch (err) {
      console.error("[BTX] price history error", err);
    }
  }, []);

  const selectProject = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
  }, []);

  const buyShares = useCallback(
    async (projectId: string, shares: number) => {
      try {
        setIsSubmittingTrade(true);
        await btxBuyShares(projectId, shares);
        await Promise.all([
          fetchSnapshot(),
          fetchPortfolioFn(),
          fetchTrades(projectId),
          fetchPriceHistoryFn(projectId),
        ]);
      } finally {
        setIsSubmittingTrade(false);
      }
    },
    [fetchSnapshot, fetchPortfolioFn, fetchTrades, fetchPriceHistoryFn],
  );

  const sellShares = useCallback(
    async (projectId: string, shares: number) => {
      try {
        setIsSubmittingTrade(true);
        await btxSellShares(projectId, shares);
        await Promise.all([
          fetchSnapshot(),
          fetchPortfolioFn(),
          fetchTrades(projectId),
          fetchPriceHistoryFn(projectId),
        ]);
      } finally {
        setIsSubmittingTrade(false);
      }
    },
    [fetchSnapshot, fetchPortfolioFn, fetchTrades, fetchPriceHistoryFn],
  );

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    fetchSnapshot();
    fetchPortfolioFn();

    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
    }
    pollTimerRef.current = setInterval(fetchSnapshot, pollIntervalMs);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [fetchSnapshot, fetchPortfolioFn, pollIntervalMs]);

  useEffect(() => {
    if (!selectedProjectId) return;

    fetchTrades(selectedProjectId);
    fetchPriceHistoryFn(selectedProjectId);
  }, [selectedProjectId, fetchTrades, fetchPriceHistoryFn]);

  useEffect(() => {
    if (!useWebSocket) return;
    if (typeof window === "undefined") return;

    const urlFromEnv = process.env.NEXT_PUBLIC_BTX_WS_URL;
    const wsUrl =
      urlFromEnv && urlFromEnv.length ? urlFromEnv : "ws://localhost:3005";

    setWsStatus("CONNECTING");

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isMountedRef.current) return;
      setWsStatus("CONNECTED");
      const payload = JSON.stringify({
        action: "subscribe",
        eventId,
        userId: "__anon__",
      });
      ws.send(payload);
    };

    ws.onclose = () => {
      if (!isMountedRef.current) return;
      setWsStatus("DISCONNECTED");
      wsRef.current = null;
    };

    ws.onerror = (err) => {
      console.error("[BTX] WebSocket error", err);
      if (isMountedRef.current) {
        setWsStatus("ERROR");
      }
    };

    ws.onmessage = (evt) => {
      if (!isMountedRef.current) return;

      try {
        const msg = JSON.parse(evt.data);
        if (msg.type !== "priceUpdate") return;

        const projectId = msg.projectId as string;
        const newPrice = Number(msg.currentPrice ?? msg.basePrice ?? 0);
        if (!projectId || !Number.isFinite(newPrice)) return;

        const ts = normalizeTs(msg.updatedAt);

        // update projects list
        setProjects((prev) => {
          const map = new Map(prev.map((p) => [p.projectId, p]));
          const existing = map.get(projectId);
          if (!existing) return prev;

          const prevPrice = existing.currentPrice || newPrice;
          const change = newPrice - prevPrice;
          const pct = prevPrice > 0 ? (change / prevPrice) * 100 : 0;

          const updated: BtxProjectView = {
            ...existing,
            currentPrice: newPrice,
            basePrice: msg.basePrice ?? existing.basePrice,
            netShares: msg.netShares ?? existing.netShares,
            totalVolume: msg.totalVolume ?? existing.totalVolume,
            totalTrades: msg.totalTrades ?? existing.totalTrades,
            priceChange: change,
            priceChangePct: pct,
            marketCap: msg.marketCap ?? existing.marketCap,
            updatedAt: ts,
          };

          map.set(projectId, updated);
          return Array.from(map.values()).sort(
            (a, b) => (b.marketCap || 0) - (a.marketCap || 0),
          );
        });

        // append to price history
        setPriceHistory((prev) => {
          const current = prev[projectId] || [];
          const last = current[current.length - 1];

          if (
            last &&
            last.ts === ts &&
            Math.abs(last.price - newPrice) < 0.01
          ) {
            return prev;
          }

          if (last && ts <= last.ts) {
            return prev;
          }

          const next = [
            ...current,
            {
              ts,
              price: newPrice,
              source: msg.source,
            },
          ];

          const trimmed =
            next.length > 10000 ? next.slice(next.length - 10000) : next;

          return {
            ...prev,
            [projectId]: trimmed,
          };
        });
      } catch (err) {
        console.error("[BTX] WS message parse error", err);
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [eventId, useWebSocket]);

  const selectedProject = useMemo(
    () => projects.find((p) => p.projectId === selectedProjectId) || null,
    [projects, selectedProjectId],
  );

  return {
    projects,
    selectedProject,
    selectedProjectId,
    selectProject,
    trades,
    portfolio,
    loadingSnapshot,
    loadingTrades,
    loadingPortfolio,
    isSubmittingTrade,
    error,
    portfolioError,
    buyShares,
    sellShares,
    wsStatus,
    priceHistory,
  };
}
