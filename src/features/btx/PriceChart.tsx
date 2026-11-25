import styles from "./btx.module.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { priceHistory, type Company, type PricePoint } from "./seedApi";
import { money } from "./market";

const ranges = { "1m": 1, "5m": 5, "15m": 15, "1h": 60, All: Infinity };

export function PriceChart({
  company,
  now,
  ipoAt,
}: {
  company: Company;
  now: number;
  ipoAt?: number | null;
}) {
  const [range, setRange] = useState<keyof typeof ranges>("15m");
  const client = useQueryClient();
  const queryKey = ["btx", "prices", company.projectId, range];
  const from = now - ranges[range] * 60000;
  const history = useQuery({
    queryKey,
    queryFn: async () => {
      const fetched = await priceHistory(company.projectId, from);
      const cached = client.getQueryData<PricePoint[]>(queryKey) ?? [];
      // Keep socket points that arrived while the HTTP request was in flight.
      const recentCached = cached.filter((point) => point.ts >= from);
      return Array.from(
        new Map(
          [...recentCached, ...fetched].map((point) => [point.ts, point]),
        ).values(),
      );
    },
    refetchInterval: 15000,
  });
  const points = (history.data ?? [])
    .filter((point) => point.ts >= from)
    .sort((a, b) => a.ts - b.ts);
  const priceChange = company.currentPriceCents - 10_000;
  const priceUp = priceChange >= 0;

  // The current company price can arrive before its history point.
  const latest = company.lastPriceTs;
  if (latest != null && latest >= from && latest > (points.at(-1)?.ts ?? 0)) {
    points.push({ ts: latest, priceCents: company.currentPriceCents });
  }
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="max-md:contents flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="whitespace-nowrap text-[34px] font-bold leading-[normal] lg:font-[family-name:var(--btx-font-instrument-sans)] lg:text-[28px] lg:font-medium lg:tracking-[-0.56px]">
            {money(company.currentPriceCents)}
          </span>
          <span
            className={`max-md:border-0 max-md:p-0 max-md:bg-transparent inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[14px] font-medium lg:text-[11px] ${priceUp ? "border-[#38d3a2]/40 bg-[#38d3a2]/10 text-[#38d3a2]" : "border-[#ff5c7a]/75 bg-[#ff5c7a]/10 text-[#ff5c7a]"}`}
          >
            <span aria-hidden="true">{priceUp ? "▲" : "▼"}</span>
            {priceUp ? "+" : ""}
            {(priceChange / 100).toFixed(1)}% since seed
          </span>
        </div>
        <p className="order-2 text-xs text-[#9eabcb] md:hidden">
          Seed $100 · IPO converts seed shares
        </p>
        <div className="max-md:order-3 md:ml-auto flex gap-1">
          {(Object.keys(ranges) as (keyof typeof ranges)[]).map((r) => (
            <button
              key={r}
              aria-pressed={r === range}
              className={
                styles.filterChip +
                " rounded-full border border-slate-700 px-3 py-1 text-[13px] font-medium aria-pressed:bg-sky-300 aria-pressed:text-slate-950 lg:text-[12px]"
              }
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      {points.length ? (
        <div
          className="relative h-[150px] md:min-h-64 md:flex-1"
          aria-label="Price history"
        >
          <ResponsiveContainer
            className="absolute inset-0"
            width="100%"
            height="100%"
          >
            <AreaChart data={points}>
              <CartesianGrid vertical={false} stroke="#24364f" />
              <XAxis
                dataKey="ts"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(ts) =>
                  new Date(ts).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
              />
              <YAxis
                orientation="right"
                domain={["auto", "auto"]}
                tickFormatter={(c) => "$" + c / 100}
              />
              {ipoAt != null &&
                points[0].ts <= ipoAt &&
                ipoAt <= points[points.length - 1].ts && (
                  <ReferenceLine
                    x={ipoAt}
                    stroke="#ffddad"
                    strokeDasharray="3 3"
                    label={{
                      value: "IPO",
                      fill: "#ffddad",
                      position: "insideTopRight",
                    }}
                  />
                )}
              <Area
                dataKey="priceCents"
                stroke="#4ed5ff"
                fill="#136088"
                fillOpacity={0.35}
                dot={points.length === 1}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="my-auto text-[14px] text-slate-400">
          {history.isPending
            ? "Loading prices…"
            : history.isError
              ? "Price history unavailable."
              : "No prices in this range."}
        </p>
      )}
    </div>
  );
}
