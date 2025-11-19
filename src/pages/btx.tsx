// src/pages/btx.tsx

"use client";

import React, { useMemo, useState } from "react";
import Head from "next/head";
import {
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Activity,
  Wifi,
  WifiOff,
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

// Formatting helper

const round2 = (value: number): number =>
  Number.isFinite(value) ? Math.round(value * 100) / 100 : 0;

const formatCurrencyShort = (value: number | null | undefined) => {
  if (value == null || Number.isNaN(value)) return "—";
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
  return `$${value.toFixed(2)}`;
};

const formatCurrency = (value: number | null | undefined) => {
  if (value == null || Number.isNaN(value)) return "—";
  return `$${value.toFixed(2)}`;
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

  const [timeframe, setTimeframe] = useState<TimeframeKey>("15M");

  // market board controls
  const [searchQuery, setSearchQuery] = useState("");
  const [marketFilter, setMarketFilter] = useState<MarketFilter>("ALL");
  const [sortKey, setSortKey] = useState<MarketSortKey>("CHANGE");

  const headerProject = selectedProject || projects[0] || null;

  const projectMap = useMemo(() => {
    const map = new Map<string, (typeof projects)[0]>();
    projects.forEach((p) => map.set(p.projectId, p));
    return map;
  }, [projects]);

  // timeframe-based change for every project

  const timeframeChanges: Record<string, TimeframeChange> = useMemo(() => {
    const now = Date.now();
    const result: Record<string, TimeframeChange> = {};

    projects.forEach((p) => {
      const history = priceHistory[p.projectId] || [];
      const baseChange = safeNumber(p.priceChange, 0);
      const basePct = safePct(p.priceChangePct);

      if (history.length >= 2) {
        let points = history;

        if (timeframe !== "ALL") {
          const cutoff = now - TIMEFRAME_MS[timeframe];
          const filtered = history.filter((pt) => pt.ts >= cutoff);
          if (filtered.length >= 2) {
            points = filtered;
          }
        }

        const start = points[0]?.price;
        const end = points[points.length - 1]?.price;

        if (Number.isFinite(start) && Number.isFinite(end) && start !== 0) {
          const changeRaw = end - start;
          const pctRaw = (changeRaw / start) * 100;

          result[p.projectId] = {
            change: safeNumber(changeRaw, baseChange),
            pct: safeNumber(pctRaw, basePct),
          };
          return;
        }
      }

      // fallback to snapshot-based change if we cant compute from history
      result[p.projectId] = {
        change: baseChange,
        pct: basePct,
      };
    });

    return result;
  }, [projects, priceHistory, timeframe]);

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

    if (timeframe !== "ALL" && points.length > 1) {
      const cutoff = now - TIMEFRAME_MS[timeframe];
      const filtered = points.filter((pt) => pt.ts >= cutoff);
      if (filtered.length >= 2) {
        points = filtered;
      }
    }

    return points.map((pt) => ({
      ts: pt.ts,
      time: formatTimeLabel(pt.ts),
      value: pt.price,
    }));
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

  // --------- Trade estimates (approximate, execution may differ) ---------

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
      } else {
        await sellShares(headerProject.projectId, parsed);
        setTradeSuccess(`Sold ${parsed} share(s) of ${headerProject.ticker}.`);
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

  // --------- Render ---------

  return (
    <>
      <Head>
        <title>BizTech Exchange (BTX)</title>
      </Head>

      <div
        className={`${bricolageGrotesque.className} min-h-screen bg-[#111111] text-white w-full overflow-x-hidden`}
      >
        <div className="max-w-7xl mx-auto w-full min-h-screen flex flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {/* HEADER: title + live price + portfolio snapshot */}
          <div className="mb-4 flex-shrink-0 flex flex-wrap items-start justify-between gap-4">
            {/* Left: selected project headline */}
            <div className="flex flex-col gap-2 min-w-0">
              <div className="flex flex-wrap items-baseline gap-4">
                <h1
                  className={`${instrumentSerif.className} text-3xl sm:text-4xl font-light leading-tight truncate`}
                >
                  {headerProject ? headerProject.name : "BizTech Exchange"}
                </h1>

                {headerProject && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-baseline gap-3">
                      <p
                        className={`${instrumentSerif.className} text-2xl sm:text-3xl font-light leading-none`}
                      >
                        {formatCurrencyShort(
                          headerProject.currentPrice ??
                            headerProject.basePrice ??
                            0,
                        )}
                      </p>
                      <div
                        className={`flex items-center gap-1 text-sm font-light leading-none ${
                          headerTimeframeChange.change >= 0
                            ? "text-bt-green-300"
                            : "text-bt-red-300"
                        }`}
                      >
                        {headerTimeframeChange.change >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="truncate">
                          {headerTimeframeChange.change >= 0 ? "+" : "-"}
                          {formatCurrencyShort(
                            Math.abs(headerTimeframeChange.change),
                          )}{" "}
                          ({headerTimeframeChange.pct >= 0 ? "+" : "-"}
                          {Math.abs(headerTimeframeChange.pct).toFixed(2)}%)
                        </span>
                      </div>
                    </div>

                    <div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2">
                        {wsChip}
                        <span className="text-[10px] text-slate-400">
                          {loadingSnapshot
                            ? "Updating prices…"
                            : "Market running"}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                        Timeframe:
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
                        ).map((tf) => (
                          <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-1.5 py-0.5 rounded-full border transition-colors ${
                              timeframe === tf
                                ? "border-white text-white bg-white/10"
                                : "border-transparent hover:border-white/30 hover:bg-white/5"
                            }`}
                          >
                            {TIMEFRAME_LABELS[tf]}
                          </button>
                        ))}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Market stat chips */}
              <div className="flex flex-wrap gap-3 text-[11px] text-slate-300">
                {topGainer && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-900/10 px-3 py-1">
                    <span className="uppercase tracking-wide text-emerald-300">
                      Top gainer
                    </span>
                    <span className="font-mono text-xs">
                      {topGainer.ticker}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-300">
                      <TrendingUp className="h-3 w-3" />
                      {(() => {
                        const pct =
                          timeframeChanges[topGainer.projectId]?.pct ??
                          safePct(topGainer.priceChangePct);
                        return (
                          <>
                            {pct >= 0 ? "+" : ""}
                            {pct.toFixed(1)}%
                          </>
                        );
                      })()}
                    </span>
                  </div>
                )}
                {mostActive && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-900/10 px-3 py-1">
                    <span className="uppercase tracking-wide text-sky-300">
                      Most active
                    </span>
                    <span className="font-mono text-xs">
                      {mostActive.ticker}
                    </span>
                    <span className="text-sky-200">
                      Vol:{" "}
                      <span className="font-mono">
                        {mostActive.totalVolume ?? 0}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* right: portfolio mini-summary */}
            <div className="flex flex-col items-end text-xs text-[#D0D0D0] space-y-1 max-w-xs">
              {loadingPortfolio ? (
                <span>Loading portfolio…</span>
              ) : portfolio && portfolioSnapshot ? (
                <>
                  <div>
                    Cash:{" "}
                    <span className="font-mono">
                      {formatCurrency(portfolioSnapshot.account.cashBalance)}
                    </span>
                  </div>
                  <div>
                    Portfolio value:{" "}
                    <span className="font-mono">
                      {formatCurrency(portfolioSnapshot.totalPortfolioValue)}
                    </span>
                  </div>
                  {portfolioBreakdown && (
                    <div className="text-[11px] text-slate-400">
                      Open P&amp;L:{" "}
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
                  {portfolioError && (
                    <div className="text-[10px] text-red-300 text-right">
                      {portfolioError}
                    </div>
                  )}
                </>
              ) : portfolio ? (
                <>
                  <div>
                    Cash:{" "}
                    <span className="font-mono">
                      {formatCurrency(portfolio.account.cashBalance)}
                    </span>
                  </div>
                  <div>
                    Portfolio value:{" "}
                    <span className="font-mono">
                      {formatCurrency(portfolio.totalPortfolioValue)}
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-xs text-[#888] text-right">
                  Browsing as guest. Log in to trade and see your portfolio.
                </span>
              )}
            </div>
          </div>

          {/* Market snapshot row */}
          {marketSnapshot && (
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-md border border-[#2A2A2A] bg-[#171717] px-3 py-2 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wide text-slate-400">
                  Market breadth
                </span>
                <div className="flex gap-3 font-mono">
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
                <span className="text-[10px] uppercase tracking-wide text-slate-400">
                  Total volume
                </span>
                <span className="font-mono">
                  {marketSnapshot.totalVolume.toLocaleString()}
                </span>
              </div>
              <div className="rounded-md border border-[#2A2A2A] bg-[#171717] px-3 py-2 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wide text-slate-400">
                  Total market cap
                </span>
                <span className="font-mono">
                  {formatCurrencyShort(marketSnapshot.totalCap)}
                </span>
              </div>
            </div>
          )}

          {/* Error banner if snapshot failed */}
          {error && (
            <div className="mb-3 rounded border border-red-500/60 bg-red-900/40 px-3 py-2 text-xs text-red-200">
              BTX failed to load. Check backend logs and your serverless stack.
            </div>
          )}

          {/* Market ticker strip */}
          <div className="mb-4 rounded-md border border-[#2A2A2A] bg-gradient-to-r from-[#181818] via-[#151515] to-[#181818] px-3 py-2 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-[#444] scrollbar-track-transparent">
            {projects.length === 0 ? (
              <span className="text-[11px] text-slate-400">
                No projects yet. Once teams are listed, they&apos;ll show up
                here.
              </span>
            ) : (
              projects.map((p) => {
                const tfChange = timeframeChanges[p.projectId];
                const pct = tfChange?.pct ?? safePct(p.priceChangePct ?? 0);
                const positive = pct >= 0;
                const isActive = p.projectId === selectedProjectId;
                return (
                  <button
                    key={p.projectId}
                    onClick={() => selectProject(p.projectId)}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] mr-2 border transition-colors ${
                      isActive
                        ? "border-white/80 bg-white/10"
                        : "border-transparent bg-black/20 hover:bg-black/40"
                    }`}
                  >
                    <span className="font-mono uppercase">{p.ticker}</span>
                    <span className="text-slate-200">
                      {formatCurrencyShort(p.currentPrice)}
                    </span>
                    <span
                      className={`flex items-center gap-1 font-mono ${
                        positive ? "text-bt-green-300" : "text-bt-red-300"
                      }`}
                    >
                      {positive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {positive ? "+" : ""}
                      {pct.toFixed(1)}%
                    </span>
                  </button>
                );
              })
            )}
          </div>

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
                        <CartesianGrid
                          stroke="rgba(255,255,255,0.05)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="time"
                          tickMargin={8}
                          tickFormatter={(t) => t}
                          tick={{ fill: "#FFFFFF", fontSize: 12 }}
                          axisLine={{
                            stroke: "rgba(255,255,255,0.25)",
                            strokeWidth: 1,
                          }}
                          tickLine={{ stroke: "rgba(255,255,255,0.25)" }}
                        />
                        <YAxis
                          tickMargin={8}
                          domain={["dataMin", "dataMax"]}
                          tickFormatter={(value: number) =>
                            formatCurrencyShort(value)
                          }
                          tick={{ fill: "#FFFFFF", fontSize: 12 }}
                          axisLine={{
                            stroke: "rgba(255,255,255,0.25)",
                            strokeWidth: 1,
                          }}
                          tickLine={{ stroke: "rgba(255,255,255,0.25)" }}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={
                            <ChartTooltipContent
                              hideLabel
                              formatter={(value) => (
                                <span className="font-mono">
                                  {formatCurrency(value as number)}
                                </span>
                              )}
                            />
                          }
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
                          stroke="rgba(255,255,255,0.25)"
                          strokeDasharray="3 3"
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
                <CardContent className="font-light flex flex-col gap-4">
                  {headerProject ? (
                    <>
                      {/* position + fundamentals */}
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="space-y-1 text-xs text-slate-200">
                          <div>
                            Shares:{" "}
                            <span className="font-mono">
                              {portfolioHolding?.shares ?? 0}
                            </span>
                          </div>
                          <div>
                            Avg price:{" "}
                            <span className="font-mono">
                              {portfolioHolding
                                ? formatCurrency(portfolioHolding.avgPrice)
                                : "—"}
                            </span>
                          </div>
                          <div>
                            Market value:{" "}
                            <span className="font-mono">
                              {portfolioHolding
                                ? formatCurrency(portfolioHolding.marketValue)
                                : "—"}
                            </span>
                          </div>
                          <div>
                            P&amp;L:{" "}
                            <span
                              className={`font-mono ${
                                portfolioHolding && portfolioHolding.pnl !== 0
                                  ? portfolioHolding.pnl > 0
                                    ? "text-bt-green-300"
                                    : "text-bt-red-300"
                                  : "text-slate-300"
                              }`}
                            >
                              {portfolioHolding
                                ? formatCurrency(portfolioHolding.pnl)
                                : "—"}
                            </span>
                          </div>
                          {portfolioHolding && (
                            <>
                              <div>
                                P&amp;L %:{" "}
                                <span
                                  className={`font-mono ${
                                    positionPnlPct > 0
                                      ? "text-bt-green-300"
                                      : positionPnlPct < 0
                                        ? "text-bt-red-300"
                                        : "text-slate-300"
                                  }`}
                                >
                                  {positionPnlPct.toFixed(2)}%
                                </span>
                              </div>
                              {portfolioBreakdown && (
                                <div>
                                  Of portfolio:{" "}
                                  <span className="font-mono">
                                    {positionPortfolioPct.toFixed(2)}%
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        <div className="space-y-1 text-xs text-right text-slate-400 max-w-[260px]">
                          {/* <div>
                            Base: {formatCurrency(headerProject.basePrice)}
                          </div>
                          <div>
                            Seed:{" "}
                            {formatCurrency(headerProject.seedAmount ?? 0)}
                          </div> */}
                          {headerProject.description && (
                            <div className="mt-1 text-[11px] text-slate-300 line-clamp-3 text-left sm:text-right">
                              {headerProject.description}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Trade controls */}
                      <div className="mt-3 border-t border-[#3A3938] pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs uppercase tracking-wide text-slate-400">
                            Trade ticket
                          </span>
                          {isSubmittingTrade && (
                            <span className="text-[10px] text-slate-500">
                              Submitting…
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-3">
                          {/* qty + summary */}
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                            {/* Size input */}
                            <div className="flex-1 sm:max-w-[180px]">
                              <label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">
                                Size
                              </label>
                              <div className="flex items-center gap-2">
                                <Input
                                  className="h-9 flex-1 bg-[#111111] text-xs border-[#444]"
                                  type="number"
                                  min={1}
                                  step={1}
                                  value={tradeShares}
                                  onChange={(e) => {
                                    const raw = Number(e.target.value);
                                    if (!Number.isFinite(raw) || raw <= 0) {
                                      setTradeShares("1");
                                      return;
                                    }
                                    setTradeShares(String(Math.floor(raw)));
                                  }}
                                />
                                <span className="text-xs text-slate-500">
                                  shares
                                </span>
                              </div>
                            </div>

                            {/* Cost / price summary */}
                            <div className="flex-1 text-[11px] text-slate-400 space-y-1 sm:text-right">
                              <div>
                                Est. execution cost{" "}
                                <span className="text-[10px] text-slate-500">
                                  (incl. slippage & 2% fee)
                                </span>
                                :{" "}
                                <span className="font-mono">
                                  {formatCurrency(estimatedValue)}
                                </span>
                              </div>
                              <div className="flex justify-between gap-4 sm:justify-end sm:gap-6">
                                <span className="text-[10px] text-slate-500">
                                  Est. execution price
                                </span>
                                <span className="font-mono text-[10px]">
                                  {estimatedExecutionPrice
                                    ? formatCurrency(estimatedExecutionPrice)
                                    : "—"}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 sm:max-w-xs sm:ml-auto">
                                Actual execution and final price are set at the
                                time of fill and may differ slightly from these
                                estimates due to live order flow and randomness.
                              </div>
                            </div>
                          </div>

                          {/* buttons + cash + messages */}
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex gap-2 sm:w-1/2">
                                <Button
                                  size="sm"
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-500"
                                  disabled={
                                    isSubmittingTrade || loadingPortfolio
                                  }
                                  onClick={() => handleTrade("BUY")}
                                >
                                  Buy
                                </Button>
                                <Button
                                  size="sm"
                                  className="flex-1 bg-red-800 text-red-100 hover:bg-red-600"
                                  disabled={
                                    isSubmittingTrade || loadingPortfolio
                                  }
                                  onClick={() => handleTrade("SELL")}
                                >
                                  Sell
                                </Button>
                              </div>

                              {portfolioSnapshot && (
                                <div className="text-[11px] text-slate-400 sm:text-right">
                                  Available cash:{" "}
                                  <span className="font-mono">
                                    {formatCurrency(
                                      portfolioSnapshot.account.cashBalance,
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>

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
                      </div>

                      {/* Recent Activity */}
                      <div className="pt-3 border-t border-[#3A3938] mt-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold">
                            Recent activity
                          </h3>
                          <span className="text-[10px] text-slate-500">
                            Showing most recent {recentActivity.length} of{" "}
                            {recentActivityTotal} trade
                            {recentActivityTotal === 1 ? "" : "s"}
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
                              const cashColor =
                                investment.side === "BUY"
                                  ? "text-bt-red-300"
                                  : "text-bt-green-300";

                              return (
                                <div
                                  key={investment.id}
                                  className="flex items-center gap-3 p-3 bg-[#363533] hover:bg-[#4A4947] transition-colors border border-transparent font-light"
                                >
                                  <Avatar className="h-10 w-10 flex-shrink-0">
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
                                          investment.side === "BUY"
                                            ? "bg-emerald-900/60 text-emerald-200"
                                            : "bg-red-900/60 text-red-200"
                                        }`}
                                      >
                                        {investment.side}
                                      </span>
                                      <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {investment.timestamp} ·{" "}
                                      {investment.shares} shares @{" "}
                                      {formatCurrency(investment.price)}
                                    </p>
                                  </div>
                                  <p
                                    className={`text-sm font-light flex-shrink-0 ${cashColor}`}
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
                <CardHeader className="pb-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg font-light">
                      Market board
                    </CardTitle>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide">
                      {projects.length} stock
                      {projects.length === 1 ? "" : "s"}
                      {isMarketFiltered &&
                        ` · showing ${filteredProjects.length}`}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-[160px] max-w-xs">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or ticker…"
                        className="h-8 bg-[#111111] border-[#444] text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-slate-400">
                      <span>Filter:</span>
                      {(["ALL", "UP", "DOWN"] as MarketFilter[]).map((f) => (
                        <button
                          key={f}
                          onClick={() => setMarketFilter(f)}
                          className={`px-2 py-0.5 rounded-full border ${
                            marketFilter === f
                              ? "border-white bg-white/10 text-white"
                              : "border-transparent hover:border-white/30 hover:bg-white/5"
                          }`}
                        >
                          {f === "ALL"
                            ? "All"
                            : f === "UP"
                              ? "Gainers"
                              : "Losers"}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-slate-400">
                      <span>Sort:</span>
                      {(["CHANGE", "VOLUME", "TICKER"] as MarketSortKey[]).map(
                        (key) => (
                          <button
                            key={key}
                            onClick={() => setSortKey(key)}
                            className={`px-2 py-0.5 rounded-full border ${
                              sortKey === key
                                ? "border-white bg-white/10 text-white"
                                : "border-transparent hover:border-white/30 hover:bg-white/5"
                            }`}
                          >
                            {key === "CHANGE"
                              ? "% Change"
                              : key === "VOLUME"
                                ? "Volume"
                                : "Ticker"}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
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
                            className={`w-full p-3 transition-all text-left border ${
                              isSelected
                                ? "bg-[#363533] border-[#5A5A58]"
                                : "bg-[#363533] hover:bg-[#111111] border-transparent"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">
                                  {p.name}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                                  <span>
                                    {formatCurrencyShort(p.currentPrice)} ·{" "}
                                    <span className="font-mono text-[10px] uppercase">
                                      {p.ticker}
                                    </span>
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    MC:{" "}
                                    <span className="font-mono">
                                      {formatCurrencyShort(mc)}
                                    </span>
                                  </span>
                                </p>
                              </div>
                              <div className="ml-3 flex-shrink-0 text-right">
                                <div
                                  className={`flex items-center justify-end gap-1 text-xs font-semibold ${
                                    isPositive
                                      ? "text-bt-green-300"
                                      : "text-bt-red-300"
                                  }`}
                                >
                                  {isPositive ? (
                                    <TrendingUp className="h-3 w-3" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3" />
                                  )}
                                  <span>
                                    {isPositive ? "+" : ""}
                                    {pct.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  Vol:{" "}
                                  <span className="font-mono">
                                    {p.totalVolume ?? 0}
                                  </span>
                                </div>
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
                <CardHeader className="pb-3 flex items-center justify-between">
                  <CardTitle className="text-lg font-light">
                    Your portfolio
                  </CardTitle>
                  {portfolioBreakdown && (
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide">
                      {portfolioBreakdown.positions.length} position
                      {portfolioBreakdown.positions.length === 1 ? "" : "s"}
                    </span>
                  )}
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-slate-200">
                  {!portfolioSnapshot ? (
                    <div className="text-[11px] text-slate-400">
                      Log in to see allocation and top holdings.
                    </div>
                  ) : portfolioBreakdown ? (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Total value</span>
                          <span className="font-mono">
                            {formatCurrency(portfolioBreakdown.total)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Cash</span>
                          <span className="font-mono">
                            {formatCurrency(portfolioBreakdown.cash)} (
                            {portfolioBreakdown.cashPct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Equity</span>
                          <span className="font-mono">
                            {formatCurrency(portfolioBreakdown.equity)} (
                            {portfolioBreakdown.equityPct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#111111] mt-1 overflow-hidden">
                          <div
                            className="h-full bg-bt-green-400"
                            style={{
                              width: `${portfolioBreakdown.equityPct}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#3A3938] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] uppercase tracking-wide text-slate-400">
                            Top holdings
                          </span>
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
                            return (
                              <button
                                key={h.projectId}
                                type="button"
                                onClick={() => selectProject(h.projectId)}
                                className="w-full text-left"
                              >
                                <div className="flex items-center justify-between text-[11px]">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono uppercase">
                                      {h.ticker}
                                    </span>
                                    <span className="truncate max-w-[120px] text-slate-300">
                                      {h.name}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-mono">
                                      {formatCurrencyShort(h.marketValue)}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      {pctOfPort.toFixed(1)}%
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-1 h-1 rounded-full bg-[#111111] overflow-hidden">
                                  <div
                                    className="h-full bg-bt-blue-400"
                                    style={{ width: `${pctOfPort}%` }}
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BtxPage;
