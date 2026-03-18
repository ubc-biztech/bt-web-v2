import { ArrowRight, CreditCard, X } from "lucide-react";
import React from "react";
import Progress0_2 from "@/assets/2025/kickstart/progress0_2.svg";
import Progress1_2 from "@/assets/2025/kickstart/progress1_2.svg";
import MessageLogo from "@/assets/2025/kickstart/message.svg";
import { motion } from "framer-motion";

interface RenderProps {
  selectedTeam: { teamName: string };
  amountInput: string;
  setAmountInput: (value: string) => void;
  availableFunds: number;
  flowError: string | null;
  handleProceedToComment: () => void;
  resetFlow: () => void;
  isAmountValid: () => boolean;
}

const Render = ({
  selectedTeam,
  resetFlow,
  amountInput,
  setAmountInput,
  handleProceedToComment,
  availableFunds,
  flowError,
  isAmountValid,
}: RenderProps) => {
  return (
    <motion.div
      className="space-y-1 relative"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        type="button"
        className="absolute top-4 right-4 text-white/70 hover:text-white"
        onClick={resetFlow}
        aria-label="Close investment flow"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="space-y-5 bg-[#1A1918] p-5 rounded-lg">
        <div>
          <p className="text-[#FFCC8A] text-xs">INVEST IN A PROJECT</p>
          <h2 className="text-white text-xl font-semibold mt-1 leading-tight">
            Invest in{" "}
            <span className="text-[#DE7D02]">{selectedTeam.teamName}</span>
          </h2>
        </div>

        <div className="rounded-2xl bg-[#2C2B2A] p-4 space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold ">
            <CreditCard className="text-[#FFFFFF] bg-[#DE7D02] transition-colors rounded-md w-max h-max flex items-center justify-center p-1 shrink-0" />
            How much would you like to invest?
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-lg bg-white/95 text-[#1F1F1F] px-2 py-2 text-base focus:outline-none"
              placeholder="Amount ($)"
              type="number"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
            />
            <button
              type="button"
              className="rounded-lg bg-[#DE7D02] hover:bg-[#f29224] text-white px-4"
              onClick={handleProceedToComment}
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-[#B8B8B8]">
            Available funds: ${availableFunds.toLocaleString()}
          </p>
        </div>
        <div className="pl-4 rounded-2xl">
          <div className="flex items-center gap-2 text-white font-semibold ">
            <MessageLogo className="text-[#FFFFFF] bg-[#DE7D02] transition-colors rounded-md w-max h-max flex items-center justify-center p-1 shrink-0" />
            Comments
          </div>
        </div>

        {flowError && <p className="text-sm text-red-400">{flowError}</p>}
      </div>

      <div className="flex flex-col gap-3 bg-[#1A1918]  p-5 rounded-lg ">
        <div className="flex items-center gap-3 text-sm text-[#B8B8B8]">
          <motion.div
            key={isAmountValid() ? "valid" : "invalid"}
            initial={{ opacity: 0.85, rotate: -10 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0.3, rotate: 180 }}
            transition={{ duration: 0.2 }}
          >
            {isAmountValid() ? (
              <Progress1_2 className="w-10 h-10 text-[#FFB35C] shrink-0 justify-center" />
            ) : (
              <Progress0_2 className="w-10 h-10 text-[#FFB35C] shrink-0 justify-center" />
            )}
          </motion.div>
          We&apos;ll deduct from your spending account. This will not decrease
          your own funding.
          <div className="rounded-lg bg-[#DE7D02] hover:bg-[#f29224] text-white px-4 py-3 opacity-30 flex items-center">
            <p>invest</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Render;
