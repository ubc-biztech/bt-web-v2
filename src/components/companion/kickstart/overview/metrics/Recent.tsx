"use client";

import { motion } from "framer-motion";
import { Maximize2, MessageSquareText } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
};

export type Investment = {
  investorName: string;
  amount: number;
  timestamp: string;
  comment: string;
};

const MAX_INVESTMENTS_DISPLAY = 4;

export default function Recent({
  investments,
  setModal,
}: {
  investments: Investment[] | null;
  setModal: (arg0: boolean) => void;
}) {
  return (
    <div className="w-full h-2/3 bg-[#201F1E] rounded-sm text-white p-6 flex flex-col overflow-y-clip">
      <div className="flex flex-row items-center justify-between">
        <span className="text-[24px]">Recent Investments</span>
        <div
          onClick={() => {
            setModal(true);
          }}
          className="group w-8 h-8 bg-[#333333] flex flex-row items-center justify-center rounded-sm hover:cursor-pointer"
        >
          <Maximize2 className="text-[#B4B4B4] hover:text-white size-5 group-hover:scale-105 transition ease-in-out duration-200" />
        </div>
      </div>
      <motion.div
        className="h-full flex flex-col items-center justify-start gap-2 mt-2 pt-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={investments?.length || 0} // Force re-animation when investments change
      >
        {investments?.slice(0, MAX_INVESTMENTS_DISPLAY)?.map((inv, idx) => (
          <div
            key={`${inv.investorName}-${idx}`}
            className="w-full"
            onClick={() => {
              setModal(true);
            }}
          >
            <Investment variants={itemVariants} investment={inv} />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

const Investment = ({
  variants,
  investment,
}: {
  variants: any;
  investment: Investment;
}) => {
  return (
    <motion.div
      className="w-full h-16 flex flex-row items-center justify-between rounded-md bg-[#363533] p-2 hover:cursor-pointer"
      variants={variants}
      whileHover={{ scale: 1.02 }}
    >
      <div className="h-full flex flex-row items-center">
        <div className="w-10 h-10 rounded-[2px] border-[1px] border-[#DE7D02] bg-[#B4B4B4]"></div>
        <div className="h-16 flex flex-col items-start justify-center py-3">
          <div className="flex flex-row items-center justify-center ml-4">
            <span className="text-[14px] mr-2">{investment.investorName}</span>
            <MessageSquareText className="w-4 h-4 text-[#B4B4B4]" />
          </div>
          <span className="text-[14px] ml-4 mr-1 text-[#8C8C8C] tracking-tight">
            {investment.timestamp}
          </span>
        </div>
      </div>
      <div className="text-[12px] text-[#95FF77] h-full">
        +${investment.amount}
      </div>
    </motion.div>
  );
};
