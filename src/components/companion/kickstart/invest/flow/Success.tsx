import React from "react";
import Progress2_2 from "@/assets/2025/kickstart/progress2_2.svg";
import { X } from "lucide-react";
import { KickstartPages } from "@/components/companion/events/Kickstart2025";

interface SuccessProps {
  successInfo: {
    amount: number;
    teamName: string;
    newBalance: number;
  };
  resetFlow: () => void;
  setPage: (page: KickstartPages) => void;
}

const Success = ({ successInfo, resetFlow, setPage }: SuccessProps) => {
  return (
    <div className="space-y-1">
      <div className="space-y-5 bg-[#1A1918] p-5 rounded-lg">
        <button
          type="button"
          className="absolute top-4 right-4 text-white/70 hover:text-white"
          onClick={() => {
            resetFlow();
            window.location.reload();
          }}
          aria-label="Close investment flow"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <p className="text-[#FFCC8A] text-xs">INVEST IN A PROJECT</p>
          <h2 className="text-white text-xl font-semibold mt-1 leading-tight">
            Congratulations! You've invested{" "}
            <span className="text-[#FFB35C]">
              ${successInfo.amount.toLocaleString()}
            </span>{" "}
            into <span className="text-[#FFB35C]">{successInfo.teamName}</span>.
          </h2>
        </div>

        <div className="flex items-center gap-3 text-sm text-[#B8B8B8]">
          Your new balance is ${successInfo.newBalance.toLocaleString()}.
        </div>
      </div>

      <div className="flex flex-col gap-3 bg-[#1A1918]  p-5 rounded-lg ">
        <div className="flex items-center justify-between text-sm text-[#B8B8B8]">
          <div className="flex items-center">
            <Progress2_2 className="w-10 h-10 text-[#FFB35C] shrink-0 justify-center" />
            Thanks for submitting!
          </div>

          <button
            type="button"
            className="w-30 rounded-lg bg-[#DE7D02] hover:bg-[#f29224] px-4 py-3 font-semibold text-white transition-colors"
            onClick={() => {
              setPage(KickstartPages.OVERVIEW);
              window.location.reload();
            }}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;
