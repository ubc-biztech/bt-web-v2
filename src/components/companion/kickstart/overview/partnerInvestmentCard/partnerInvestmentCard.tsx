import React from "react";

// Types
export interface RawInvestment {
  teamName: string;
  createdAt: number;
  isPartner: boolean;
  "eventID;year": string;
  amount: number;
  teamId: string;
  investorId: string;
  investorName: string;
  comment: string;
  id: string;
}

// Helper functions
const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${month}-${day}-${year} - ${hours}:${minutes}${ampm}`;
};

const formatAmount = (amount: number): string => {
  const sign = amount < 0 ? "-" : "";
  return `${sign}$${Math.abs(amount)}`;
};

const PartnerInvestmentCard = ({
  investment,
}: {
  investment: RawInvestment;
}) => {
  return (
    <div className="bg-[#201F1E] rounded py-4 px-5 flex flex-col justify-between min-h-[120px] w-full">
      {/* Top Row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-white text-[28px] font-semibold tracking-tight lowercase">
          {investment.teamName}
        </span>
        <div className="border border-[#38d64e] bg-[rgba(56,214,78,0.15)] rounded-full px-4 py-1 flex items-center justify-center">
          <span className="text-[#38d64e] text-[18px] font-medium tracking-tight">
            {formatAmount(investment.amount)}
          </span>
        </div>
      </div>

      {/* Middle Comment */}
      <p className="text-[#d2d2d2] text-sm leading-snug line-clamp-2 mb-2">
        {investment.comment}
      </p>

      {/* Footer Time */}
      <span className="text-[#8C8C8C] text-xs">
        {formatTimestamp(investment.createdAt)}
      </span>
    </div>
  );
};

export default PartnerInvestmentCard;
