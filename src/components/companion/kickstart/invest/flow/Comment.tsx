import React from "react";
import Progress2_2 from "@/assets/2025/kickstart/progress2_2.svg";
import Progress1_2 from "@/assets/2025/kickstart/progress1_2.svg";
import MessageLogo from "@/assets/2025/kickstart/message.svg";
import { CreditCard, X } from "lucide-react";

interface CommentProps {
  selectedTeam: { teamName: string };
  confirmedAmount: number | null;
  comment: string;
  setComment: (comment: string) => void;
  flowError: string | null;
  isSubmitting: boolean;
  handleSubmitInvestment: () => void;
  resetFlow: () => void;
}

const Comment = ({
  selectedTeam,
  confirmedAmount,
  comment,
  setComment,
  flowError,
  isSubmitting,
  handleSubmitInvestment,
  resetFlow,
}: CommentProps) => {
  return (
    <div className="space-y-1">
      <button
          type="button"
          className="absolute top-4 right-4 text-white/70 hover:text-white"
          onClick={resetFlow}
          aria-label="Close investment flow"
        >
          <X className="w-5 h-5" />
        </button>
      <div className="space-y-5 bg-[#1A1918] p-5 rounded-lg">
        <div>
          <p className="text-[#FFCC8A] text-xs">INVEST IN A PROJECT</p>
          <h2 className="text-white text-xl font-semibold mt-1 leading-tight">
            Invest in{" "}
            <span className="text-[#DE7D02]">{selectedTeam.teamName}</span>
          </h2>
        </div>

        <div className="pl-4 rounded-2xl">
          <div className="flex items-center gap-2 text-white font-semibold ">
            <CreditCard className="text-[#FFFFFF] bg-[#FFCC8A] transition-colors rounded-md w-max h-max flex items-center justify-center p-1 shrink-0" />
            Amount:{" "}
            <span className="text-[#DE7D02]">
              ${confirmedAmount?.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-[#2C2B2A] p-4 space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold ">
            <MessageLogo className="text-[#FFFFFF] bg-[#DE7D02] transition-colors rounded-md w-max h-max flex items-center justify-center p-1 shrink-0" />
            Comments
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Leave a message or feedback"
            className="w-full rounded-lg bg-white/95 text-[#1F1F1F] px-3 py-2 min-h-[110px] resize-none focus:outline-none"
          />
        </div>

        {flowError && <p className="text-sm text-red-400">{flowError}</p>}
      </div>

      <div className="flex flex-col gap-3 bg-[#1A1918]  p-5 rounded-lg ">
        <div className="flex items-center gap-3 text-sm text-[#B8B8B8]">
          {comment != "" ? (
            <Progress2_2 className="w-10 h-10 text-[#FFB35C] shrink-0 justify-center" />
          ) : (
            <Progress1_2 className="w-10 h-10 text-[#FFB35C] shrink-0 justify-center" />
          )}
          We'll deduct from your spending account. This will not decrease your
          own funding.
          <button
            type="button"
            className="rounded-lg bg-[#DE7D02] hover:bg-[#f29224] px-4 py-3 font-semibold text-white transition-colors disabled:opacity-50"
            disabled={!comment.trim() || isSubmitting}
            onClick={handleSubmitInvestment}
          >
            {isSubmitting ? "Submitting..." : "Invest"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Comment;
