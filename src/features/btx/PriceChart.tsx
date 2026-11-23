import { useQuery } from "@tanstack/react-query";
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

import { priceHistory, type Company } from "./seedApi";
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
  const history = useQuery({
    queryKey: ["btx", "prices", company.projectId, range],
    queryFn: () => priceHistory(company.projectId, now - ranges[range] * 60000),
    refetchInterval: 15000,
  });
  const points = (history.data ?? [])
    .filter((p) => p.ts >= now - ranges[range] * 60000)
    .sort((a, b) => a.ts - b.ts);
  const priceChange = company.currentPriceCents - 10_000;
  const priceUp = priceChange >= 0;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-2xl tabular-nums">
            {money(company.currentPriceCents)}
          </span>
          <span
            className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs ${priceUp ? "border-[#38d3a2]/40 bg-[#38d3a2]/10 text-[#38d3a2]" : "border-[#ff5c7a]/75 bg-[#ff5c7a]/10 text-[#ff5c7a]"}`}
          >
            <span aria-hidden="true">{priceUp ? "▲" : "▼"}</span>
            {priceUp ? "+" : ""}
            {(priceChange / 100).toFixed(1)}% since seed
          </span>
        </div>
        <div className="ml-auto flex gap-1">
          {(Object.keys(ranges) as (keyof typeof ranges)[]).map((r) => (
            <button
              key={r}
              aria-pressed={r === range}
              className="rounded-full border border-slate-700 px-3 py-1 text-xs aria-pressed:bg-sky-300 aria-pressed:text-slate-950"
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      {points.length ? (
        <div className="min-h-64 flex-1" aria-label="Price history">
          <ResponsiveContainer width="100%" height="100%" minHeight={256}>
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
        <p className="my-auto text-sm text-slate-400">
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
