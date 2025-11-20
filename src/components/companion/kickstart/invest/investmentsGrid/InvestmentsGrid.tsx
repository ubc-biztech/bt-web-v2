import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { GlowButton } from "../../ui/GlowButton";
import InvestmentCard, { RawInvestment } from "./InvestmentCard";

interface InvestmentsGridProps {
  userRegistration: any;
  investments: RawInvestment[];
  onClickInvest: () => void;
}

const InvestmentsGrid = ({
  userRegistration,
  investments,
  onClickInvest,
}: InvestmentsGridProps) => {
  const [currentPage, setCurrentPage] = useState(0);

  // Sort investments by recency (most recent first)
  const sortedInvestments = useMemo(() => {
    return [...investments].sort((a, b) => b.createdAt - a.createdAt);
  }, [investments]);

  // Use fixed column count (3) for pagination calculations
  // The grid itself uses Tailwind responsive classes: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
  const ROWS_PER_PAGE = 3;
  const COLUMNS = 3; // Matches lg:grid-cols-3 breakpoint
  const itemsPerPage = ROWS_PER_PAGE * COLUMNS;
  const totalPages = Math.ceil(sortedInvestments.length / itemsPerPage);
  const clampedPage =
    currentPage >= totalPages ? Math.max(totalPages - 1, 0) : currentPage;
  const paginatedInvestments = sortedInvestments.slice(
    clampedPage * itemsPerPage,
    clampedPage * itemsPerPage + itemsPerPage,
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  return (
    <div className="w-[90%] flex flex-col pb-20">
      <div className="w-full flex flex-col items-center justify-center mt-14">
        <span className="font-instrument text-[60px] leading-none">
          ${userRegistration?.balance || 0}
        </span>
        <span className="text-[#8C8C8C] text-xs mt-2">available to invest</span>
      </div>

      {/* Past investments header + controls */}
      <div className="mt-10 w-full max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-white text-sm">Past Investments</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={clampedPage === 0}
                className="w-8 h-8 flex items-center justify-center rounded-md bg-[#333333] text-[#B4B4B4] disabled:opacity-40"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={clampedPage >= totalPages - 1}
                className="w-8 h-8 flex items-center justify-center rounded-md bg-[#333333] text-[#B4B4B4] disabled:opacity-40"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div onClick={onClickInvest}>
            <GlowButton height="h-10" width="sm:w-48 w-20 pl-2" icon={Plus}>
              <span className="text-[14px] hidden sm:flex">New Investment</span>
            </GlowButton>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {paginatedInvestments.length > 0 ? (
            paginatedInvestments.map((investment) => (
              <InvestmentCard key={investment.id} investment={investment} />
            ))
          ) : (
            <p className="text-[#8C8C8C] text-sm col-span-full text-center mt-4">
              No investments yet. Start investing to see them here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentsGrid;
