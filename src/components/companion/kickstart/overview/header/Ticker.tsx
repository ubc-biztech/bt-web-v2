"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export const Ticker = () => {
  // Sample data for the ticker
  const entries = [
    { from: "Kevin", amount: 2400, to: "Biz.ai" },
    { from: "Alice", amount: 1850, to: "TechCorp" },
    { from: "David", amount: 3200, to: "StartupXYZ" },
    { from: "Emma", amount: 2100, to: "CloudSync" },
    { from: "James", amount: 2750, to: "DataFlow" },
    { from: "Sarah", amount: 1950, to: "AI Labs" },
    { from: "Michael", amount: 3100, to: "Nexus" },
    { from: "Laura", amount: 2600, to: "Quantum" },
    { from: "Chris", amount: 2300, to: "Velocity" },
    { from: "Sophie", amount: 2900, to: "Fusion" },
  ];

  return (
    <BorderContainer>
      <div className="relative h-10 flex items-center overflow-hidden whitespace-nowrap">
        <div
          className="flex flex-row items-center justify-center gap-0 animate-scroll whitespace-nowrap"
          style={{
            animation: "scroll 60s linear infinite",
          }}
        >
          {/* First set of entries */}
          {entries.map((entry, idx) => (
            <Entry
              key={`first-${idx}`}
              from={entry.from}
              amount={entry.amount}
              to={entry.to}
            />
          ))}
          {/* Duplicate set for seamless loop */}
          {entries.map((entry, idx) => (
            <Entry
              key={`second-${idx}`}
              from={entry.from}
              amount={entry.amount}
              to={entry.to}
            />
          ))}
        </div>

        <style>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}</style>
      </div>
    </BorderContainer>
  );
};

interface EntryProps {
  from: string;
  amount: number;
  to: string;
}

const Entry = ({ from, amount, to }: EntryProps) => {
  return (
    <div className="h-10 flex flex-row items-center justify-center mx-6 text-[12px]">
      <span>{from}</span>
      <figure className="border border-[#95FF77] bg-[#1E281B] text-[#95FF77] px-2 mx-2 rounded-full flex flex-row items-center justify-center">
        <ArrowRight className="w-4 h-4 text-[#95FF77]" />${amount}
      </figure>
      <span className="">{to}</span>
    </div>
  );
};

interface BorderContainerProps {
  children: React.ReactNode;
}

const BorderContainer = ({ children }: BorderContainerProps) => {
  return (
    <div
      className="w-1/2 h-10 text-white relative"
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)",
      }}
    >
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: "2px",
          backgroundImage:
            "repeating-linear-gradient(to right, #333333 0px, #333333 13px, transparent 13px, transparent 20px)",
          borderRadius: "3px",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "2px",
          backgroundImage:
            "repeating-linear-gradient(to right, #333333 0px, #333333 13px, transparent 13px, transparent 20px)",
          borderRadius: "3px",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)",
        }}
      />

      {children}
    </div>
  );
};
