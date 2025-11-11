"use client"

import { Maximize2, MessageSquareText } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { fetchBackend } from "@/lib/db"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.5,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

export type Investment = {
  investorName: string;
  amount: number;
  timestamp: string;
};

const MAX_INVESTMENTS_DISPLAY = 4;

export default function Recent({investments}:{investments:Investment[] | null}) {
  return (
    <div className="w-full h-2/3 bg-[#201F1E] rounded-sm text-white p-6 flex flex-col overflow-y-clip">
      <div className="flex flex-row items-center justify-between">
        <span className="text-[24px]">Recent Investments</span>
        <div className="w-8 h-8 bg-[#333333] flex flex-row items-center justify-center rounded-sm">
          <Maximize2 className="text-[#B4B4B4] w-6 h-6" />
        </div>
      </div>
      <motion.div
        className="h-full flex flex-col items-center justify-center gap-2 mt-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {
            investments?.slice(0, MAX_INVESTMENTS_DISPLAY)?.map((inv, idx) => (
                <Investment key={idx} variants={itemVariants} investment={inv} />
            ))
        }
      </motion.div>
    </div>
  )
}

const Investment = ({ variants, investment }: { variants: any, investment: Investment }) => {
  return (
    <motion.div
      className="w-full h-16 flex flex-row items-center justify-between rounded-nd bg-[#363533] p-2"
      variants={variants}
    >
      <div className="h-full flex flex-row items-center">
        <div className="w-10 h-10 rounded-[2px] border-[1px] border-[#DE7D02] bg-[#B4B4B4]"></div>
        <div className="h-16 flex flex-col items-start justify-center py-3">
          <div className="flex flex-row items-center justify-center ml-4">
            <span className="text-[14px] mr-2">{investment.investorName}</span>
            <MessageSquareText className="w-4 h-4 text-[#B4B4B4]" />
          </div>
          <span className="text-[14px] ml-4 mr-1 text-[#8C8C8C] tracking-tight">{investment.timestamp}</span>
        </div>
      </div>
      <div className="text-[12px] text-[#95FF77] h-full">+${investment.amount}</div>
    </motion.div>
  )
}
