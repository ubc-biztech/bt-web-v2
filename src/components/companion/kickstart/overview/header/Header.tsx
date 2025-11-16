import React from "react";
import { Plus } from "lucide-react";
import { GlowButton } from "../../ui/GlowButton";
import { Ticker } from "@/components/companion/kickstart/overview/header/Ticker";

const Header = ({ teamName }: { teamName: string }) => {
  return (
    <div className="w-full h-30 flex flex-col items-center jusitfy-center md:mt-14 sm:mt-6">
      <div className="w-full md:hidden flex mb-4">
        <Ticker />
      </div>
      <div className="w-full flex flex-row items-end justify-between text-[24px]">
        <header className="font-instrument text-[42px] flex items-end leading-none">
          {teamName}
        </header>
        <div className="md:flex hidden">
          <Ticker />
        </div>
        <GlowButton href="/companion" height="h-10" width="w-48" icon={Plus}>
          <span className="text-[14px]">New Investments</span>
        </GlowButton>
      </div>
    </div>
  );
};

export default Header;
