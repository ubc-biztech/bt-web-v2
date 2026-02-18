"use client";

import React from "react";
import { Investment } from "./Recent";
import { MessageSquareText, X } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

interface CommentsModalProps {
  investments?: Investment[];
  setModal: (open: boolean) => void;
}

const CommentsModal = ({ investments, setModal }: CommentsModalProps) => {
  const getDiagonalDelay = (index: number) => {
    const columns = 3;
    const row = Math.floor(index / columns);
    const col = index % columns;
    const diagonal = row + col;
    return diagonal * 0.1;
  };

  return (
    <div className="flex flex-row items-center justify-center w-full h-full mt-4">
      <div className="w-full p-6 relative bg-[#201F1E] rounded-md">
        <div className="flex flex-row justify-between">
          <h2 className="text-white text-lg mb-4 font-normal">
            Recent Funding
          </h2>
          <button
            type="button"
            onClick={() => {
              setModal(false);
            }}
            className="group w-8 h-8 bg-[#333333] hover:bg-white flex flex-row items-center justify-center rounded-sm hover:cursor-pointer transition duration-500 ease-in-out"
          >
            <X className="text-white size-5 group-hover:scale-105 group-hover:text-black " />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {investments?.map((inv, idx) => (
              <m.div
                key={`${inv.investorName}-${inv.timestamp}-${inv.amount}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: getDiagonalDelay(idx) }}
                className="bg-[#363533] rounded-md px-4 pb-4 flex flex-col justify-between h-full"
              >
                <div className="h-full flex flex-row items-center">
                  <div className="flex flex-row items-center h-20 w-full">
                    <div className="w-12 h-12 rounded-md border-[1px] border-[#DE7D02]">
                      <span className="text-[24px] text-white flex items-center justify-center h-full">
                        {inv.investorName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="h-16 flex flex-col items-start justify-center py-3">
                      <div className="flex flex-row items-center justify-center ml-3">
                        <span className="text-[16px] mr-2">
                          {inv.investorName}
                        </span>
                        <MessageSquareText className="w-5 h-5 text-[#B4B4B4]" />
                      </div>
                      <span className="text-[16px] ml-3 mr-1 text-[#8C8C8C] tracking-tight">
                        {inv.timestamp}
                      </span>
                    </div>
                  </div>
                  <div className="text-[14px] text-[#95FF77] h-full pt-3">
                    +${inv.amount}
                  </div>
                </div>
                <div className="rounded-sm bg-[#4C4A48] p-2 h-full">
                  <p className="text-white text-[16px] break-words min-h-24">
                    {inv.comment || "No comment"}
                  </p>
                </div>
              </m.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
