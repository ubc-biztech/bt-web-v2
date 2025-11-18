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

  useEffect(() => {
    if (team && team.id) {
      const fetchFundingStatus = async () => {
        try {
          const data = await fetchBackend({
            endpoint: `/investments/teamStatus/${team?.id}`,
            method: "GET",
            authenticatedCall: true,
          });

          console.log(data);

          if (data) {
            setReceivedFunding(Math.round(data.funding) || -1);
            setRawInvestments(data.investments || null);
            setReceiveInvestments(processInvestments(data.investments) || []);
          }
        } catch (error) {
          console.error("Error fetching investments data:", error);
        }
      };
      fetchFundingStatus();
    }
  }, [team]);

  return (
    <div className="w-[90%] flex flex-col pb-20">
      <Header teamName={team?.teamName || ""} setPage={setPage} modal={modal} />
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
              <Recent investments={recentInvestments} setModal={setModal} />
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

export default Overview;
