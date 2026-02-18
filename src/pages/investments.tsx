"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  MessageSquare,
} from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "@/lib/recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Instrument_Serif, Bricolage_Grotesque } from "next/font/google";
import type { TeamStock } from "@/types/investment";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
});

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mockTeams: TeamStock[] = [
  {
    id: "1",
    teamName: "biz.ai",
    currentPrice: 28000,
    priceChange: 3200,
    priceChangePercent: 12.9,
    availableToInvest: 4500,
    investmentReceived: 3500,
    chartData: [
      { time: "10:00", value: 4000 },
      { time: "11:00", value: 8000 },
      { time: "12:00", value: 7000 },
      { time: "13:00", value: 12000 },
      { time: "14:00", value: 17000 },
      { time: "15:00", value: 25000 },
      { time: "16:00", value: 28000 },
    ],
    recentInvestments: [
      {
        id: "1",
        investorName: "Jay Park",
        amount: 67,
        timestamp: "11-27-25 - 12:41PM",
      },
      {
        id: "2",
        investorName: "LeBron Xiao",
        amount: 1650,
        timestamp: "11-27-25 - 12:08PM",
      },
      {
        id: "3",
        investorName: "Ethan Xiao",
        amount: 1650,
        timestamp: "11-27-25 - 12:08PM",
      },
      {
        id: "3",
        investorName: "Kevin Xiao",
        amount: 1650,
        timestamp: "11-27-25 - 12:08PM",
      },
    ],
  },
  {
    id: "2",
    teamName: "isuck",
    currentPrice: 15000,
    priceChange: -500,
    priceChangePercent: -3.2,
    availableToInvest: 3000,
    investmentReceived: 2000,
    chartData: [
      { time: "10:00", value: 14000 },
      { time: "11:00", value: 14500 },
      { time: "12:00", value: 16000 },
      { time: "13:00", value: 15500 },
      { time: "14:00", value: 15200 },
      { time: "15:00", value: 14800 },
      { time: "16:00", value: 15000 },
    ],
    recentInvestments: [
      {
        id: "4",
        investorName: "LeBron James",
        amount: 800,
        timestamp: "11-27-25 - 11:30AM",
      },
    ],
  },
  {
    id: "3",
    teamName: "gautham",
    currentPrice: 22000,
    priceChange: 1500,
    priceChangePercent: 7.3,
    availableToInvest: 5000,
    investmentReceived: 4200,
    chartData: [
      { time: "10:00", value: 18000 },
      { time: "11:00", value: 19000 },
      { time: "12:00", value: 20000 },
      { time: "13:00", value: 21000 },
      { time: "14:00", value: 21500 },
      { time: "15:00", value: 21800 },
      { time: "16:00", value: 22000 },
    ],
    recentInvestments: [
      {
        id: "5",
        investorName: "Lucas Gingera",
        amount: 1200,
        timestamp: "11-27-25 - 1:15PM",
      },
    ],
  },
];

const chartConfig = {
  value: {
    label: "Investment Value",
    color: "#00C2FF",
  },
} satisfies ChartConfig;

export default function InvestmentsPage() {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(mockTeams[0].id);

  const selectedTeam = useMemo(
    () => mockTeams.find((team) => team.id === selectedTeamId) || mockTeams[0],
    [selectedTeamId],
  );

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value.toFixed(0)}`;
  };

  const formatTime = (time: string) => {
    return time;
  };

  return (
    <div
      className={`${bricolageGrotesque.className} h-screen overflow-hidden bg-[#111111] text-white p-8 w-full`}
    >
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col pb-6">
        <div className="mb-4 flex-shrink-0">
          <div className="flex flex-wrap items-baseline gap-4">
            <h1
              className={`${instrumentSerif.className} text-3xl font-light leading-none`}
            >
              {selectedTeam.teamName}
            </h1>
            <div className="flex items-baseline gap-3">
              <p
                className={`${instrumentSerif.className} text-2xl font-light leading-none`}
              >
                {formatCurrency(selectedTeam.currentPrice)}
              </p>
              <div
                className={`flex items-center gap-1 text-sm font-light leading-none ${
                  selectedTeam.priceChange >= 0
                    ? "text-bt-green-300"
                    : "text-bt-red-300"
                }`}
              >
                {selectedTeam.priceChange >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>
                  {selectedTeam.priceChange >= 0 ? "+" : ""}
                  {formatCurrency(selectedTeam.priceChange)} (
                  {selectedTeam.priceChange >= 0 ? "+" : ""}
                  {selectedTeam.priceChangePercent.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8 flex-1 overflow-hidden mt-2">
          <div className="col-span-12 lg:col-span-8 h-full lg:pr-4">
            <Card className="bg-[#111111] rounded-none border-none shadow-none h-full">
              <CardContent className="h-full py-8 pr-8 pl-0">
                <ChartContainer
                  config={chartConfig}
                  className="h-full w-full"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: "36px 36px",
                    backgroundPosition: "-1px -1px, -1px -1px",
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
                    data={selectedTeam.chartData}
                    margin={{
                      left: 12,
                      right: 24,
                      top: 24,
                      bottom: 12,
                    }}
                  >
                    <XAxis
                      dataKey="time"
                      tickMargin={8}
                      tickFormatter={formatTime}
                      tick={{ fill: "#FFFFFF", fontSize: 12 }}
                      axisLine={{
                        stroke: "rgba(255,255,255,0.25)",
                        strokeWidth: 1,
                      }}
                      tickLine={{ stroke: "rgba(255,255,255,0.25)" }}
                    />
                    <YAxis
                      tickMargin={8}
                      domain={[0, "dataMax"]}
                      tickFormatter={(value) => {
                        if (value >= 1000) {
                          return `${(value / 1000).toFixed(0)}k`;
                        }
                        return value.toString();
                      }}
                      tick={{ fill: "#FFFFFF", fontSize: 12 }}
                      axisLine={{
                        stroke: "rgba(255,255,255,0.25)",
                        strokeWidth: 1,
                      }}
                      tickLine={{ stroke: "rgba(255,255,255,0.25)" }}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Line
                      dataKey="value"
                      type="linear"
                      stroke="var(--color-value)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
            <Card className="bg-[#201F1E] rounded-none border border-[#2A2A2A] flex-shrink-0">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg font-light">
                  Other Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {mockTeams.map((team) => {
                    const isSelected = team.id === selectedTeamId;
                    const isPositive = team.priceChange >= 0;

                    return (
                      <button
                        key={team.id}
                        onClick={() => setSelectedTeamId(team.id)}
                        className={`w-full p-3 transition-all text-left border ${
                          isSelected
                            ? "bg-[#363533] border-[#5A5A58]"
                            : "bg-[#363533] hover:bg-[#111111] border-transparent"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">
                              {team.teamName}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatCurrency(team.currentPrice)}
                            </p>
                          </div>
                          <div className="ml-3 flex-shrink-0">
                            <div
                              className={`flex items-center gap-1 text-xs font-semibold ${
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
                                {team.priceChangePercent.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#201F1E] rounded-none border border-[#2A2A2A] flex-1 overflow-hidden flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg font-light">
                  {selectedTeam.teamName}
                </CardTitle>
              </CardHeader>
              <CardContent className="font-light flex-1 flex flex-col overflow-hidden space-y-4">
                <div className="flex items-center justify-between flex-shrink-0">
                  <h3 className="text-sm font-semibold">Recent Activity</h3>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                  {selectedTeam.recentInvestments.map((investment) => (
                    <div
                      key={investment.id}
                      className="flex items-center gap-3 p-3 rounded-none bg-[#363533] hover:bg-[#4A4947] transition-colors border border-transparent font-light"
                    >
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback className="bg-bt-blue-300 text-bt-blue-600">
                          {investment.investorName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-light text-sm truncate">
                            {investment.investorName}
                          </p>
                          <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {investment.timestamp}
                        </p>
                      </div>
                      <p className="text-sm font-light text-bt-green-300 flex-shrink-0">
                        +{formatCurrency(investment.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
