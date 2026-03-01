"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "@/lib/recharts";
import { Card, CardContent } from "@/components/ui/card";
import { RawInvestment } from "../../invest/investmentsGrid/InvestmentCard";

interface ChartData {
  time: string;
  displayTime: string;
  totalAmount: number;
  investmentCount: number;
  timestamp: number;
  weekLabel: string;
}

interface GraphProps {
  investments?: RawInvestment[];
  teamId?: string;
}

const EMPTY_INVESTMENTS: RawInvestment[] = [];

const formatNumberToK = (value: number) => {
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return `${value}`;
};

const Graph: React.FC<GraphProps> = ({
  investments = EMPTY_INVESTMENTS,
  teamId,
}) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [displayedData, setDisplayedData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxValue, setMaxValue] = useState(0);
  const [timeRange, setTimeRange] = useState<"3 hours" | "Day" | "Week">("Day");

  useEffect(() => {
    if (investments && investments.length > 0) {
      processInvestmentData(investments);
    } else {
      createEmptyChartData();
    }
    setLoading(false);
  }, [investments]);

  useEffect(() => {
    filterDataByRange();
  }, [timeRange, chartData]);

  const createEmptyChartData = () => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    const currentHourTimestamp = now.getTime();

    const oneHourMs = 60 * 60 * 1000;
    const oneDayMs = 24 * 60 * 60 * 1000;

    const startTimestamp = currentHourTimestamp - oneDayMs;
    const emptyData: ChartData[] = [];

    for (let ts = startTimestamp; ts <= currentHourTimestamp; ts += oneHourMs) {
      const date = new Date(ts);
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const displayTime = `${hours}:${minutes}`;

      emptyData.push({
        time: `${date.toLocaleString("en-US", { month: "short", day: "numeric" })} ${displayTime}`,
        displayTime,
        weekLabel: date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
        }),
        totalAmount: 0,
        investmentCount: 0,
        timestamp: ts,
      });
    }

    setMaxValue(100);
    setChartData(emptyData);
    setDisplayedData(emptyData);
  };

  const processInvestmentData = (rawInvestments: RawInvestment[]) => {
    const investmentsByHour: Record<number, { amount: number; count: number }> =
      {};
    let minTimestamp = Number.MAX_SAFE_INTEGER;
    let maxTimestamp = 0;

    rawInvestments.forEach((inv) => {
      const date = new Date(inv.createdAt);
      date.setMinutes(0, 0, 0);
      const hourTimestamp = date.getTime();

      minTimestamp = Math.min(minTimestamp, hourTimestamp);
      maxTimestamp = Math.max(maxTimestamp, hourTimestamp);

      if (!investmentsByHour[hourTimestamp]) {
        investmentsByHour[hourTimestamp] = { amount: 0, count: 0 };
      }

      investmentsByHour[hourTimestamp].amount += inv.amount;
      investmentsByHour[hourTimestamp].count += 1;
    });

    if (rawInvestments.length === 0) {
      setChartData([]);
      return;
    }

    const oneHourMs = 60 * 60 * 1000;
    const oneDayMs = 24 * 60 * 60 * 1000;

    const oneDayBeforeTimestamp = minTimestamp - oneDayMs;
    const oneHourBeforeTimestamp = minTimestamp - oneHourMs;

    investmentsByHour[oneDayBeforeTimestamp] = { amount: 0, count: 0 };
    investmentsByHour[oneHourBeforeTimestamp] = { amount: 0, count: 0 };
    minTimestamp = oneDayBeforeTimestamp;

    for (let ts = minTimestamp; ts <= maxTimestamp; ts += oneHourMs) {
      if (!investmentsByHour[ts]) {
        investmentsByHour[ts] = { amount: 0, count: 0 };
      }
    }

    const now = new Date();
    now.setMinutes(0, 0, 0);
    const currentHourTimestamp = now.getTime();

    if (currentHourTimestamp > maxTimestamp) {
      for (
        let ts = maxTimestamp + oneHourMs;
        ts <= currentHourTimestamp;
        ts += oneHourMs
      ) {
        investmentsByHour[ts] = {
          amount: 0,
          count: 0,
        };
      }

      maxTimestamp = currentHourTimestamp;
    }

    const sorted = Object.entries(investmentsByHour)
      .map(([timestamp, data]) => {
        const date = new Date(Number(timestamp));
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const displayTime = `${hours}:${minutes}`;

        return {
          time: `${date.toLocaleString("en-US", { month: "short", day: "numeric" })} ${displayTime}`,
          displayTime,
          weekLabel: date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
          }),
          totalAmount: data.amount,
          investmentCount: data.count,
          timestamp: Number(timestamp),
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);

    let cumulativeAmount = 0;
    const cumulativeData = sorted.map((item) => {
      cumulativeAmount += item.totalAmount;
      return { ...item, totalAmount: cumulativeAmount };
    });

    const max = Math.max(...cumulativeData.map((d) => d.totalAmount), 0);
    setMaxValue(max * 1.33);

    setChartData(cumulativeData);
    setDisplayedData(cumulativeData);
  };

  const filterDataByRange = () => {
    if (chartData.length === 0) return;

    const now = chartData[chartData.length - 1].timestamp;
    let cutoff = now;

    if (timeRange === "3 hours") cutoff = now - 4 * 60 * 60 * 1000;
    else if (timeRange === "Day") cutoff = now - 24 * 60 * 60 * 1000;
    else if (timeRange === "Week") cutoff = now - 7 * 24 * 60 * 60 * 1000;

    let filtered = chartData.filter((d) => d.timestamp >= cutoff);

    if (timeRange === "Week") {
      const reduced: ChartData[] = [];

      for (let i = 0; i < filtered.length; i++) {
        const d = filtered[i];
        const date = new Date(d.timestamp);

        const isMidnight = date.getHours() === 0;
        const isLast = i === filtered.length - 1;

        if (isMidnight || isLast) {
          reduced.push(d);
        }
      }

      filtered = reduced;
    }

    setDisplayedData(filtered);
  };

  if (loading) {
    return (
      <div className="w-3/5 h-full bg-[#111111] rounded-lg flex items-center justify-center outline-none">
        <p className="text-white">Loading chart...</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="w-3/5 h-full bg-[#111111] rounded-lg flex items-center justify-center outline-none">
        <p className="text-white">No investment data available</p>
      </div>
    );
  }

  return (
    <Card
      className="relative md:w-3/5 w-full md:h-full h-[4em] bg-[#111111] border-none shadow-none pr-4 outline-none focus:outline-none"
      tabIndex={-1}
    >
      <div
        className="absolute top-0 right-10 z-20 flex gap-2 rounded-md px-1 py-1 backdrop-blur-sm bg-[#262626] outline-none focus:outline-none"
        tabIndex={-1}
      >
        {(["3 hours", "Day", "Week"] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`text-xs px-1 py-1 rounded-sm transition-colors font-light ${
              timeRange === range
                ? "bg-[#1B1B1B] text-[#DE7D02]"
                : "text-white hover:text-[#DE7D02]"
            } outline-none focus:outline-none`}
            tabIndex={-1}
          >
            {range}
          </button>
        ))}
      </div>

      <CardContent
        className="absolute inset-0 p-0 !flex-none !grid-none outline-none focus:outline-none"
        tabIndex={-1}
      >
        <div
          className="absolute inset-0 left-0 top-0 w-full h-full outline-none focus:outline-none"
          tabIndex={-1}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={displayedData}
              margin={{ top: 0, right: 40, left: -30, bottom: 0 }}
              tabIndex={-1}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255, 255, 255, 0.1)"
              />

              <XAxis
                dataKey={"timestamp"}
                tick={{ fontSize: 12, fill: "#ffffff" }}
                stroke="#ffffff"
                axisLine={false}
                tickLine={false}
                tickFormatter={(timestamp, index) => {
                  const point = displayedData[index];
                  if (!point) return "";

                  const label =
                    timeRange === "Week" ? point.weekLabel : point.displayTime;

                  if (timeRange === "3 hours") {
                    if (index === 0 || index === displayedData.length - 1)
                      return "";
                    const midStart = Math.floor(displayedData.length / 2) - 1;
                    const midEnd = Math.floor(displayedData.length / 2) + 1;
                    if (index >= midStart && index <= midEnd) return label;
                    return "";
                  }

                  if (timeRange === "Day") {
                    if (index === 0 || index === displayedData.length - 1)
                      return "";
                    if (index % 3 === 0) return label;
                    return "";
                  }

                  if (timeRange === "Week") {
                    if (index === 0) return "";
                    if (index === displayedData.length - 1) return label;

                    const d = new Date(point.timestamp);
                    if (d.getHours() === 0) return label;
                    return "";
                  }

                  return "";
                }}
                tabIndex={-1}
              />

              <YAxis
                tick={{ fontSize: 12, fill: "#ffffff" }}
                stroke="#ffffff"
                domain={[0, maxValue]}
                tickCount={8}
                tickFormatter={(v) => formatNumberToK(v)}
                axisLine={false}
                tickLine={false}
                tabIndex={-1}
              />
              <Tooltip
                isAnimationActive={false}
                allowEscapeViewBox={{ x: true, y: true }}
                contentStyle={{
                  backgroundColor: "#141414",
                  border: "1px solid #b4b4b4",
                  borderRadius: "2px",
                  padding: "8px 8px",
                  fontSize: "20px",
                  lineHeight: "1.1",
                  zIndex: 100,
                }}
                labelStyle={{
                  color: "#ffffff",
                  fontSize: "12px",
                  marginBottom: "1px",
                }}
                itemStyle={{
                  color: "#00C2FF",
                  fontSize: "10px",
                }}
                labelFormatter={(_: any, payload: readonly any[]) => {
                  if (!payload || payload.length === 0) return "";

                  const point = payload[0].payload;
                  return timeRange === "Week"
                    ? point.weekLabel
                    : point.displayTime;
                }}
              />

              <Line
                type="linear"
                dataKey="totalAmount"
                stroke="#00C2FF"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                name="Total Investment"
                isAnimationActive
                tabIndex={-1}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default Graph;
