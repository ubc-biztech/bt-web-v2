import Header from "./header/Header";
import Stats from "./metrics/Stats";
import Recent from "./metrics/Recent";
import Graph from "./graph/Graph";
import { fetchBackend } from "@/lib/db";
import { Investment } from "./metrics/Recent";
import React, { useEffect, useState } from "react";
import {
  KickstartPages,
  useTeam,
} from "@/components/companion/events/Kickstart2025";
import { AnimatePresence, motion } from "framer-motion";
import CommentsModal from "./metrics/CommentsModal";
import { useUserRegistration } from "@/pages/companion";
import { GlowButton } from "../ui/GlowButton";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import PartnerInvestmentCard from "./partnerInvestmentCard/partnerInvestmentCard";

export interface RawInvestment {
  teamName: string;
  createdAt: number;
  isPartner: boolean;
  "eventID;year": string;
  amount: number;
  teamId: string;
  investorId: string;
  investorName: string;
  comment: string;
  id: string;
}

const Overview = ({ setPage }: { setPage: (arg0: KickstartPages) => void }) => {
  const { team } = useTeam();
  const [receivedFunding, setReceivedFunding] = useState<number>(-1);
  const [rawInvestments, setRawInvestments] = useState<RawInvestment[] | null>(
    null,
  );
  const [recentInvestments, setReceiveInvestments] = useState<
    Investment[] | null
  >(null);
  const [modal, setModal] = useState(false);

  const { userRegistration } = useUserRegistration();
  const isPartner = userRegistration?.isPartner || false;

  console.log("overview > isPartner", isPartner);

  useEffect(() => {
    if ((team && team.id) || userRegistration?.isPartner) {
      const fetchFundingStatus = async () => {
        try {
          const data = await fetchBackend({
            endpoint: isPartner
              ? `/investments/investorStatus/${userRegistration?.id}`
              : `/investments/teamStatus/${team?.id}`,
            method: "GET",
            authenticatedCall: true,
          });

          if (data) {
            setReceivedFunding(data.funding || -1);
            setRawInvestments(data.investments || null);
            setReceiveInvestments(processInvestments(data.investments) || []);
          }
        } catch (error) {
          console.error("Error fetching investments data:", error);
        }
      };
      fetchFundingStatus();
    }
  }, [team, isPartner]);

  console.log("overview > rawInvestments", rawInvestments);

  return (
    <>
      {isPartner ? (
        <PartnerView
          userRegistration={userRegistration}
          investments={rawInvestments || []}
          setPage={setPage}
        />
      ) : (
        <>
          <div className="w-[90%] flex flex-col pb-20">
            <Header
              teamName={team?.teamName || ""}
              setPage={setPage}
              modal={modal}
            />
            <AnimatePresence mode="wait">
              {!modal ? (
                <motion.div
                  key="overview"
                  className="w-full md:h-[6em] flex md:flex-row flex-col mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Graph investments={rawInvestments || []} />
                  <div className="md:w-2/5 w-full h-full flex flex-col gap-3">
                    <Stats received={receivedFunding} />
                    <Recent
                      investments={recentInvestments}
                      setModal={setModal}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="modal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CommentsModal
                    investments={processInvestments(rawInvestments || [])}
                    setModal={setModal}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </>
  );
};

export const processInvestments = (
  rawInvestments: RawInvestment[],
): Investment[] => {
  if (!rawInvestments || rawInvestments.length === 0) {
    return [];
  }

  const sortedInvestments = [...rawInvestments].sort(
    (a, b) => b.createdAt - a.createdAt,
  );

  return sortedInvestments.map((item) => {
    const date = new Date(item.createdAt);

    const formatTimestamp = (d: Date): string => {
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const year = String(d.getFullYear()).slice(-2);

      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";

      hours = hours % 12;
      hours = hours ? hours : 12;

      return `${month}-${day}-${year} - ${hours}:${minutes}${ampm}`;
    };

    return {
      investorName: item.investorName,
      amount: Math.round(item.amount),
      timestamp: formatTimestamp(date),
      comment: item.comment,
    };
  });
};

interface PartnerViewProps {
  userRegistration: any;
  investments: RawInvestment[];
  setPage: (arg0: KickstartPages) => void;
}

const PartnerView = ({
  userRegistration,
  investments,
  setPage,
}: PartnerViewProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [columns, setColumns] = useState<number>(3);

  const ROWS_PER_PAGE = 3;
  const itemsPerPage = ROWS_PER_PAGE * columns;
  const totalPages = Math.ceil(investments.length / itemsPerPage);
  const clampedPage =
    currentPage >= totalPages ? Math.max(totalPages - 1, 0) : currentPage;
  const paginatedInvestments = investments.slice(
    clampedPage * itemsPerPage,
    clampedPage * itemsPerPage + itemsPerPage,
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  // Detect screen size to calculate columns
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        // lg breakpoint - 3 columns
        setColumns(3);
      } else if (width >= 640) {
        // sm breakpoint - 2 columns
        setColumns(2);
      } else {
        // mobile - 1 column
        setColumns(1);
      }
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

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

          <div
            onClick={() => {
              setPage(KickstartPages.INVEST);
            }}
          >
            <GlowButton height="h-10" width="sm:w-48 w-20 pl-2" icon={Plus}>
              <span className="text-[14px] hidden sm:flex">
                New Investments
              </span>
            </GlowButton>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {paginatedInvestments.map((investment) => (
            <PartnerInvestmentCard
              key={investment.id}
              investment={investment}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;
