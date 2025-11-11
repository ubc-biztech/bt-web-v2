"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import type { RawInvestment } from "@/components/companion/kickstart/overview/Overview"

interface ChartData {
  time: string
  displayTime: string
  totalAmount: number
  investmentCount: number
  timestamp: number
}

interface GraphProps {
  investments?: RawInvestment[]
  teamId?: string
}

const formatNumberToK = (value: number) => {
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
  return `${value}`
}

const Graph: React.FC<GraphProps> = ({ investments = [], teamId }) => {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [displayedData, setDisplayedData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [maxValue, setMaxValue] = useState(0)
  const [timeRange, setTimeRange] = useState<"3 hours" | "Day" | "Week">("Day")

  useEffect(() => {
    if (investments && investments.length > 0) {
      processInvestmentData(investments)
    } else {
      setChartData([])
      setDisplayedData([])
    }
    setLoading(false)
  }, [investments])

  useEffect(() => {
    filterDataByRange()
  }, [timeRange, chartData])

  const processInvestmentData = (rawInvestments: RawInvestment[]) => {
    const investmentsByHour: Record<number, { amount: number; count: number }> = {}
    let minTimestamp = Number.MAX_SAFE_INTEGER
    let maxTimestamp = 0

    rawInvestments.forEach((inv) => {
      const date = new Date(inv.createdAt)
      date.setMinutes(0, 0, 0)
      const hourTimestamp = date.getTime()

      minTimestamp = Math.min(minTimestamp, hourTimestamp)
      maxTimestamp = Math.max(maxTimestamp, hourTimestamp)

      if (!investmentsByHour[hourTimestamp]) {
        investmentsByHour[hourTimestamp] = { amount: 0, count: 0 }
      }

      investmentsByHour[hourTimestamp].amount += inv.amount
      investmentsByHour[hourTimestamp].count += 1
    })

    if (rawInvestments.length === 0) {
      setChartData([])
      return
    }

    const oneHourMs = 60 * 60 * 1000
    for (let ts = minTimestamp; ts <= maxTimestamp; ts += oneHourMs) {
      if (!investmentsByHour[ts]) {
        investmentsByHour[ts] = { amount: 0, count: 0 }
      }
    }

    const sorted = Object.entries(investmentsByHour)
      .map(([timestamp, data]) => {
        const date = new Date(Number(timestamp))
        const timeString = date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        return {
          time: timeString,
          displayTime: timeString.split(", ")[1] || timeString,
          totalAmount: data.amount,
          investmentCount: data.count,
          timestamp: Number(timestamp),
        }
      })
      .sort((a, b) => a.timestamp - b.timestamp)

    let cumulativeAmount = 0
    const cumulativeData = sorted.map((item) => {
      cumulativeAmount += item.totalAmount
      return { ...item, totalAmount: cumulativeAmount }
    })

    const max = Math.max(...cumulativeData.map((d) => d.totalAmount), 0)
    setMaxValue(max * 1.33)
    setChartData(cumulativeData)
    setDisplayedData(cumulativeData)
  }

  const filterDataByRange = () => {
    if (chartData.length === 0) return
    const now = chartData[chartData.length - 1].timestamp
    let cutoff = now

    if (timeRange === "3 hours") cutoff = now - 3 * 60 * 60 * 1000
    else if (timeRange === "Day") cutoff = now - 24 * 60 * 60 * 1000
    else if (timeRange === "Week") cutoff = now - 7 * 24 * 60 * 60 * 1000

    const filtered = chartData.filter((d) => d.timestamp >= cutoff)
    setDisplayedData(filtered)
  }

  if (loading) {
    return (
      <div className="w-3/5 h-full bg-[#111111] rounded-lg flex items-center justify-center">
        <p className="text-white">Loading chart...</p>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="w-3/5 h-full bg-[#111111] rounded-lg flex items-center justify-center">
        <p className="text-white">No investment data available</p>
      </div>
    )
  }

  return (
    <Card className="relative w-3/5 h-full bg-[#111111] border-none shadow-none overflow-hidden pr-4">
      {/* Time Range Selector */}
      <div className="absolute top-0 right-10 z-20 flex gap-2 rounded-md px-1 py-1 backdrop-blur-sm bg-[#262626]">
        {(["3 hours", "Day", "Week"] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`text-xs px-1 py-1 rounded-sm transition-colors font-light ${
              timeRange === range
                ? "bg-[#1B1B1B] text-[#DE7D02]"
                : "text-white hover:text-[#DE7D02]"
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      <CardContent className="absolute inset-0 p-0 !flex-none !grid-none">
        <div className="absolute inset-0 left-0 top-0 w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={displayedData}
              margin={{ top: 0, right: 40, left: -30, bottom: 0 }}
            >
              {/* Add white axis lines manually */}
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis
                dataKey="displayTime"
                tick={{
                  fontSize: 12,
                  fill: "#ffffff",
                }}
                stroke="#ffffff"
                axisLine={false}
                tickLine={false}
                // hide first and last tick labels
                tickFormatter={(value, index) => {
                  if (
                    index === 0 ||
                    index === displayedData.length - 1
                  )
                    return ""
                  return value
                }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#ffffff" }}
                stroke="#ffffff"
                domain={[0, maxValue]}
                tickCount={8}
                tickFormatter={(v: number) => formatNumberToK(v)}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111111",
                  border: "0px solid #ffffff",
                  borderRadius: "3px",
                  padding: "8px 12px",
                  fontSize: "16px",
                  lineHeight: "1.1",
                }}
                labelStyle={{
                  color: "#ffffff",
                  fontSize: "11px",
                  marginBottom: "2px",
                }}
                itemStyle={{
                  color: "#00C2FF",
                  fontSize: "11px",
                }}
                formatter={(v: any) => [
                  typeof v === "number" ? formatNumberToK(v) : v,
                ]}
              />
              <Line
                type="monotone"
                dataKey="totalAmount"
                stroke="#00C2FF"
                strokeWidth={2}
                dot={{ fill: "#00C2FF", r: 4 }}
                activeDot={{ r: 6 }}
                name="Total Investment"
                isAnimationActive
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default Graph
