"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { fetchBackend } from "@/lib/db";

export type InvestmentEntry = {
  investorName: string;
  amount: number;
  teamName: string;
};

const skeleton = Array(10).fill({ investorName: "...", amount: 0, teamName: "..." })

export const Ticker = () => {
  // Sample data for the ticker
  const [teams, setTeams] = useState<InvestmentEntry[]>(skeleton)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchBackend({
          endpoint: `/investments?limit=10`,
          method: "GET",
          authenticatedCall: true,
        });

        console.log("Fetched ticker data:", data);

        const transformedEntries = data.map((investment: { investorName: string; amount: number; teamName: string; }) => ({
            investorName: investment.investorName,
            amount: investment.amount,
            teamName: investment.teamName
        }));

        if (transformedEntries && transformedEntries.length) {
          setTeams(transformedEntries);
        }
      }
      catch (error) {
        console.error("Error fetching ticker data:", error);
      }
    };

    fetchData();
  }, []);
  
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
          {teams.map((entry, idx) => (
            <Entry
              key={`first-${idx}`}
              from={entry.investorName}
              amount={entry.amount}
              to={entry.teamName}
            />
          ))}
          {/* Duplicate set for seamless loop */}
          {teams.map((entry, idx) => (
            <Entry
              key={`second-${idx}`}
              from={entry.investorName}
              amount={entry.amount}
              to={entry.teamName}
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
      className="w-full md:w-[45vw] h-10 text-white relative"
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
