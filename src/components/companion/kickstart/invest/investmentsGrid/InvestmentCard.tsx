import React, { useState } from "react";
import InvestmentPopup from "./InvestmentPopup";
import { formatTimestamp } from "@/lib/utils";

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

export const formatAmount = (amount: number): string => {
  return `$${Math.abs(amount)}`;
};

const InvestmentCard = ({ investment }: { investment: RawInvestment }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-[#201F1E] rounded py-4 px-5 flex flex-col justify-between min-h-[120px] w-full text-left"
      >
        {/* Top Row */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-white text-[28px] font-semibold tracking-tight lowercase">
            {investment.teamName}
          </span>
          <div className="border border-[#FFA601] bg-[#FFA601]/10 rounded-full px-4 py-1 flex items-center justify-center">
            <span className="text-[#FFA601] text-[16px] font-medium tracking-tight">
              {formatAmount(investment.amount)}
            </span>
          </div>
        </div>

        {/* Middle Comment */}
        <p className="text-[#d2d2d2] text-xs leading-snug line-clamp-2 mb-2">
          {investment.comment}
        </p>

        {/* Footer Time */}
        <span className="text-[#8C8C8C] text-xs font-light">
          {formatTimestamp(investment.createdAt)}
        </span>
      </button>

      {isOpen && (
        <InvestmentPopup
          investment={investment}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default InvestmentCard;
