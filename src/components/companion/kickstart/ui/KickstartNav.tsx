"use client";

import React, { useEffect, useState } from "react";
import { PenTool, Coins, Settings } from "lucide-react";
import { KickstartPages } from "@/components/companion/events/Kickstart2025";

interface KickstartNavProps {
  children: React.ReactNode;
  page: KickstartPages;
  setPage: (page: KickstartPages) => void;
} 

export function KickstartNav({ children, page, setPage } : KickstartNavProps) {
  const [lastNavIdx, setLastNavIdx] = useState(0);
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const tabs = [
    { id: KickstartPages.OVERVIEW, label: "Overview", Icon: PenTool },
    { id: KickstartPages.INVEST, label: "Invest", Icon: Coins },
    { id: KickstartPages.SETTINGS, label: "Settings", Icon: Settings },
  ];

  const isProfile = page === KickstartPages.PROFILE;
  const currentIdx = tabs.findIndex((t) => t.id === page);

  // Track last nav position before switching to profile
  const sliderIdx = currentIdx === -1 ? lastNavIdx : currentIdx;

  React.useEffect(() => {
    if (currentIdx !== -1) {
      setLastNavIdx(currentIdx);
    }
  }, [currentIdx]);

  return (
    <>
      <div className="
      pb-20 
      overflow-y-auto">
        {children}
      </div>
      <nav className={`
          fixed 
          bottom-10 
          left-0 
          right-0 
          z-50 
          text-[#B4B4B4] 
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} 
          transition-opacity 
          duration-500 
          flex 
          justify-center 
          ease-in-out
        `}>
        <div className="flex items-center justify-center gap-4 px-4 py-2">
        <div
          className="
            relative 
            flex 
            items-center 
            bg-[#181818]
            shadow-[inset_0_-3px_8px_rgba(255,255,255,0.1)]
            rounded-full 
            px-1.5 
            h-11
            w-fit"
        >
          <div
            className="absolute bg-[#141414] rounded-full pointer-events-none transition-all duration-300 ease-out"
            style={{
              top: "6px",
              bottom: "6px",
              width: `calc(${100 / tabs.length}% - 6px)`,
              left: `calc(${(sliderIdx * 95) / tabs.length}% + 12px)`,
              opacity: isProfile ? 0 : 1,
            }}
          />

          {tabs.map((tab, i) => {
            const isOn = sliderIdx === i && !isProfile;
            return (
              <button
                key={tab.id}
                onClick={() => setPage(tab.id)}
                className="relative flex items-center gap-2 px-3 py-2.5 z-10"
              >
                <tab.Icon
                  className="w-5 h-5 transition-colors"
                  style={{ color: isOn ? "#FFFFFF" : "#B4B4B4" }}
                  strokeWidth={1.5}
                />
                <span 
                  className="text-sm font-medium transition-colors"
                  style={{ color: isOn ? "#FFFFFF" : "#B4B4B4" }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className="
            relative 
            flex 
            items-center 
            bg-[#181818]
            rounded-full
            h-11
            p-1.5 
            shadow-[inset_0_-3px_8px_rgba(255,255,255,0.1)]"
        >
          <div
            className="absolute inset-y-1.5 inset-x-1.5 bg-[#181818] rounded-full pointer-events-none transition-opacity duration-300"
            style={{ opacity: isProfile ? 1 : 0 }}
          />
          <button
            onClick={() => setPage(KickstartPages.PROFILE)}
            className="relative flex items-center gap-2 pr-1 h-8 z-10"
          >
            <div 
              className="w-8 h-8 rounded-full transition-colors"
              style={{ backgroundColor: isProfile ? "#FFFFFF" : "#B4B4B4" }}
            />
              <span 
                className="font-medium text-sm transition-colors"
                style={{ color: isProfile ? "#FFFFFF" : "#B4B4B4" }}
              >
                Profile
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}