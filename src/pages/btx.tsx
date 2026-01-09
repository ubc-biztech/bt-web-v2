// src/pages/btx.tsx

"use client";

import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import {
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Activity,
  Wifi,
  WifiOff,
  Search,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  ReferenceLine,
} from "recharts";
import { Instrument_Serif, Bricolage_Grotesque } from "next/font/google";

import { useBtxExchange } from "@/hooks/useBtxExchange";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/btx-chart";
import { fetchBackend } from "@/lib/db";

const EVENT_ID = "kickstart";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
});

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const chartConfig = {
  value: {
    label: "Price",
    color: "#00C2FF",
  },
} satisfies ChartConfig;

// Formatting helpers

const round2 = (value: number): number =>
  Number.isFinite(value) ? Math.round(value * 100) / 100 : 0;

const formatNumber = (
  value: number | null | undefined,
  options?: Intl.NumberFormatOptions,
  fallback: string = "—",
): string => {
  if (value == null || Number.isNaN(value)) return fallback;
  return value.toLocaleString("en-US", options);
};

const formatInteger = (value: number | null | undefined): string =>
  formatNumber(value, { maximumFractionDigits: 0 });

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

// e.g. $1.2K, $3.4M
const formatCurrencyShort = (value: number | null | undefined): string => {
  if (value == null || Number.isNaN(value)) return "—";

  const numeric = Number(value);
  if (Math.abs(numeric) < 1000) {
    return currencyFormatter.format(numeric);
  }

  return compactCurrencyFormatter.format(numeric);
};

const formatCurrency = (value: number | null | undefined): string => {
  if (value == null || Number.isNaN(value)) return "—";
  return currencyFormatter.format(value);
};

const safeNumber = (
  value: number | null | undefined,
  fallback: number = 0,
): number => {
  const n = typeof value === "number" ? value : fallback;
  return Number.isFinite(n) ? n : fallback;
};

const safePct = (value: number | null | undefined): number =>
  safeNumber(value, 0);

const formatTimeLabel = (ms: number) =>
  new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatTimestamp = (ms: number) =>
  new Date(ms).toLocaleString([], {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });

const getInitials = (nameOrEmail: string) => {
  if (!nameOrEmail) return "?";
  const local = nameOrEmail.split("@")[0];
  const parts = local.split(/[.\-_ ]+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const PRICE_SENSITIVITY_PER_SHARE = 0.02;
const TRANSACTION_FEE_BPS = 200; // 2%
const MIN_PRICE = 0.5;

type TeamInvestment = {
  id: string;
  investorId: string;
  investorName: string;
  amount: number;
  comment: string;
  isPartner?: boolean;
  createdAt: number;
};

type TeamStatus = {
  funding: number;
  investments: TeamInvestment[];
};

type TraderStat = {
  userId: string;
  equityValue: number;
  totalPnl: number;
  totalValue: number;
  returnPct: number;
  cashBalance: number;
  initialBalance: number;
  positionsCount: number;
};

type TraderLeaderboard = {
  traders: number;
  top: TraderStat[];
  bottom: TraderStat[];
};

const formatUserLabel = (userId: string) => {
  if (!userId) return "Unknown";
  const [name] = userId.split("@");
  return name || userId;
};

// Timeframe handling

type TimeframeKey = "1M" | "5M" | "15M" | "1H" | "4H" | "1D" | "ALL";

const TIMEFRAME_LABELS: Record<TimeframeKey, string> = {
  "1M": "1m",
  "5M": "5m",
  "15M": "15m",
  "1H": "1h",
  "4H": "4h",
  "1D": "24h",
  ALL: "All time",
};

const TIMEFRAME_MS: Record<Exclude<TimeframeKey, "ALL">, number> = {
  "1M": 1 * 60 * 1000,
  "5M": 5 * 60 * 1000,
  "15M": 15 * 60 * 1000,
  "1H": 60 * 60 * 1000,
  "4H": 4 * 60 * 60 * 1000,
  "1D": 24 * 60 * 60 * 1000,
};

type TimeframeChange = {
  change: number;
  pct: number;
};

type MarketFilter = "ALL" | "UP" | "DOWN";
type MarketSortKey = "CHANGE" | "VOLUME" | "TICKER";

type PricePoint = {
  ts: number;
  value: number;
};

type PriceTooltipProps = {
  active?: boolean;
  payload?: {
    value: number;
    payload: PricePoint;
  }[];
};

const PriceTooltip: React.FC<PriceTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const point = payload[0]?.payload;
  const price = payload[0]?.value as number;

  if (!point) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-black/80 px-3 py-2 text-xs shadow-xl">
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="font-mono text-[12px] text-slate-300">
          {formatTimestamp(point.ts)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 font-mono text-[12px]">
          {formatCurrency(price)}
        </span>
      </div>
    </div>
  );
};

const BtxPage: React.FC = () => {
  const {
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
  } = useBtxExchange({
    eventId: EVENT_ID,
    pollIntervalMs: 4000,
    useWebSocket: true,
  });

  const [tradeShares, setTradeShares] = useState<string>("1");
  const [tradeError, setTradeError] = useState<string | null>(null);
  const [tradeSuccess, setTradeSuccess] = useState<string | null>(null);

  const [teamStatus, setTeamStatus] = useState<TeamStatus | null>(null);
  const [loadingTeamStatus, setLoadingTeamStatus] = useState(false);
  const [teamStatusError, setTeamStatusError] = useState<string | null>(null);

  const [leaderboard, setLeaderboard] = useState<TraderLeaderboard | null>(
    null,
  );
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  const [leaderboardReloadKey, setLeaderboardReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadLeaderboard = async () => {
      try {
        setLoadingLeaderboard(true);
        setLeaderboardError(null);

        const res = await fetchBackend({
          endpoint: `/btx/leaderboard?eventId=${EVENT_ID}`,
          method: "GET",
          authenticatedCall: true,
        });

        if (cancelled) return;

        const payload = res as { data: TraderLeaderboard };
        setLeaderboard(payload.data);
      } catch (err) {
        console.error("[BTX] leaderboard fetch error", err);
        if (!cancelled) {
          setLeaderboardError("Couldn’t load trader leaderboard.");
        }
      } finally {
        if (!cancelled) {
          setLoadingLeaderboard(false);
        }
      }
    };

    loadLeaderboard();

    const intervalId = setInterval(loadLeaderboard, 5000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [leaderboardReloadKey]);

  const [timeframe, setTimeframe] = useState<TimeframeKey>("15M");

  // market board controls
  const [searchQuery, setSearchQuery] = useState("");
  const [marketFilter, setMarketFilter] = useState<MarketFilter>("ALL");
  const [sortKey, setSortKey] = useState<MarketSortKey>("CHANGE");

  const headerProject = selectedProject || projects[0] || null;

  useEffect(() => {
    if (!headerProject?.projectId) {
      setTeamStatus(null);
      setTeamStatusError(null);
      return;
    }

    let cancelled = false;

    const loadTeamStatus = async () => {
      setLoadingTeamStatus(true);
      setTeamStatusError(null);

      try {
        const res = await fetchBackend({
          endpoint: `/investments/teamStatus/${headerProject.projectId}`,
          method: "GET",
          authenticatedCall: true,
        });

        if (!cancelled) {
          setTeamStatus(res as TeamStatus);
        }
      } catch (err: any) {
        console.error("[BTX] teamStatus fetch error", err);
        if (!cancelled) {
          setTeamStatusError(
            "Couldn’t load Kickstart investments for this team.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingTeamStatus(false);
        }
      }
    };

    loadTeamStatus();

    return () => {
      cancelled = true;
    };
  }, [headerProject?.projectId]);

  const projectMap = useMemo(() => {
    const map = new Map<string, (typeof projects)[0]>();
    projects.forEach((p) => map.set(p.projectId, p));
    return map;
  }, [projects]);

  // timeframe-based change for every project

  const timeframeChanges: Record<string, TimeframeChange> = useMemo(() => {
    const result: Record<string, TimeframeChange> = {};

    projects.forEach((p) => {
      const history = (priceHistory[p.projectId] || [])
        .slice()
        .sort((a, b) => a.ts - b.ts);

      if (history.length < 2) {
        result[p.projectId] = {
          change: safeNumber(p.priceChange, 0),
          pct: safePct(p.priceChangePct),
        };
        return;
      }

      let windowPoints = history;

      if (timeframe !== "ALL") {
        const now = Date.now();
        const cutoff = now - TIMEFRAME_MS[timeframe];

        const filtered = history.filter((pt) => pt.ts >= cutoff);

        // if we don't have enough data in this window yet, keep change = 0
        if (filtered.length >= 2) {
          windowPoints = filtered;
        } else {
          result[p.projectId] = { change: 0, pct: 0 };
          return;
        }
      }

      const start = windowPoints[0].price;
      const end = windowPoints[windowPoints.length - 1].price;

      if (!Number.isFinite(start) || !Number.isFinite(end) || start === 0) {
        result[p.projectId] = { change: 0, pct: 0 };
        return;
      }

      const change = end - start;
      const pct = (change / start) * 100;

      result[p.projectId] = {
        change: safeNumber(change, 0),
        pct: safeNumber(pct, 0),
      };
    });

    return result;
  }, [projects, priceHistory, timeframe]);

  const formatTooltipTimeForTimeframe = (
    ts: number,
    timeframe: TimeframeKey,
  ) => {
    const d = new Date(ts);
    return d.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // market-wide stats

  const { topGainer, mostActive } = useMemo(() => {
    if (!projects.length) {
      return {
        topGainer: null as (typeof projects)[0] | null,
        mostActive: null as (typeof projects)[0] | null,
      };
    }

    const byGain = [...projects].sort((a, b) => {
      const aPct = timeframeChanges[a.projectId]?.pct ?? 0;
      const bPct = timeframeChanges[b.projectId]?.pct ?? 0;
      return bPct - aPct;
    });

    const byVolume = [...projects].sort(
      (a, b) => (b.totalVolume || 0) - (a.totalVolume || 0),
    );

    return {
      topGainer: byGain[0],
      mostActive: byVolume[0],
    };
  }, [projects, timeframeChanges]);

  const formatXAxisTick = (ts: number, timeframe: TimeframeKey) => {
    const d = new Date(ts);

    // short time for intraday windows
    if (timeframe === "1M" || timeframe === "5M" || timeframe === "15M") {
      return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (timeframe === "1H" || timeframe === "4H") {
      return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return d.toLocaleString([], {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
    });
  };

  // market snapshot

  const marketSnapshot = useMemo(() => {
    if (!projects.length) return null;

    let up = 0;
    let down = 0;
    let flat = 0;
    let totalVolume = 0;
    let totalCap = 0;

    projects.forEach((p) => {
      const pct =
        timeframeChanges[p.projectId]?.pct ?? safePct(p.priceChangePct);
      if (pct > 0) up += 1;
      else if (pct < 0) down += 1;
      else flat += 1;

      totalVolume += p.totalVolume || 0;
      totalCap += p.marketCap || 0;
    });

    return {
      up,
      down,
      flat,
      count: projects.length,
      totalVolume,
      totalCap,
    };
  }, [projects, timeframeChanges]);

  // live portfolio snapshot

  const portfolioSnapshot = useMemo(() => {
    if (!portfolio) return null;

    let totalEquityValue = 0;

    const liveHoldings = portfolio.holdings.map((h) => {
      const project = projectMap.get(h.projectId);
      const currentPrice = project
        ? Number(project.currentPrice ?? project.basePrice ?? 0)
        : 0;

      const shares = Number(h.shares ?? 0);
      const avgPrice = Number(h.avgPrice ?? 0);
      const marketValue = round2(currentPrice * shares);
      const pnl = round2(marketValue - shares * avgPrice);

      totalEquityValue += marketValue;

      return {
        ...h,
        currentPrice,
        marketValue,
        pnl,
      };
    });

    const cashBalance = Number(portfolio.account.cashBalance ?? 0);
    const totalPortfolioValue = round2(totalEquityValue + cashBalance);

    return {
      ...portfolio,
      holdings: liveHoldings,
      totalEquityValue: round2(totalEquityValue),
      totalPortfolioValue,
    };
  }, [portfolio, projectMap]);

  // market board: search + filter + sort

  const filteredProjects = useMemo(() => {
    let list = [...projects];

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const ticker = (p.ticker || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        return ticker.includes(q) || name.includes(q);
      });
    }

    if (marketFilter !== "ALL") {
      list = list.filter((p) => {
        const pct =
          timeframeChanges[p.projectId]?.pct ?? safePct(p.priceChangePct);
        if (marketFilter === "UP") return pct > 0;
        if (marketFilter === "DOWN") return pct < 0;
        return true;
      });
    }

    list.sort((a, b) => {
      const aPct =
        timeframeChanges[a.projectId]?.pct ?? safePct(a.priceChangePct);
      const bPct =
        timeframeChanges[b.projectId]?.pct ?? safePct(b.priceChangePct);

      if (sortKey === "CHANGE") {
        return bPct - aPct;
      }
      if (sortKey === "VOLUME") {
        return (b.totalVolume || 0) - (a.totalVolume || 0);
      }
      // TICKER
      const aTicker = (a.ticker || "").toUpperCase();
      const bTicker = (b.ticker || "").toUpperCase();
      return aTicker.localeCompare(bTicker);
    });

    return list;
  }, [projects, searchQuery, marketFilter, sortKey, timeframeChanges]);

  const isMarketFiltered =
    searchQuery.trim().length > 0 || marketFilter !== "ALL";

  // portfolio breakdown (allocation, top holdings)

  const portfolioBreakdown = useMemo(() => {
    if (!portfolioSnapshot) return null;

    const total = portfolioSnapshot.totalPortfolioValue || 0;
    const cash = portfolioSnapshot.account.cashBalance || 0;
    const equity = portfolioSnapshot.totalEquityValue || 0;
    const openPnl = portfolioSnapshot.holdings.reduce(
      (sum, h: any) => sum + (h.pnl || 0),
      0,
    );

    const positions = [...portfolioSnapshot.holdings].sort(
      (a: any, b: any) => (b.marketValue || 0) - (a.marketValue || 0),
    );

    const topHoldings = positions.slice(0, 4);
    const topHoldingsValue = topHoldings.reduce(
      (sum: number, h: any) => sum + (h.marketValue || 0),
      0,
    );
    const otherValue = Math.max(equity - topHoldingsValue, 0);

    const totalSafe = total > 0 ? total : 1;

    return {
      total,
      cash,
      equity,
      openPnl,
      positions,
      topHoldings,
      otherValue,
      cashPct: (cash / totalSafe) * 100,
      equityPct: (equity / totalSafe) * 100,
    };
  }, [portfolioSnapshot]);

  // per-project & chart data

  const portfolioHolding =
    portfolioSnapshot && headerProject
      ? (portfolioSnapshot.holdings.find(
          (h: any) => h.projectId === headerProject.projectId,
        ) as any) || null
      : null;

  const chartData = useMemo(() => {
    if (!headerProject) return [];

    const history = priceHistory[headerProject.projectId] || [];
    const now = Date.now();

    let points =
      history.length > 0
        ? history
        : trades.length > 0
          ? trades
              .filter((t) => t.projectId === headerProject.projectId)
              .map((t) => ({
                ts: t.createdAt,
                price: t.price,
              }))
          : [
              {
                ts: now,
                price:
                  headerProject.currentPrice ?? headerProject.basePrice ?? 0,
              },
            ];

    points = points.slice().sort((a, b) => a.ts - b.ts);

    if (timeframe !== "ALL" && points.length > 1) {
      const lastTs = points[points.length - 1].ts;
      const cutoff = lastTs - TIMEFRAME_MS[timeframe];
      const filtered = points.filter((pt) => pt.ts >= cutoff);

      if (filtered.length >= 2) {
        points = filtered;
      }
    }

    let maxPoints = 0;
    if (timeframe === "15M") maxPoints = 60;
    if (timeframe === "1H") maxPoints = 60;
    if (timeframe === "4H") maxPoints = 120;
    else if (timeframe === "1D" || timeframe === "ALL") maxPoints = 240;

    if (maxPoints > 0 && points.length > maxPoints) {
      const bucketSize = Math.ceil(points.length / maxPoints);
      const bucketed: { ts: number; value: number }[] = [];

      for (let i = 0; i < points.length; i += bucketSize) {
        const bucket = points.slice(i, i + bucketSize);
        const avgTs = bucket.reduce((sum, p) => sum + p.ts, 0) / bucket.length;
        const avgPrice =
          bucket.reduce((sum, p) => sum + p.price, 0) / bucket.length;
        bucketed.push({ ts: avgTs, value: avgPrice });
      }

      return bucketed;
    }

    const shouldCoalesce =
      timeframe === "1M" || timeframe === "5M" || timeframe === "15M";

    const EPS = 1e-6;
    const coalesced: { ts: number; value: number }[] = [];

    for (const pt of points) {
      const value = pt.price;
      const last = coalesced[coalesced.length - 1];

      if (shouldCoalesce && last && Math.abs(last.value - value) < EPS) {
        last.ts = pt.ts;
        continue;
      }

      coalesced.push({ ts: pt.ts, value });
    }

    return coalesced;
  }, [headerProject, priceHistory, trades, timeframe]);

  const recentActivityData = useMemo(() => {
    if (!headerProject) {
      return { recent: [] as any[], total: 0 };
    }

    const projectTrades = trades.filter(
      (t) => t.projectId === headerProject.projectId,
    );
    if (!projectTrades.length) return { recent: [], total: 0 };

    const sorted = [...projectTrades].sort((a, b) => b.createdAt - a.createdAt);

    const mapped = sorted.map((t) => ({
      id: t.tradeId,
      investorName: t.userId,
      amount: Math.abs(t.cashDelta),
      shares: t.shares,
      side: t.side,
      price: t.price,
      timestamp: formatTimestamp(t.createdAt),
    }));

    return {
      recent: mapped.slice(0, 5),
      total: mapped.length,
    };
  }, [headerProject, trades]);

  const { recent: recentActivity, total: recentActivityTotal } =
    recentActivityData;

  const headerTimeframeChange: TimeframeChange = useMemo(() => {
    if (!headerProject) return { change: 0, pct: 0 };
    return (
      timeframeChanges[headerProject.projectId] ?? {
        change: safeNumber(headerProject.priceChange, 0),
        pct: safePct(headerProject.priceChangePct),
      }
    );
  }, [headerProject, timeframeChanges]);

  //  Trade estimates (approximate, execution may differ)

  const tradeEstimates = useMemo(() => {
    if (!headerProject) {
      return { cost: 0, execPrice: 0, finalPrice: 0 };
    }

    const shares = Number(tradeShares);
    if (!Number.isFinite(shares) || shares <= 0) {
      return {
        cost: 0,
        execPrice: 0,
        finalPrice: headerProject.currentPrice ?? headerProject.basePrice ?? 0,
      };
    }

    const startPrice =
      headerProject.currentPrice ?? headerProject.basePrice ?? 0;

    if (!Number.isFinite(startPrice) || startPrice <= 0) {
      return { cost: 0, execPrice: startPrice, finalPrice: startPrice };
    }

    const alpha = PRICE_SENSITIVITY_PER_SHARE;
    const feeFactor = TRANSACTION_FEE_BPS / 10000;

    const endPriceRaw = startPrice + shares * alpha;
    const finalPrice = Math.max(MIN_PRICE, endPriceRaw);

    const execPrice = (startPrice + finalPrice) / 2;
    const gross = execPrice * shares;
    const cost = gross * (1 + feeFactor);

    return {
      cost,
      execPrice,
      finalPrice,
    };
  }, [headerProject, tradeShares]);

  const estimatedValue = tradeEstimates.cost;
  const estimatedExecutionPrice = tradeEstimates.execPrice;
  // const estimatedFinalPrice = tradeEstimates.finalPrice

  const tradeSize = Number(tradeShares) || 0;

  const livePrice =
    headerProject?.currentPrice ?? headerProject?.basePrice ?? 0;

  const slippagePct =
    tradeSize && livePrice && estimatedExecutionPrice
      ? ((estimatedExecutionPrice - livePrice) / livePrice) * 100
      : 0;

  // position metrics

  const positionPnlPct = useMemo(() => {
    if (!portfolioHolding) return 0;
    const costBasis = portfolioHolding.avgPrice * portfolioHolding.shares;
    if (!costBasis) return 0;
    return (portfolioHolding.pnl / costBasis) * 100;
  }, [portfolioHolding]);

  const positionPortfolioPct = useMemo(() => {
    if (!portfolioBreakdown || !portfolioHolding) return 0;
    if (!portfolioBreakdown.total) return 0;
    return (portfolioHolding.marketValue / portfolioBreakdown.total) * 100;
  }, [portfolioBreakdown, portfolioHolding]);

  // trade handler

  const handleTrade = async (side: "BUY" | "SELL") => {
    if (!headerProject) return;
    setTradeError(null);
    setTradeSuccess(null);

    const parsed = Number(tradeShares);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setTradeError("Enter a positive number of shares.");
      return;
    }

    try {
      if (!portfolio) {
        setTradeError(
          "You must be logged in to trade (or in dev, use local user).",
        );
        return;
      }

      if (side === "BUY") {
        await buyShares(headerProject.projectId, parsed);
        setTradeSuccess(
          `Bought ${parsed} share(s) of ${headerProject.ticker}.`,
        );
        setLeaderboardReloadKey((k) => k + 1);
      } else {
        await sellShares(headerProject.projectId, parsed);
        setTradeSuccess(`Sold ${parsed} share(s) of ${headerProject.ticker}.`);
        setLeaderboardReloadKey((k) => k + 1);
      }
    } catch (err: any) {
      console.error("[BTX] trade error", err);

      const status = err?.status as number | undefined;
      const backendMessage: string =
        err?.payload?.message || err?.message || "";

      if (
        status === 400 &&
        backendMessage.toLowerCase().includes("insufficient btx cash balance")
      ) {
        let maxShares: number | null = null;

        if (portfolio && headerProject) {
          const cash = portfolio.account.cashBalance;
          const startPrice =
            headerProject.currentPrice ?? headerProject.basePrice ?? 0;
          const alpha = PRICE_SENSITIVITY_PER_SHARE;
          const feeFactor = TRANSACTION_FEE_BPS / 10000;
          const k = 1 + feeFactor;

          if (cash > 0 && startPrice > 0) {
            // @ts-ignore
            if (alpha === 0) {
              maxShares = Math.floor(cash / (startPrice * k));
            } else {
              const A = 0.5 * alpha * k;
              const B = startPrice * k;
              const C = -cash;

              const discriminant = B * B - 4 * A * C;
              if (discriminant >= 0 && A > 0) {
                const root = (-B + Math.sqrt(discriminant)) / (2 * A);
                if (root > 0 && Number.isFinite(root)) {
                  maxShares = Math.floor(root);
                }
              }
            }
          }
        }

        setTradeError(
          `You don’t have enough BTX cash for this order. Large buys move the price up and there is a 2% transaction fee, so the actual cost is higher than price × shares.${
            maxShares
              ? ` At current conditions you can buy up to about ${maxShares.toLocaleString()} share(s).`
              : ""
          }`,
        );
        return;
      }

      if (status === 401) {
        setTradeError("You must be logged in to trade.");
        return;
      }

      if (status && status >= 500) {
        setTradeError(
          "BTX backend hit an internal error while placing your order. This is on us — please tell the event organizer.",
        );
        return;
      }

      setTradeError(
        backendMessage ||
          "Trade failed for an unknown reason. Please try again.",
      );
    }
  };

  // websocket status chip

  const wsChip = (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] uppercase tracking-wide ${
        wsStatus === "CONNECTED"
          ? "bg-emerald-900/40 text-emerald-200"
          : wsStatus === "ERROR"
            ? "bg-red-900/40 text-red-200"
            : "bg-slate-800/60 text-slate-300"
      }`}
    >
      {wsStatus === "CONNECTED" ? (
        <Wifi className="h-3 w-3" />
      ) : wsStatus === "ERROR" ? (
        <WifiOff className="h-3 w-3" />
      ) : (
        <Activity className="h-3 w-3" />
      )}
      <span>
        {wsStatus === "CONNECTED"
          ? "Live"
          : wsStatus === "ERROR"
            ? "WS Error"
            : "Polling"}
      </span>
    </div>
  );

  const testTickerProjects = useMemo(() => {
    const MULTIPLIER = 4;
    if (!projects.length) return projects;

    const out: typeof projects = [];
    for (let i = 0; i < MULTIPLIER; i++) {
      out.push(...projects);
    }
    return out;
  }, [projects]);

  return (
    <>
      <Head>
        <title>BizTech Exchange (BTX)</title>
      </Head>

      <div
        className={`${bricolageGrotesque.className} min-h-screen bg-[#111111] text-white w-full overflow-x-hidden`}
      >
        <div className="max-w-[92rem] mx-auto w-full min-h-screen flex flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-2">
          {/* HEADER: title + live price + portfolio snapshot + market stats */}
          <section className="mb-4 flex-shrink-0 rounded-xl border border-[#2A2A2A] bg-gradient-to-r from-[#181818] via-[#111111] to-[#161616] px-4 py-3 sm:px-5 sm:py-4 shadow-[0_0_0_1px_rgba(0,0,0,0.9)]">
            {/* Top row: project + portfolio */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              {/* Left: selected project headline */}
              <div className="flex flex-col gap-2 min-w-0">
                <div className="flex flex-wrap items-baseline gap-3 sm:gap-4">
                  <h1
                    className={`${instrumentSerif.className} text-2xl sm:text-3xl md:text-4xl font-light leading-tight truncate`}
                  >
                    {headerProject ? headerProject.name : "BizTech Exchange"}
                  </h1>

                  {/* Price + change */}
                  <div className="flex flex-wrap items-baseline gap-4">
                    <p
                      className={`${instrumentSerif.className} text-2xl sm:text-3xl font-light leading-none`}
                    >
                      {formatCurrency(
                        headerProject?.currentPrice ??
                          headerProject?.basePrice ??
                          0,
                      )}
                    </p>

                    <div
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-light ${
                        headerTimeframeChange.change >= 0
                          ? "bg-emerald-900/40 text-bt-green-300 border border-emerald-500/40"
                          : "bg-red-900/40 text-bt-red-300 border border-red-500/40"
                      }`}
                    >
                      {headerTimeframeChange.change >= 0 ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                      <span className="font-mono text-[11px]">
                        {headerTimeframeChange.change >= 0 ? "+" : "-"}
                        {formatCurrencyShort(
                          Math.abs(headerTimeframeChange.change),
                        )}{" "}
                        ({headerTimeframeChange.pct >= 0 ? "+" : "-"}
                        {Math.abs(headerTimeframeChange.pct).toFixed(2)}
                        %)
                      </span>
                    </div>
                  </div>
                </div>

                {headerProject && (
                  <div className="flex flex-col gap-1.5">
                    {/* Status + timeframe controls */}
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                      {headerProject && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/70 bg-black/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {headerProject.ticker}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-2">
                        {wsChip}
                        <span className="text-[10px] text-slate-400">
                          {loadingSnapshot
                            ? "Updating prices…"
                            : "Market running"}
                        </span>
                      </span>

                      <div className="inline-flex flex-wrap items-center gap-1.5">
                        <span className="uppercase tracking-[0.18em] text-slate-500">
                          Timeframe
                        </span>
                        <div className="inline-flex rounded-full border border-slate-700/70 bg-black/40 px-0.5 py-0.5">
                          {(
                            [
                              "1M",
                              "5M",
                              "15M",
                              "1H",
                              "4H",
                              "1D",
                              "ALL",
                            ] as TimeframeKey[]
                          ).map((tf) => {
                            const active = timeframe === tf;
                            return (
                              <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                                  active
                                    ? "bg-slate-100 text-[#111] shadow-sm"
                                    : "text-slate-400 hover:bg-slate-600/40 hover:text-slate-50"
                                }`}
                              >
                                {TIMEFRAME_LABELS[tf]}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: portfolio mini-summary */}
              <div className="flex flex-col items-end gap-1.5 text-xs text-[#D0D0D0] max-w-xs sm:max-w-sm">
                {loadingPortfolio ? (
                  <span className="text-[11px] text-slate-400">
                    Loading portfolio…
                  </span>
                ) : portfolio && portfolioSnapshot ? (
                  <>
                    <div className="rounded-lg border border-[#333230] bg-[#141414] px-3 py-2 w-full sm:w-auto">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                          Portfolio value
                        </span>
                        <span className="font-mono text-xs text-slate-50">
                          {formatCurrency(
                            portfolioSnapshot.totalPortfolioValue,
                          )}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-4 text-[10px] text-slate-400">
                        <span>Cash</span>
                        <span className="font-mono text-slate-100">
                          {formatCurrency(
                            portfolioSnapshot.account.cashBalance,
                          )}
                        </span>
                      </div>
                      {portfolioBreakdown && (
                        <div className="mt-1 flex items-center justify-between gap-4 text-[10px] text-slate-400">
                          <span>Open P&amp;L</span>
                          <span
                            className={`font-mono ${
                              portfolioBreakdown.openPnl > 0
                                ? "text-bt-green-300"
                                : portfolioBreakdown.openPnl < 0
                                  ? "text-bt-red-300"
                                  : "text-slate-300"
                            }`}
                          >
                            {formatCurrency(portfolioBreakdown.openPnl)}
                          </span>
                        </div>
                      )}
                    </div>
                    {portfolioError && (
                      <div className="text-[10px] text-red-300 text-right">
                        {portfolioError}
                      </div>
                    )}
                  </>
                ) : portfolio ? (
                  <>
                    <div className="rounded-lg border border-[#333230] bg-[#141414] px-3 py-2 w-full sm:w-auto space-y-0.5">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                          Portfolio value
                        </span>
                        <span className="font-mono text-xs text-slate-50">
                          {formatCurrency(portfolio.totalPortfolioValue)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400">
                        <span>Cash</span>
                        <span className="font-mono text-slate-100">
                          {formatCurrency(portfolio.account.cashBalance)}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <span className="text-[11px] text-[#888] text-right">
                    Browsing as guest. Log in to trade and see your portfolio.
                  </span>
                )}
              </div>
            </div>

            {/* Market snapshot row inside header */}
            {marketSnapshot && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-md border border-[#2A2A2A] bg-[#171717] px-3 py-2 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                    Market breadth
                  </span>
                  <div className="flex gap-3 font-mono text-[11px]">
                    <span className="text-bt-green-300">
                      ↑ {marketSnapshot.up}
                    </span>
                    <span className="text-bt-red-300">
                      ↓ {marketSnapshot.down}
                    </span>
                    <span className="text-slate-400">
                      · {marketSnapshot.flat}
                    </span>
                  </div>
                </div>
                <div className="rounded-md border border-[#2A2A2A] bg-[#171717] px-3 py-2 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                    Total BTX volume
                  </span>
                  <span className="font-mono text-[12px]">
                    {marketSnapshot.totalVolume.toLocaleString()}
                  </span>
                </div>
                <div className="rounded-md border border-[#2A2A2A] bg-[#171717] px-3 py-2 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                    Total BTX market cap
                  </span>
                  <span className="font-mono text-[12px]">
                    {formatCurrency(marketSnapshot.totalCap)}
                  </span>
                </div>
              </div>
            )}

            {/* Error banner if snapshot failed */}
            {error && (
              <div className="mt-3 rounded border border-red-500/60 bg-red-900/40 px-3 py-2 text-xs text-red-200">
                BTX failed to load. Check backend logs and your serverless
                stack.
              </div>
            )}
          </section>

          {/* Market ticker strip */}
          <StaticTicker
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={selectProject}
            timeframeChanges={timeframeChanges}
          />

          {/* MAIN LAYOUT: left (chart + trade) / right (market + portfolio) */}
          <div className="mt-2 grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] gap-6 lg:gap-8">
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              {/* Chart card */}
              <Card className="bg-[#111111] rounded-none border border-[#2A2A2A] shadow-none">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm font-light text-slate-300 flex items-center justify-between">
                    <span>Price history</span>
                    {/* {headerProject && (
                      <span className="text-[11px] text-slate-500">
                        Base price:{" "}
                        <span className="font-mono">
                          {formatCurrency(headerProject.basePrice)}
                        </span>
                      </span>
                    )} */}
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-full py-4 sm:py-6 pr-2 sm:pr-6 pl-0 flex flex-col">
                  {headerProject ? (
                    <ChartContainer
                      config={chartConfig}
                      className="h-[260px] sm:h-[320px] md:h-[360px] lg:h-[420px] w-full"
                      style={{
                        backgroundImage: `
                          linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
                        `,
                        backgroundSize: "36px 36px",
                        backgroundPosition: "-1px -1px",
                        borderRadius: 0,
                        position: "relative",
                      }}
                    >
                      <div
                        className="pointer-events-none absolute inset-y-0 right-0 w-3"
                        style={{
                          background:
                            "linear-gradient(to right, rgba(17,17,17,0), #111111)",
                        }}
                      />
                      <div
                        className="pointer-events-none absolute inset-x-0 top-0 h-3"
                        style={{
                          background:
                            "linear-gradient(to bottom, rgba(17,17,17,0), #111111)",
                        }}
                      />

                      <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                          left: 12,
                          right: 24,
                          top: 24,
                          bottom: 12,
                        }}
                      >
                        <defs>
                          <linearGradient
                            id="priceGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="var(--color-value)"
                              stopOpacity={0.4}
                            />
                            <stop
                              offset="100%"
                              stopColor="var(--color-value)"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>

                        <XAxis
                          dataKey="ts"
                          tickFormatter={(value) =>
                            formatXAxisTick(value as number, timeframe)
                          }
                          minTickGap={40}
                          tick={{
                            fill: "rgba(248,250,252,0.85)",
                            fontSize: 9,
                          }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tickMargin={10}
                          domain={[
                            (min: number) => min * 0.98,
                            (max: number) => max * 1.02,
                          ]}
                          tickFormatter={(value: number) =>
                            formatCurrencyShort(value)
                          }
                          tick={{
                            fill: "rgba(148,163,184,0.85)",
                            fontSize: 11,
                          }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <ChartTooltip
                          cursor={{
                            stroke: "rgba(148,163,184,0.6)",
                            strokeDasharray: "4 4",
                          }}
                          content={<PriceTooltip />}
                        />

                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="none"
                          fill="url(#priceGradient)"
                          isAnimationActive={false}
                        />

                        <ReferenceLine
                          y={headerProject.basePrice}
                          stroke="rgba(148,163,184,0.35)"
                          strokeDasharray="4 4"
                        />

                        <Line
                          dataKey="value"
                          type="linear"
                          stroke="var(--color-value)"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
                      No BTX projects yet. Create some in the admin panel.
                    </div>
                  )}
                  {loadingTrades && headerProject && (
                    <div className="mt-2 text-xs text-slate-500">
                      Updating trades…
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Trade + position + recent activity */}
              <Card className="bg-[#201F1E] rounded-none border border-[#2A2A2A]">
                <CardHeader className="flex flex-row items-center justify-between pb-3 gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-lg font-light truncate">
                      {headerProject ? headerProject.name : "Select a project"}
                    </CardTitle>
                    {headerProject && (
                      <div className="text-[10px] text-[#A0A0A0] uppercase tracking-wide truncate mt-1">
                        <span className="font-mono">
                          {headerProject.ticker}
                        </span>{" "}
                        · Net:{" "}
                        <span className="font-mono">
                          {headerProject.netShares ?? 0}
                        </span>{" "}
                        · Vol:{" "}
                        <span className="font-mono">
                          {headerProject.totalVolume ?? 0}
                        </span>{" "}
                        · Trades:{" "}
                        <span className="font-mono">
                          {headerProject.totalTrades ?? 0}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="font-light flex flex-col gap-5 sm:gap-4">
                  {headerProject ? (
                    <>
                      {/* POSITION + PROJECT SNAPSHOT */}
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
                        {/* LEFT: Your position */}
                        <div className="flex-1 flex flex-col h-full rounded-xl border border-[#343331] bg-gradient-to-br from-[#161514] via-[#181716] to-[#131211] px-3 py-3 sm:px-4 sm:py-4 shadow-[0_0_0_1px_rgba(0,0,0,0.8)]">
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                              Your position
                            </div>
                            {portfolioBreakdown && portfolioHolding && (
                              <div
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                  positionPortfolioPct >= 25
                                    ? "bg-red-900/40 text-red-200 border border-red-500/40"
                                    : positionPortfolioPct >= 10
                                      ? "bg-amber-900/40 text-amber-200 border border-amber-500/40"
                                      : "bg-emerald-900/30 text-emerald-200 border border-emerald-500/30"
                                }`}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                {positionPortfolioPct >= 25
                                  ? "High concentration"
                                  : positionPortfolioPct >= 10
                                    ? "Moderate concentration"
                                    : "Well sized"}
                              </div>
                            )}
                          </div>

                          {!portfolioHolding ||
                          (portfolioHolding?.shares ?? 0) === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-600/60 bg-black/20 px-3 py-3 text-[11px] text-slate-300">
                              You don&apos;t own this stock yet. Start with a
                              small probing position to see how it trades.
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-[11px] sm:text-xs">
                                <div>
                                  <div className="text-[10px] uppercase tracking-wide text-slate-400">
                                    Shares
                                  </div>
                                  <div className="mt-0.5 font-mono text-sm text-slate-50">
                                    {portfolioHolding.shares.toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[10px] uppercase tracking-wide text-slate-400">
                                    Market value
                                  </div>
                                  <div className="mt-0.5 font-mono text-sm text-slate-50">
                                    {formatCurrency(
                                      portfolioHolding.marketValue,
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[10px] uppercase tracking-wide text-slate-400">
                                    Avg entry
                                  </div>
                                  <div className="mt-0.5 font-mono text-sm text-slate-50">
                                    {formatCurrency(portfolioHolding.avgPrice)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[10px] uppercase tracking-wide text-slate-400">
                                    Last price
                                  </div>
                                  <div className="mt-0.5 font-mono text-sm text-slate-50">
                                    {formatCurrency(
                                      headerProject.currentPrice ??
                                        headerProject.basePrice ??
                                        0,
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[10px] uppercase tracking-wide text-slate-400">
                                    P&amp;L
                                  </div>
                                  <div
                                    className={`mt-0.5 font-mono text-sm ${
                                      portfolioHolding.pnl > 0
                                        ? "text-bt-green-300"
                                        : portfolioHolding.pnl < 0
                                          ? "text-bt-red-300"
                                          : "text-slate-200"
                                    }`}
                                  >
                                    {formatCurrency(portfolioHolding.pnl)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[10px] uppercase tracking-wide text-slate-400">
                                    P&amp;L %
                                  </div>
                                  <div
                                    className={`mt-0.5 font-mono text-sm ${
                                      positionPnlPct > 0
                                        ? "text-bt-green-300"
                                        : positionPnlPct < 0
                                          ? "text-bt-red-300"
                                          : "text-slate-200"
                                    }`}
                                  >
                                    {positionPnlPct.toFixed(2)}%
                                  </div>
                                </div>
                              </div>

                              {portfolioBreakdown && (
                                <div className="mt-3 space-y-1">
                                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                                    <span>Share of portfolio</span>
                                    <span className="font-mono text-[11px] text-slate-100">
                                      {positionPortfolioPct.toFixed(2)}%
                                    </span>
                                  </div>
                                  <div className="h-1.5 rounded-full bg-black/60 overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-bt-blue-400 via-bt-green-400 to-emerald-300"
                                      style={{
                                        width: `${Math.min(positionPortfolioPct, 100)}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* RIGHT: Project stats */}
                        <div className="w-full lg:w-[280px] flex flex-col h-full rounded-xl border border-[#343331] bg-[#151515] px-3 py-3 sm:px-4 sm:py-4 text-[11px] text-slate-300 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="uppercase tracking-[0.16em] text-[10px] text-slate-400">
                                Project stats
                              </div>
                              <div className="mt-1 font-mono text-sm text-slate-100">
                                {headerProject.ticker} ·{" "}
                                {formatCurrencyShort(
                                  headerProject.currentPrice ??
                                    headerProject.basePrice ??
                                    0,
                                )}
                              </div>
                            </div>
                            <div className="text-right text-[10px] text-slate-500">
                              Net shares:{" "}
                              <span className="font-mono">
                                {headerProject.netShares ?? 0}
                              </span>
                              <br />
                              Trades:{" "}
                              <span className="font-mono">
                                {headerProject.totalTrades ?? 0}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div>
                              <div className="text-[10px] uppercase tracking-wide text-slate-500">
                                Base price
                              </div>
                              <div className="mt-0.5 font-mono text-[11px] text-slate-100">
                                {formatCurrency(headerProject.basePrice)}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wide text-slate-500">
                                Total volume
                              </div>
                              <div className="mt-0.5 font-mono text-[11px] text-slate-100">
                                {(
                                  headerProject.totalVolume ?? 0
                                ).toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wide text-slate-500">
                                Market cap
                              </div>
                              <div className="mt-0.5 font-mono text-[11px] text-slate-100">
                                {formatCurrencyShort(
                                  headerProject.marketCap ?? 0,
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wide text-slate-500">
                                24h / timeframe
                              </div>
                              <div className="mt-0.5 font-mono text-[11px] text-slate-100">
                                {headerTimeframeChange.pct >= 0 ? "+" : ""}
                                {headerTimeframeChange.pct.toFixed(2)}%
                              </div>
                            </div>
                          </div>

                          {headerProject.description && (
                            <div className="pt-2 mt-1 border-t border-[#2b2a28] text-[11px] text-slate-300 leading-snug line-clamp-4">
                              {headerProject.description}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* KICKSTART INVESTMENTS PANEL */}
                      <div className="rounded-xl border border-[#343331] bg-[#151515] px-3 py-3 sm:px-4 sm:py-4 text-[11px] text-slate-300 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                            Kickstart investments
                          </span>
                          {loadingTeamStatus ? (
                            <span className="text-[10px] text-slate-500">
                              Loading…
                            </span>
                          ) : teamStatus ? (
                            <span className="font-mono text-[11px] text-slate-100">
                              {formatCurrency(teamStatus.funding)} total
                            </span>
                          ) : null}
                        </div>

                        {teamStatusError && (
                          <p className="text-[10px] text-red-300">
                            {teamStatusError}
                          </p>
                        )}

                        {loadingTeamStatus &&
                          !teamStatus &&
                          !teamStatusError && (
                            <p className="text-[10px] text-slate-500">
                              Fetching latest Kickstart investments for this
                              team…
                            </p>
                          )}

                        {teamStatus && teamStatus.investments.length > 0 && (
                          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                            {teamStatus.investments.slice(0, 3).map((inv) => (
                              <div
                                key={inv.id}
                                className="rounded-md border border-[#2b2a28] bg-[#191817] px-2.5 py-1.5"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-mono text-[11px] text-slate-100 truncate">
                                      {inv.investorName || inv.investorId}
                                    </span>
                                    {inv.isPartner && (
                                      <span className="text-[9px] uppercase tracking-[0.16em] rounded-full bg-amber-900/60 text-amber-200 px-1.5 py-0.5">
                                        Partner
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-mono text-[11px] text-bt-green-300">
                                    +{formatCurrencyShort(inv.amount)}
                                  </span>
                                </div>
                                {inv.comment && (
                                  <p className="mt-0.5 text-[10px] text-slate-400 line-clamp-2">
                                    “{inv.comment}”
                                  </p>
                                )}
                                <p className="mt-0.5 text-[9px] text-slate-500">
                                  {new Date(inv.createdAt).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "numeric",
                                      minute: "2-digit",
                                    },
                                  )}
                                </p>
                              </div>
                            ))}

                            {teamStatus.investments.length > 3 && (
                              <p className="text-[9px] text-slate-500">
                                + {teamStatus.investments.length - 3} more
                                investment
                                {teamStatus.investments.length - 3 === 1
                                  ? ""
                                  : "s"}
                              </p>
                            )}
                          </div>
                        )}

                        {!loadingTeamStatus &&
                          teamStatus &&
                          teamStatus.investments.length === 0 && (
                            <p className="text-[10px] text-slate-500">
                              No Kickstart investments yet — this team is still
                              waiting for its first backers.
                            </p>
                          )}
                      </div>

                      {/* TRADE TICKET */}
                      <div className="border-t border-[#3A3938] pt-3 sm:pt-4">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex flex-col">
                            <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                              Trade ticket
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Market-style order · simulated exchange
                            </span>
                          </div>
                          {isSubmittingTrade && (
                            <span className="text-[10px] text-slate-400 italic">
                              Submitting…
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-4 sm:gap-5">
                          {/* SUMMARY STRIP */}
                          <div className="rounded-lg border border-slate-700/80 bg-gradient-to-r from-[#181818] to-[#111111] px-3 py-2.5 sm:px-4 sm:py-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                              {/* Left: main numbers */}
                              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                                <div className="flex flex-col">
                                  <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                    Est. cost (incl. fee)
                                  </span>
                                  <span className="font-mono text-base sm:text-lg text-slate-50 leading-tight">
                                    {formatCurrency(estimatedValue)}
                                  </span>
                                </div>

                                <div className="flex flex-col">
                                  <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                    Est. execution price
                                  </span>
                                  <span className="font-mono text-sm sm:text-base text-slate-100 leading-tight">
                                    {estimatedExecutionPrice
                                      ? formatCurrency(estimatedExecutionPrice)
                                      : "—"}
                                  </span>
                                </div>

                                {/* <div className="flex flex-col">
                                  <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                    Size
                                  </span>
                                  <span className="font-mono text-sm text-slate-100">
                                    {tradeSize.toLocaleString()}{" "}
                                    <span className="text-[11px]">sh</span>
                                  </span>
                                </div> */}
                              </div>

                              {/* Right: impact + cash */}
                              <div className="flex flex-col items-start sm:items-end gap-1.5 text-[11px]">
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1">
                                  <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                    Execution premium
                                  </span>
                                  <span
                                    className={`font-mono text-xs ${
                                      slippagePct > 0.05
                                        ? "text-bt-red-300"
                                        : slippagePct < -0.05
                                          ? "text-bt-green-300"
                                          : "text-slate-200"
                                    }`}
                                  >
                                    {livePrice && estimatedExecutionPrice
                                      ? `${slippagePct >= 0 ? "+" : ""}${slippagePct.toFixed(2)}%`
                                      : "—"}
                                  </span>
                                </div>

                                {portfolioSnapshot && (
                                  <div className="text-[10px] text-slate-400">
                                    Cash after est. fill:{" "}
                                    <span className="font-mono text-slate-100">
                                      {formatCurrency(
                                        portfolioSnapshot.account.cashBalance -
                                          estimatedValue,
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* SIZE + DETAILS */}
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                            {/* LEFT: size + presets + buttons */}
                            <div className="flex-1 lg:max-w-sm">
                              <label className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                Order size
                              </label>

                              <div className="flex items-center gap-2">
                                <Input
                                  className="h-10 flex-1 rounded-md bg-[#0B0B0B] text-sm border border-slate-700/70 hover:border-slate-400 focus-visible:border-sky-400 focus-visible:ring-0 font-mono"
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={tradeShares}
                                  onChange={(e) => {
                                    const next = e.target.value.replace(
                                      /[^0-9]/g,
                                      "",
                                    );
                                    setTradeShares(next);
                                  }}
                                  onBlur={(e) => {
                                    const cleaned = e.target.value.replace(
                                      /[^0-9]/g,
                                      "",
                                    );
                                    const n = Number(cleaned);
                                    if (
                                      !cleaned ||
                                      !Number.isFinite(n) ||
                                      n <= 0
                                    ) {
                                      setTradeShares("1");
                                    } else {
                                      setTradeShares(String(Math.floor(n)));
                                    }
                                  }}
                                  placeholder="0"
                                />
                                <span className="text-xs text-slate-500">
                                  shares
                                </span>
                              </div>

                              {/* Presets */}
                              <div className="mt-2 inline-flex flex-wrap items-center gap-1.5 text-[10px] text-slate-300">
                                <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                  Presets
                                </span>
                                <div className="inline-flex rounded-full border border-slate-700/70 bg-black/40 px-0.5 py-0.5">
                                  <button
                                    type="button"
                                    className="rounded-full px-2 py-0.5 text-[10px] hover:bg-slate-600/40 hover:text-slate-50 transition-colors"
                                    onClick={() => setTradeShares("1")}
                                  >
                                    1
                                  </button>
                                  <button
                                    type="button"
                                    className="rounded-full px-2 py-0.5 text-[10px] hover:bg-slate-600/40 hover:text-slate-50 transition-colors"
                                    onClick={() => setTradeShares("10")}
                                  >
                                    10
                                  </button>
                                  {portfolioHolding?.shares ? (
                                    <button
                                      type="button"
                                      className="rounded-full px-2 py-0.5 text-[10px] hover:bg-slate-600/40 hover:text-slate-50 transition-colors"
                                      onClick={() =>
                                        setTradeShares(
                                          String(portfolioHolding.shares),
                                        )
                                      }
                                    >
                                      Max sell ({portfolioHolding.shares})
                                    </button>
                                  ) : null}
                                </div>
                              </div>

                              {/* Buy / Sell buttons stacked under input */}
                              <div className="mt-4 flex flex-col gap-2 pr-14">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="flex-1 h-10 bg-bt-green-700 hover:bg-bt-green-500 text-sm"
                                    disabled={
                                      isSubmittingTrade || loadingPortfolio
                                    }
                                    onClick={() => handleTrade("BUY")}
                                  >
                                    Buy
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="flex-1 h-10 bg-bt-red-600 text-red-100 hover:bg-bt-red-500 text-sm"
                                    disabled={
                                      isSubmittingTrade || loadingPortfolio
                                    }
                                    onClick={() => handleTrade("SELL")}
                                  >
                                    Sell
                                  </Button>
                                </div>

                                {portfolioSnapshot && (
                                  <div className="text-[16px] text-slate-400 mt-2">
                                    Available cash:{" "}
                                    <span className="font-mono text-slate-100">
                                      {formatCurrency(
                                        portfolioSnapshot.account.cashBalance,
                                      )}
                                    </span>
                                  </div>
                                )}

                                {tradeError && (
                                  <div className="text-[11px] text-red-300">
                                    {tradeError}
                                  </div>
                                )}
                                {tradeSuccess && (
                                  <div className="text-[11px] text-bt-green-300">
                                    {tradeSuccess}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* RIGHT: order summary / price details */}
                            <div className="flex-1  lg:mt-0 lg:flex lg:flex-col lg:items-end">
                              <div className="w-full lg:max-w-xs rounded-lg border border-slate-700/70 bg-black/30 px-3 py-2.5">
                                <div className="mb-2 flex items-baseline justify-between gap-3">
                                  <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                                    Order summary
                                  </span>
                                  <span className="font-mono text-sm text-slate-50">
                                    {formatCurrency(estimatedValue)}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                                  <span className="text-[10px] text-slate-500">
                                    Last price
                                  </span>
                                  <span className="font-mono text-right text-slate-200">
                                    {livePrice
                                      ? formatCurrency(livePrice)
                                      : "—"}
                                  </span>

                                  <span className="text-[10px] text-slate-500">
                                    Est. execution price
                                  </span>
                                  <span className="font-mono text-right text-slate-100">
                                    {estimatedExecutionPrice
                                      ? formatCurrency(estimatedExecutionPrice)
                                      : "—"}
                                  </span>

                                  <span className="text-[10px] text-slate-500">
                                    Notional (≈ price × size)
                                  </span>
                                  <span className="font-mono text-right text-slate-200">
                                    {tradeSize && estimatedExecutionPrice
                                      ? formatCurrency(
                                          tradeSize * estimatedExecutionPrice,
                                        )
                                      : "—"}
                                  </span>

                                  <span className="text-[10px] text-slate-500">
                                    Fees &amp; slippage baked in
                                  </span>
                                  <span className="font-mono text-right text-slate-100">
                                    {formatCurrency(estimatedValue)}
                                  </span>
                                </div>
                              </div>

                              <p
                                className="mt-1.5 text-[10px] 
                              text-slate-500 leading-snug lg:text-right lg:max-w-xs"
                              >
                                Large orders move the price and include a 2%
                                transaction fee. Your final fill and mark may
                                differ slightly once the trade hits the book.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* RECENT ACTIVITY */}
                      <div className="pt-3 sm:pt-4 border-t border-[#3A3938] mt-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2">
                            Live tape
                            <span className="text-[10px] font-normal text-slate-500">
                              {recentActivityTotal} trade
                              {recentActivityTotal === 1 ? "" : "s"}
                            </span>
                          </h3>
                          <span className="text-[10px] text-slate-500">
                            Showing {recentActivity.length} most recent
                          </span>
                        </div>

                        <div className="max-h-64 overflow-y-auto pr-1 space-y-2">
                          {recentActivity.length === 0 ? (
                            <div className="text-xs text-slate-500">
                              {loadingTrades
                                ? "Loading recent trades…"
                                : "No trades yet — be the first to trade this stock."}
                            </div>
                          ) : (
                            recentActivity.map((investment) => {
                              const cashSign =
                                investment.side === "BUY" ? "-" : "+";
                              const isBuy = investment.side === "BUY";
                              const cashColor = isBuy
                                ? "text-bt-red-300"
                                : "text-bt-green-300";

                              return (
                                <div
                                  key={investment.id}
                                  className="flex items-center gap-3 rounded-lg border border-[#403f3d] bg-gradient-to-r from-[#262523] via-[#2b2a28] to-[#1f1e1c] px-3 py-2.5 hover:border-slate-300/60 transition-colors"
                                >
                                  <div
                                    className={`h-full w-1 rounded-full ${
                                      isBuy ? "bg-emerald-400" : "bg-red-400"
                                    }`}
                                  />
                                  <Avatar className="h-9 w-9 flex-shrink-0">
                                    <AvatarFallback className="bg-bt-blue-300 text-bt-blue-600">
                                      {getInitials(investment.investorName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="font-light text-sm truncate">
                                        {investment.investorName}
                                      </p>
                                      <span
                                        className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full ${
                                          isBuy
                                            ? "bg-emerald-900/70 text-emerald-200"
                                            : "bg-red-900/70 text-red-200"
                                        }`}
                                      >
                                        {investment.side}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-300 mt-0.5 flex flex-wrap gap-1">
                                      <span className="font-mono">
                                        {investment.shares} @{" "}
                                        {formatCurrency(investment.price)}
                                      </span>
                                      <span className="text-slate-500">·</span>
                                      <span className="text-[10px] text-slate-400">
                                        {investment.timestamp}
                                      </span>
                                    </p>
                                  </div>
                                  <p
                                    className={`text-sm font-light flex-shrink-0 font-mono ${cashColor}`}
                                  >
                                    {cashSign}
                                    {formatCurrencyShort(investment.amount)}
                                  </p>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-sm text-slate-400 text-center py-8">
                      Select a project from the ticker or market board to see
                      details and trade.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              {/* Market board */}
              <Card className="bg-[#201F1E] rounded-none border border-[#2A2A2A]">
                <CardHeader className="pb-3 space-y-3 border-b border-[#2A2A2A] bg-[#181716]">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg font-light tracking-[0.18em] uppercase text-slate-100">
                      Market board
                    </CardTitle>

                    <div className="flex flex-col items-end gap-0.5 text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">
                        {TIMEFRAME_LABELS[timeframe]} change
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {projects.length} stock
                        {projects.length === 1 ? "" : "s"}
                        {isMarketFiltered &&
                          ` · showing ${filteredProjects.length}`}
                      </span>
                    </div>
                  </div>

                  {/* Controls row */}
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                    {/* Search */}
                    <div className="w-full sm:max-w-xs">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by name or ticker…"
                          className="h-8 w-full bg-[#111111] border border-slate-700/70 text-xs pl-8 pr-2 rounded-md placeholder:text-slate-500 focus-visible:ring-0 focus-visible:border-sky-400"
                        />
                      </div>
                    </div>

                    {/* Filter + sort chips */}
                    <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end">
                      {/* Filter */}
                      <div className="inline-flex items-center gap-1 text-[8px] uppercase tracking-[0.18em] text-slate-400">
                        <span>Filter</span>
                        <div className="inline-flex rounded-full border border-slate-700/70 bg-black/40 px-0.5 py-0.5">
                          {(["ALL", "UP", "DOWN"] as MarketFilter[]).map(
                            (f) => {
                              const active = marketFilter === f;
                              return (
                                <button
                                  key={f}
                                  onClick={() => setMarketFilter(f)}
                                  className={`rounded-full px-2 py-0.5 text-[8px] transition-colors ${
                                    active
                                      ? "bg-slate-100 text-[#111] font-semibold"
                                      : "text-slate-400 hover:bg-slate-600/40 hover:text-slate-50"
                                  }`}
                                >
                                  {f === "ALL"
                                    ? "All"
                                    : f === "UP"
                                      ? "Gainers"
                                      : "Losers"}
                                </button>
                              );
                            },
                          )}
                        </div>
                      </div>

                      {/* Sort */}
                      <div className="inline-flex items-center gap-1 text-[8px] uppercase tracking-[0.18em] text-slate-400">
                        <span>Sort</span>
                        <div className="inline-flex rounded-full border border-slate-700/70 bg-black/40 px-0.5 py-0.5">
                          {(
                            ["CHANGE", "VOLUME", "TICKER"] as MarketSortKey[]
                          ).map((key) => {
                            const active = sortKey === key;
                            return (
                              <button
                                key={key}
                                onClick={() => setSortKey(key)}
                                className={`rounded-full px-2 py-0.5 text-[8px] transition-colors ${
                                  active
                                    ? "bg-slate-100 text-[#111] font-semibold"
                                    : "text-slate-400 hover:bg-slate-600/40 hover:text-slate-50"
                                }`}
                              >
                                {key === "CHANGE"
                                  ? "% Change"
                                  : key === "VOLUME"
                                    ? "Volume"
                                    : "Ticker"}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-3">
                  <div className="max-h-64 overflow-y-auto pr-1 space-y-1.5">
                    {loadingSnapshot && !projects.length ? (
                      <div className="text-xs text-slate-400">
                        Loading market…
                      </div>
                    ) : projects.length === 0 ? (
                      <div className="text-xs text-slate-400">
                        No projects listed yet.
                      </div>
                    ) : filteredProjects.length === 0 ? (
                      <div className="text-xs text-slate-400">
                        No stocks match your filters.
                      </div>
                    ) : (
                      filteredProjects.map((p) => {
                        const isSelected =
                          p.projectId === headerProject?.projectId;
                        const tfChange = timeframeChanges[p.projectId];
                        const pct = tfChange?.pct ?? safePct(p.priceChangePct);
                        const isPositive = pct >= 0;
                        const mc = p.marketCap ?? 0;

                        return (
                          <button
                            key={p.projectId}
                            onClick={() => selectProject(p.projectId)}
                            className={`
                group w-full rounded-md border px-3 py-2.5 text-left transition-all
                ${
                  isSelected
                    ? "border-sky-500/80 bg-[#151515] shadow-[0_0_0_1px_rgba(56,189,248,0.5)]"
                    : "border-transparent bg-[#151515] hover:bg-[#101010] hover:border-slate-600/70"
                }
              `}
                          >
                            <div className="flex items-center gap-3">
                              {/* Direction strip */}
                              <div
                                className={`h-10 w-1 rounded-full ${
                                  isPositive
                                    ? "bg-bt-green-400"
                                    : "bg-bt-red-400"
                                }`}
                              />

                              {/* Main info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="truncate text-sm font-medium text-slate-100">
                                    {p.name}
                                  </p>
                                  <span className="font-mono text-[10px] uppercase text-slate-400 bg-black/40 border border-slate-700/70 px-1.5 py-0.5 rounded-full">
                                    {p.ticker}
                                  </span>
                                </div>

                                <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                                  <span className="flex items-baseline gap-1">
                                    <span className="text-slate-300">
                                      {formatCurrencyShort(p.currentPrice)}
                                    </span>
                                    <span className="text-[9px] uppercase tracking-[0.16em] text-slate-500">
                                      Last
                                    </span>
                                  </span>

                                  <span className="flex items-center gap-1 text-[11px]">
                                    {isPositive ? (
                                      <TrendingUp className="h-3 w-3 text-bt-green-300" />
                                    ) : (
                                      <TrendingDown className="h-3 w-3 text-bt-red-300" />
                                    )}
                                    <span
                                      className={`font-mono ${
                                        isPositive
                                          ? "text-bt-green-300"
                                          : "text-bt-red-300"
                                      }`}
                                    >
                                      {isPositive ? "+" : ""}
                                      {pct.toFixed(1)}%
                                    </span>
                                  </span>

                                  <span className="text-[10px] text-slate-500">
                                    MC{" "}
                                    <span className="font-mono text-slate-300">
                                      {formatCurrencyShort(mc)}
                                    </span>
                                  </span>

                                  <span className="text-[10px] text-slate-500">
                                    Vol{" "}
                                    <span className="font-mono text-slate-300">
                                      {p.totalVolume ?? 0}
                                    </span>
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                <span
                                  className={`font-mono text-sm ${
                                    isPositive
                                      ? "text-bt-green-300"
                                      : "text-bt-red-300"
                                  }`}
                                >
                                  {isPositive ? "+" : ""}
                                  {pct.toFixed(1)}%
                                </span>
                                <span className="rounded-full bg-black/40 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-slate-400">
                                  {isPositive
                                    ? "Gainer"
                                    : pct === 0
                                      ? "Flat"
                                      : "Loser"}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Portfolio breakdown */}
              <Card className="bg-[#201F1E] rounded-none border border-[#2A2A2A]">
                <CardHeader className="pb-6 space-y-3 border-b border-[#2A2A2A] bg-[#181716]">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg font-light tracking-[0.18em] uppercase text-slate-100">
                      Your portfolio
                    </CardTitle>

                    {portfolioSnapshot && portfolioBreakdown ? (
                      <div className="flex flex-col items-end gap-0.5 text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">
                          {portfolioBreakdown.positions.length} position
                          {portfolioBreakdown.positions.length === 1 ? "" : "s"}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Total value{" "}
                          <span className="font-mono text-slate-200">
                            {formatCurrency(portfolioBreakdown.total)}
                          </span>
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500">
                        Log in to see live allocation &amp; P&amp;L
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-3 space-y-4 sm:space-y-5 text-xs text-slate-200">
                  {!portfolioSnapshot ? (
                    <div className="text-[11px] text-slate-400">
                      Log in to see allocation, P&amp;L, and top holdings.
                    </div>
                  ) : portfolioBreakdown ? (
                    <>
                      {/* HIGH-LEVEL STATS */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="rounded-lg border border-[#333230] bg-[#141414] px-3 py-2.5">
                          <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                            Total value
                          </div>
                          <div className="mt-1 font-mono text-xs text-slate-50">
                            {formatCurrency(portfolioBreakdown.total)}
                          </div>
                        </div>
                        <div className="rounded-lg border border-[#333230] bg-[#141414] px-3 py-2.5">
                          <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                            Cash
                          </div>
                          <div className="mt-1 font-mono text-xs text-slate-50">
                            {formatCurrency(portfolioBreakdown.cash)}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {portfolioBreakdown.cashPct.toFixed(0)}% of
                            portfolio
                          </div>
                        </div>
                        <div className="rounded-lg border border-[#333230] bg-[#141414] px-3 py-2.5">
                          <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                            Equity
                          </div>
                          <div className="mt-1 font-mono text-xs text-slate-50">
                            {formatCurrency(portfolioBreakdown.equity)}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {portfolioBreakdown.equityPct.toFixed(0)}% invested
                          </div>
                        </div>
                        <div className="rounded-lg border border-[#333230] bg-[#141414] px-3 py-2.5">
                          <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                            Open P&amp;L
                          </div>
                          <div
                            className={`mt-1 font-mono text-xs ${
                              portfolioBreakdown.openPnl > 0
                                ? "text-bt-green-300"
                                : portfolioBreakdown.openPnl < 0
                                  ? "text-bt-red-300"
                                  : "text-slate-50"
                            }`}
                          >
                            {formatCurrency(portfolioBreakdown.openPnl)}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Unrealized on current positions
                          </div>
                        </div>
                      </div>

                      {/* ALLOCATION BAR */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="uppercase tracking-[0.16em]">
                            Allocation
                          </span>
                          <span className="font-mono text-[10px] text-slate-300">
                            Cash {portfolioBreakdown.cashPct.toFixed(0)}% ·
                            Equity {portfolioBreakdown.equityPct.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[#101010] overflow-hidden flex">
                          <div
                            className="h-full bg-gradient-to-r from-sky-400 to-sky-300"
                            style={{
                              width: `${Math.min(portfolioBreakdown.cashPct, 100)}%`,
                            }}
                          />
                          <div
                            className="h-full bg-gradient-to-r from-bt-green-400 to-emerald-300"
                            style={{
                              width: `${Math.min(portfolioBreakdown.equityPct, 100)}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Dry powder</span>
                          <span>Capital at work</span>
                        </div>
                      </div>

                      {/* DIVERSIFICATION TAG */}
                      {portfolioBreakdown.positions.length > 0 && (
                        <div className="text-[10px] text-slate-400">
                          <span className="mr-1.5">Diversification:</span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${
                              portfolioBreakdown.positions.length <= 2
                                ? "border-red-500/40 bg-red-900/30 text-red-200"
                                : portfolioBreakdown.positions.length <= 5
                                  ? "border-amber-500/40 bg-amber-900/30 text-amber-200"
                                  : "border-emerald-500/40 bg-emerald-900/30 text-emerald-200"
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {portfolioBreakdown.positions.length <= 2
                              ? "Very concentrated"
                              : portfolioBreakdown.positions.length <= 5
                                ? "Moderately concentrated"
                                : "Broadly diversified"}
                          </span>
                        </div>
                      )}

                      {/* TOP HOLDINGS */}
                      <div className="pt-3 border-t border-[#3A3938] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                            Top holdings
                          </span>
                          {portfolioBreakdown.topHoldings.length > 0 && (
                            <span className="text-[10px] text-slate-500">
                              Showing {portfolioBreakdown.topHoldings.length} of{" "}
                              {portfolioBreakdown.positions.length} position
                              {portfolioBreakdown.positions.length === 1
                                ? ""
                                : "s"}
                            </span>
                          )}
                        </div>

                        {portfolioBreakdown.topHoldings.length === 0 ? (
                          <div className="text-[11px] text-slate-500">
                            No holdings yet. Buy your first stock to see it
                            here.
                          </div>
                        ) : (
                          portfolioBreakdown.topHoldings.map((h: any) => {
                            const pctOfPort =
                              portfolioBreakdown.total > 0
                                ? (h.marketValue / portfolioBreakdown.total) *
                                  100
                                : 0;

                            const positionPnl =
                              typeof h.pnl === "number" ? h.pnl : 0;
                            const positionPnlPct =
                              h.avgPrice && h.shares
                                ? (positionPnl / (h.avgPrice * h.shares)) * 100
                                : 0;

                            const pnlColor =
                              positionPnl > 0
                                ? "text-bt-green-300"
                                : positionPnl < 0
                                  ? "text-bt-red-300"
                                  : "text-slate-300";

                            return (
                              <button
                                key={h.projectId}
                                type="button"
                                onClick={() => selectProject(h.projectId)}
                                className="w-full text-left rounded-lg border border-transparent hover:border-slate-500/70 hover:bg-[#171716] transition-colors px-2.5 py-2"
                              >
                                <div className="flex items-center justify-between text-[11px] gap-3">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-mono uppercase text-[11px] text-slate-100">
                                      {h.ticker}
                                    </span>
                                    <span className="truncate max-w-[140px] text-slate-300">
                                      {h.name}
                                    </span>
                                  </div>
                                  <div className="text-right flex flex-col items-end gap-0.5">
                                    <div className="font-mono text-[11px] text-slate-100">
                                      {formatCurrencyShort(h.marketValue)}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                      <span>
                                        {pctOfPort.toFixed(1)}% of port
                                      </span>
                                      <span className={pnlColor}>
                                        {positionPnl >= 0 ? "+" : ""}
                                        {formatCurrencyShort(positionPnl)} (
                                        {positionPnlPct >= 0 ? "+" : ""}
                                        {positionPnlPct.toFixed(1)}
                                        %)
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-1.5 h-1.5 rounded-full bg-[#111111] overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-bt-blue-400 via-bt-green-400 to-emerald-300"
                                    style={{
                                      width: `${Math.min(pctOfPort, 100)}%`,
                                    }}
                                  />
                                </div>
                              </button>
                            );
                          })
                        )}

                        {portfolioBreakdown.otherValue > 0 && (
                          <div className="text-[10px] text-slate-500">
                            +{" "}
                            {formatCurrencyShort(portfolioBreakdown.otherValue)}{" "}
                            in other positions
                          </div>
                        )}
                      </div>
                    </>
                  ) : null}
                </CardContent>
              </Card>

              <Card className="bg-[#201F1E] rounded-none border border-[#2A2A2A]">
                <CardHeader className="pb-4 space-y-2 border-b border-[#2A2A2A] bg-[#181716]">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg font-light tracking-[0.18em] uppercase text-slate-100">
                      Trader leaderboard
                    </CardTitle>

                    {leaderboard && (
                      <div className="text-right text-[10px] text-slate-500">
                        <div className="uppercase tracking-[0.16em]">
                          {leaderboard.traders} active trader
                          {leaderboard.traders === 1 ? "" : "s"}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Ranked by total BTX P&amp;L (cash + equity vs starting
                    balance).
                  </p>
                </CardHeader>

                <CardContent className="pt-3">
                  {loadingLeaderboard && !leaderboard ? (
                    <div className="text-[11px] text-slate-400">
                      Loading leaderboard…
                    </div>
                  ) : leaderboardError ? (
                    <div className="text-[11px] text-red-300">
                      {leaderboardError}
                    </div>
                  ) : !leaderboard ||
                    (leaderboard.top.length === 0 &&
                      leaderboard.bottom.length === 0) ? (
                    <div className="text-[11px] text-slate-400">
                      No trading activity yet. Once people start trading, the
                      leaderboard will light up.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Top traders */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] uppercase tracking-[0.16em] text-emerald-200">
                            Top traders
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Best total P&amp;L
                          </span>
                        </div>

                        {leaderboard.top.map((t, idx) => {
                          const positive = t.totalPnl >= 0;

                          return (
                            <div
                              key={`top-${t.userId}`}
                              className="flex items-center gap-2 rounded-lg border border-emerald-600/40 bg-gradient-to-r from-emerald-900/40 via-[#141414] to-transparent px-2.5 py-2 shadow-[0_0_0_1px_rgba(0,0,0,0.6)]"
                            >
                              <div className="flex flex-col items-center justify-center w-6 text-[10px] text-emerald-200 font-mono">
                                #{idx + 1}
                              </div>
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarFallback className="bg-emerald-300/90 text-emerald-900">
                                  {getInitials(t.userId)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="truncate text-[12px] text-slate-100">
                                    {formatUserLabel(t.userId)}
                                  </p>
                                  <span
                                    className={`font-mono text-xs ${
                                      positive
                                        ? "text-bt-green-300"
                                        : "text-bt-red-300"
                                    }`}
                                  >
                                    {positive ? "+" : ""}
                                    {formatCurrencyShort(t.totalPnl)}
                                  </span>
                                </div>
                                <div className="mt-0.5 flex items-center justify-between gap-2 text-[10px] text-slate-400">
                                  <span>
                                    Return{" "}
                                    <span
                                      className={
                                        positive
                                          ? "text-bt-green-300"
                                          : "text-bt-red-300"
                                      }
                                    >
                                      {positive ? "+" : ""}
                                      {t.returnPct.toFixed(1)}%
                                    </span>
                                  </span>
                                  <span className="font-mono text-[10px] text-slate-400">
                                    {t.positionsCount} pos ·{" "}
                                    {formatCurrencyShort(t.totalValue)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Lowest traders */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] uppercase tracking-[0.16em] text-red-200">
                            Most underwater
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Lowest total P&amp;L
                          </span>
                        </div>

                        {leaderboard.bottom.map((t, idx) => {
                          const positive = t.totalPnl >= 0;

                          return (
                            <div
                              key={`bottom-${t.userId}`}
                              className="flex items-center gap-2 rounded-lg border border-red-600/40 bg-gradient-to-r from-red-900/40 via-[#141414] to-transparent px-2.5 py-2 shadow-[0_0_0_1px_rgba(0,0,0,0.6)]"
                            >
                              <div className="flex flex-col items-center justify-center w-6 text-[10px] text-red-200 font-mono">
                                #{idx + 1}
                              </div>
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarFallback className="bg-red-300/90 text-red-900">
                                  {getInitials(t.userId)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="truncate text-[12px] text-slate-100">
                                    {formatUserLabel(t.userId)}
                                  </p>
                                  <span
                                    className={`font-mono text-xs ${
                                      positive
                                        ? "text-bt-green-300"
                                        : "text-bt-red-300"
                                    }`}
                                  >
                                    {positive ? "+" : ""}
                                    {formatCurrencyShort(t.totalPnl)}
                                  </span>
                                </div>
                                <div className="mt-0.5 flex items-center justify-between gap-2 text-[10px] text-slate-400">
                                  <span>
                                    Return{" "}
                                    <span
                                      className={
                                        positive
                                          ? "text-bt-green-300"
                                          : "text-bt-red-300"
                                      }
                                    >
                                      {positive ? "+" : ""}
                                      {t.returnPct.toFixed(1)}%
                                    </span>
                                  </span>
                                  <span className="font-mono text-[10px] text-slate-400">
                                    {t.positionsCount} pos ·{" "}
                                    {formatCurrencyShort(t.totalValue)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BtxPage;

type TickerProject = {
  projectId: string;
  ticker: string;
  currentPrice?: number | null;
  priceChangePct?: number | null;
};

type TickerProps = {
  projects: TickerProject[];
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
  timeframeChanges: Record<
    string,
    {
      change: number;
      pct: number;
    }
  >;
};

const TICKER_MIN_ITEMS_FOR_MARQUEE = 6;

const StaticTicker: React.FC<TickerProps> = React.memo(
  ({ projects, selectedProjectId, onSelectProject, timeframeChanges }) => {
    if (!projects.length) {
      return (
        <div className="mb-4 rounded-md border border-[#2A2A2A] bg-gradient-to-r from-[#181818] via-[#151515] to-[#181818] overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#2A2A2A] text-[10px] uppercase tracking-[0.18em] text-slate-400">
            <span>Market ticker</span>
            <span className="text-[9px] text-slate-500">
              Tap a symbol to jump to that stock
            </span>
          </div>
          <div className="px-3 py-2 text-[11px] text-slate-400">
            No projects yet. Once teams are listed, they&apos;ll show up here.
          </div>
        </div>
      );
    }

    const items = projects.map((p) => {
      const tfChange = timeframeChanges[p.projectId];
      const pct = tfChange?.pct ?? safePct(p.priceChangePct);
      const positive = pct >= 0;

      return {
        ...p,
        pct,
        positive,
      };
    });

    return (
      <div className="mb-4 rounded-md border border-[#2A2A2A] bg-gradient-to-r from-[#181818] via-[#151515] to-[#181818] overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#2A2A2A] text-[10px] uppercase tracking-[0.18em] text-slate-400">
          <span>Market ticker</span>
          <span className="text-[9px] text-slate-500">
            Tap a symbol to jump to that stock
          </span>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#181818] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#181818] to-transparent" />

          <div className="flex gap-2 py-2 px-3 min-w-full overflow-x-auto">
            {items.map((p) => {
              const isActive = p.projectId === selectedProjectId;

              return (
                <button
                  key={p.projectId}
                  onClick={() => onSelectProject(p.projectId)}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] border transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-white/80 bg-white/10"
                      : "border-slate-700/60 bg-black/30 hover:bg-black/50"
                  }`}
                >
                  <span className="font-mono uppercase text-slate-100">
                    {p.ticker}
                  </span>
                  <span className="text-slate-200">
                    {formatCurrencyShort(p.currentPrice)}
                  </span>
                  <span
                    className={`flex items-center gap-1 font-mono ${
                      p.positive ? "text-bt-green-300" : "text-bt-red-300"
                    }`}
                  >
                    {p.positive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {p.positive ? "+" : ""}
                    {p.pct.toFixed(1)}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);
StaticTicker.displayName = "StaticTicker";
