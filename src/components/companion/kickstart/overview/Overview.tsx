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
import { AnimatePresence, m } from "framer-motion";
import CommentsModal from "./metrics/CommentsModal";
import { useUserRegistration } from "@/pages/companion";
import InvestmentsGrid from "../invest/investmentsGrid/InvestmentsGrid";
import type { RawInvestment } from "../invest/investmentsGrid/InvestmentCard";

const Overview = ({ setPage }: { setPage: (arg0: KickstartPages) => void }) => {
  const { team } = useTeam();
  const [receivedFunding, setReceivedFunding] = useState<number>(0);
  const [rawInvestments, setRawInvestments] = useState<RawInvestment[] | null>(
    null,
  );
  const [recentInvestments, setReceiveInvestments] = useState<
    Investment[] | null
  >(null);
  const [modal, setModal] = useState(false);

  const { userRegistration } = useUserRegistration();

  // partners and showcase see investments instead of team view
  const isPartnerView =
    userRegistration?.isPartner ||
    userRegistration?.["eventID;year"] === "kickstart-showcase;2025";

  useEffect(() => {
    if ((team && team.id) || isPartnerView) {
      const fetchFundingStatus = async () => {
        try {
          const data = await fetchBackend({
            endpoint: isPartnerView
              ? `/investments/investorStatus/${userRegistration?.id}`
              : `/investments/teamStatus/${team?.id}`,
            method: "GET",
            authenticatedCall: true,
          });

          if (data) {
            setReceivedFunding(data.funding || 0);
            setRawInvestments(data.investments || []);
            setReceiveInvestments(processInvestments(data.investments) || []);
          }
        } catch (error) {
          console.error("Error fetching investments data:", error);
        }
      };
      fetchFundingStatus();
    }
  }, [team, isPartnerView]);

  return (
    <>
      {isPartnerView ? (
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
                <m.div
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
                </m.div>
              ) : (
                <m.div
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
                </m.div>
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
  return (
    <InvestmentsGrid
      userRegistration={userRegistration}
      investments={investments}
      onClickInvest={() => setPage(KickstartPages.INVEST)}
    />
  );
};

export default Overview;
