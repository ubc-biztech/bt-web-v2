import React from "react";
import { Plus } from "lucide-react";
import { GlowButton } from "../../ui/GlowButton";
import { Ticker } from "@/components/companion/kickstart/overview/header/Ticker";
import { KickstartPages } from "@/components/companion/events/Kickstart2025";

const charLimit = 12;

const Header = ({
  teamName,
  setPage,
  modal,
}: {
  teamName: string;
  setPage: (arg0: KickstartPages) => void;
  modal: boolean;
}) => {
  return (
    <div className="w-full h-30 flex flex-col items-center jusitfy-center md:mt-14 sm:mt-6">
      <div className="w-full md:hidden flex mb-4">
        <Ticker />
      </div>
      <div className="w-full flex flex-row items-end justify-between text-[24px]">
        <header
          className={`font-instrument text-[42px] flex items-end leading-none ${modal ? "text-[#DE7D02]" : "text-white"} transition duration-500 ease-in-out`}
        >
          {teamName.length > charLimit
            ? `${teamName.substring(0, charLimit)}..`
            : teamName}{" "}
          <span
            className={`transition duration-200 ease-in-out text-white ml-2 ${modal ? "opacity-100" : "opacity-0"}`}
          >
            Overview
          </span>
        </header>
        <div className="md:flex hidden">
          <Ticker />
        </div>
        <div
          onClick={() => {
            setPage(KickstartPages.INVEST);
          }}
        >
          <GlowButton
            height="h-10"
            width="sm:w-48 w-20 sm:pl-0 pl-2"
            icon={Plus}
          >
            <span className="text-[14px] hidden sm:flex">New Investments</span>
          </GlowButton>
        </div>
      </div>
    </div>
  );
};

export default Header;
