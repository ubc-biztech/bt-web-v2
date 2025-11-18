import React from "react";
import { X } from "lucide-react";
import type { RawInvestment } from "./partnerInvestmentCard";
import { formatAmount } from "./partnerInvestmentCard";

interface InvestmentPopupProps {
  investment: RawInvestment;
  onClose: () => void;
}

const formatPopupTimestamp = (
  timestamp: number,
): { month: string; day: string; time: string } => {
  const date = new Date(timestamp);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const daySuffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
        ? "nd"
        : day === 3 || day === 23
          ? "rd"
          : "th";

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const time = `${hours}:${minutes}${ampm}`;

  return { month, day: `${day}${daySuffix}`, time };
};

const InvestmentPopup: React.FC<InvestmentPopupProps> = ({
  investment,
  onClose,
}) => {
  const formattedAmount = formatAmount(investment.amount);
  const timestampParts = formatPopupTimestamp(investment.createdAt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative w-full max-w-4xl mx-4 bg-[#201F1E] rounded shadow-lg px-8 py-6 md:px-10 md:py-7 border-[1.25px] border-[#4D4D4D]">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[#8C8C8C] hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top summary text */}
        <p className="text-sm text-[#8C8C8C] font-light mb-3">
          You invested{" "}
          <span className="text-[#95FF77] font-light">{investment.amount}</span>{" "}
          in{" "}
          <span className="text-white font-light">{investment.teamName}</span>{" "}
          on{" "}
          <span className="text-white">
            {timestampParts.month} {timestampParts.day}{" "}
            <span className="text-[#8C8C8C]">at</span> {timestampParts.time}
          </span>
        </p>

        {/* Divider */}
        <div className="h-px w-10 bg-[#B4B4B4] mb-4" />

        {/* Inner card header */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-white text-[28px] font-semibold tracking-tight lowercase">
            {investment.teamName}
          </span>
          <div className="border border-[#95FF77] bg-[#95FF771A] rounded-full px-4 py-1 flex items-center justify-center">
            <span className="text-[#95FF77] text-[18px] font-medium tracking-tight">
              {formattedAmount}
            </span>
          </div>
        </div>

        {/* Full comment */}
        <p className="text-[#B4B4B4] text-sm leading-snug">
          {investment.comment}
        </p>
      </div>
    </div>
  );
};

export default InvestmentPopup;
