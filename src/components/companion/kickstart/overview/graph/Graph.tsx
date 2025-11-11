"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`
  }
  return `${value}`
}

const Graph: React.FC<GraphProps> = ({ investments = [], teamId }) => {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [maxValue, setMaxValue] = useState(0)

  useEffect(() => {
    if (investments && investments.length > 0) {
      processInvestmentData(investments)
    } else {
      setChartData([])
    }
    setLoading(false)
  }, [investments])

const processInvestmentData = (rawInvestments: RawInvestment[]) => {
    // 1. Aggregate investments into a map, grouped by the start of the hour (timestamp)
    const investmentsByHour: Record<number, { amount: number; count: number }> = {}
    let minTimestamp = Number.MAX_SAFE_INTEGER
    let maxTimestamp = 0

    rawInvestments.forEach((inv) => {
        const date = new Date(inv.createdAt)
        // Set minutes and seconds to 0 to group by hour
        date.setMinutes(0, 0, 0)
        const hourTimestamp = date.getTime()

        minTimestamp = Math.min(minTimestamp, hourTimestamp)
        maxTimestamp = Math.max(maxTimestamp, hourTimestamp)

        if (!investmentsByHour[hourTimestamp]) {
            investmentsByHour[hourTimestamp] = {
                amount: 0,
                count: 0,
            }
        }

        investmentsByHour[hourTimestamp].amount += inv.amount
        investmentsByHour[hourTimestamp].count += 1
    })
    
    if (rawInvestments.length === 0) {
        setChartData([]);
        return;
    }

    // 2. Fill in missing hourly data points to ensure continuous timeline
    const oneHourMs = 60 * 60 * 1000
    
    // Iterate from the first hour to the last hour, inclusive
    for (let ts = minTimestamp; ts <= maxTimestamp; ts += oneHourMs) {
        if (!investmentsByHour[ts]) {
            // Create a placeholder for the missing hour
            investmentsByHour[ts] = {
                amount: 0,
                count: 0,
            }
        }
    }

    // 3. Convert the map back to an array of ChartData and sort by time
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
                displayTime: timeString,
                totalAmount: data.amount,
                investmentCount: data.count,
                timestamp: Number(timestamp),
            }
        })
        .sort((a, b) => a.timestamp - b.timestamp)

    // 4. Calculate the cumulative amount
    let cumulativeAmount = 0
    const cumulativeData = sorted.map((item) => {
        cumulativeAmount += item.totalAmount
        return { ...item, totalAmount: cumulativeAmount }
    })

    // 5. Format display time: show full date only when the day changes, using only standard spaces
    let lastDate = ""
    const finalData = cumulativeData.map((item) => {
        // Split the string (e.g., "Nov 10, 10:00 PM") by ", "
        const parts = item.time.split(", ");
        const datePart = parts[0] || item.time; 
        const timePart = parts[1] || item.time; 

        // if (datePart !== lastDate) {
        //     lastDate = datePart
        //     // Date changed: use the full single-line string, e.g., "Nov 10, 10:00 PM"
        //     return { ...item, displayTime: item.time } 
        // }
        // // Date is the same: use only the time part, e.g., "10:00 PM"
        return { ...item, displayTime: timePart }
    })

    const max = Math.max(...finalData.map((d) => d.totalAmount), 0)
    setMaxValue(max * 1.33)

    setChartData(finalData)
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
      <CardContent className="absolute inset-0 p-0 !flex-none !grid-none">
          <div className="absolute inset-0 left-0 top-0 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                data={chartData}
                margin={{ top: 0, right: 40, left: -30, bottom: 0 }}
                >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis
                    dataKey="displayTime"
                    tick={{ fontSize: 12, fill: "#ffffff" }}
                    stroke="#ffffff"
                    axisLine={false}
                    tickLine={false}
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
                    padding: "8px 12px",        // ↓ smaller internal spacing
                    fontSize: "16px",          // ↓ smaller text
                    lineHeight: "1.1",         // ↓ tighter vertical spacing
                  }}
                  labelStyle={{
                    color: "#ffffff",
                    fontSize: "11px",
                    marginBottom: "2px",       // ↓ reduce space between label and value
                  }}
                  itemStyle={{
                    color: "#00C2FF",          // optional: consistent color for value
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
