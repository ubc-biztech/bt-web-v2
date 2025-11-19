export interface InvestmentDataPoint {
  time: string;
  value: number;
}

export interface RecentInvestment {
  id: string;
  investorName: string;
  investorAvatar?: string;
  amount: number;
  timestamp: string;
}

export interface TeamStock {
  id: string;
  teamName: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  chartData: InvestmentDataPoint[];
  availableToInvest: number;
  investmentReceived: number;
  recentInvestments: RecentInvestment[];
}
