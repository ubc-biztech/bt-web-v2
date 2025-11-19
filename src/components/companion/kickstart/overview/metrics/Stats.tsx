"use client";

import type { ComponentType } from "react";
import React, { useState, useEffect } from "react";
import { useUserRegistration } from "@/pages/companion";
import { CreditCardIcon, HandCoinsIcon } from "lucide-react";

const Stats = ({ received }: { received: number }) => {
  const { userRegistration } = useUserRegistration();

  return (
    <div className="w-full h-1/3 flex flex-row items-stretch justify-between gap-2">
      <StatContent
        icon={CreditCardIcon}
        value={`$${Math.round(userRegistration?.balance || 0)}`}
        title="Available to invest"
        duration={1200}
      />
      <StatContent
        icon={HandCoinsIcon}
        value={`$${Math.round(received || 0)}`}
        title="Investment Received"
        duration={1200}
      />
    </div>
  );
};

interface StatsContentProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  value: string;
  duration?: number;
}

const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export const StatContent = ({
  icon: Icon,
  title,
  value,
  duration = 800,
}: StatsContentProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  const numericValue = value
    ? Number.parseInt(value.replace(/\D/g, ""), 10)
    : 0;
  const prefix = value ? value.replace(/[0-9]/g, "") : "";

  useEffect(() => {
    let startTime: number;
    let animationId: number;

    const animate = (currentTime: number) => {
      if (startTime === undefined) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);
      setDisplayValue(Math.round(numericValue * easedProgress));

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(Math.round(numericValue));
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [numericValue, duration]);

  return (
    <div className="bg-[#201F1E] w-full h-full overflow-hidden rounded-sm flex-1 flex flex-col">
      <div className="flex flex-col justify-center items-start h-full p-6 gap-2 min-h-0">
        <div className="bg-[#333333] w-10 h-10 flex items-center justify-center rounded-md">
          <Icon className="text-[#B4B4B4] w-6 h-6" />
        </div>
        <div className="flex flex-col min-h-0 w-full">
          <span className="text-white md:text-[32px] text-[24px] whitespace-nowrap">
            {prefix}
            {displayValue.toLocaleString()}
          </span>
          <span className="text-[#8C8C8C] md:text-[16px] text-[12px] whitespace-nowrap">
            {title}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Stats;
