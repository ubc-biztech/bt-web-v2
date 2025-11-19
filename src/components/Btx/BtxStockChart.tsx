// src/components/Btx/BtxStockChart.tsx

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
} from "recharts";
import { BtxTrade } from "@/lib/db-btx";

interface Props {
  trades: BtxTrade[];
  ticker?: string;
}
export const BtxStockChart: React.FC<Props> = ({ trades, ticker }) => {
  const data = trades.map((t) => ({
    time: new Date(t.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    price: t.price,
  }));

  if (data.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-sm text-gray-500">
        No trades yet — be the first to trade this stock.
      </div>
    );
  }

  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice || 1) * 0.1;
  const yMin = Math.max(0, minPrice - padding);
  const yMax = maxPrice + padding;

  return (
    <div className="h-64 w-full">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">
          Price History {ticker ? `(${ticker})` : ""}
        </h3>
        <span className="text-xs text-gray-500">
          Last {trades.length || 0} ticks
        </span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
        >
          <defs>
            <linearGradient id="btxPriceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 10 }} />
          <YAxis
            tick={{ fontSize: 10 }}
            domain={[yMin, yMax]}
            tickFormatter={(v) => `$${v.toFixed(2)}`}
          />
          <Tooltip
            formatter={(value: any) =>
              typeof value === "number" ? `$${value.toFixed(2)}` : String(value)
            }
            labelStyle={{ fontSize: 11 }}
            contentStyle={{
              fontSize: 11,
              borderRadius: 8,
            }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="none"
            fill="url(#btxPriceGradient)"
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
