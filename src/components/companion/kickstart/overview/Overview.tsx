import Header from "./header/Header";
import Stats from "./metrics/Stats";
import Recent from "./metrics/Recent";
import Graph from "./graph/Graph";
import { fetchBackend } from "@/lib/db";
import { Investment } from "./metrics/Recent";
import React, { useEffect, useState } from "react";
import { useTeam } from "@/components/companion/events/Kickstart2025";
import { useUserRegistration } from "@/pages/companion";
import { truncate } from "node:fs/promises";
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

const Overview = () => {
  const { team } = useTeam();
  const { userRegistration } = useUserRegistration();
  const isPartner = /*userRegistration?.isPartner || truncate; */ true;
  const [receivedFunding, setReceivedFunding] = useState<number>(-1);
  const [rawInvestments, setRawInvestments] = useState<RawInvestment[] | null>(
    null,
  );

  console.log("userRegistration", userRegistration);
  console.log("isPartner", isPartner);

  const [recentInvestments, setReceiveInvestments] = useState<
    Investment[] | null
  >(null);

  const mockInvestments: RawInvestment[] = [
    {
      id: "1",
      teamName: "TechStart",
      teamId: "team-1",
      investorId: "investor-1",
      investorName: "John Smith",
      amount: 5000,
      createdAt: Date.now() - 86400000, // 1 day ago
      isPartner: true,
      "eventID;year": "kickstart-2025",
      comment: "Great idea!",
    },
    {
      id: "2",
      teamName: "TechStart",
      teamId: "team-1",
      investorId: "investor-2",
      investorName: "Sarah Johnson",
      amount: 7500,
      createdAt: Date.now() - 172800000, // 2 days ago
      isPartner: false,
      "eventID;year": "kickstart-2025",
      comment:
        "I really like the concept and think it has potential in the market.",
    },
    {
      id: "3",
      teamName: "TechStart",
      teamId: "team-1",
      investorId: "investor-3",
      investorName: "Michael Chen",
      amount: 10000,
      createdAt: Date.now() - 259200000, // 3 days ago
      isPartner: true,
      "eventID;year": "kickstart-2025",
      comment:
        "This is an excellent project with strong potential. The team has demonstrated great technical skills and I believe in their vision. Looking forward to seeing how this develops.",
    },
    {
      id: "4",
      teamName: "TechStart",
      teamId: "team-1",
      investorId: "investor-4",
      investorName: "Emily Rodriguez",
      amount: 3000,
      createdAt: Date.now() - 345600000, // 4 days ago
      isPartner: false,
      "eventID;year": "kickstart-2025",
      comment:
        "I've been following this project closely and I'm impressed by the team's dedication and the innovative approach they're taking. The problem they're solving is very relevant in today's market, and I think they have a solid plan for execution. The prototype they've shown demonstrates real technical capability, and I'm confident they can deliver on their promises. This investment represents my belief in both the product and the people behind it.",
    },
    {
      id: "5",
      teamName: "TechStart",
      teamId: "team-1",
      investorId: "investor-5",
      investorName: "David Kim",
      amount: 12000,
      createdAt: Date.now() - 432000000, // 5 days ago
      isPartner: true,
      "eventID;year": "kickstart-2025",
      comment:
        "After thoroughly reviewing the business plan, technical documentation, and speaking with the team members, I am convinced this is a worthwhile investment opportunity. The market analysis shows significant demand for this type of solution, and the competitive landscape analysis indicates there's room for innovation. The team has shown exceptional problem-solving skills and has already overcome several technical challenges that would have stumped less capable developers. Their go-to-market strategy is well thought out, and they have clear milestones for the next 6-12 months. I believe this project has the potential to make a real impact in the industry, and I'm excited to be part of their journey. The combination of technical excellence, market opportunity, and team dedication makes this an investment I'm confident about.",
    },
    {
      id: "6",
      teamName: "TechStart",
      teamId: "team-1",
      investorId: "investor-6",
      investorName: "Lisa Wang",
      amount: 2500,
      createdAt: Date.now() - 518400000, // 6 days ago
      isPartner: false,
      "eventID;year": "kickstart-2025",
      comment: "Solid.",
    },
    {
      id: "7",
      teamName: "TechStart",
      teamId: "team-1",
      investorId: "investor-7",
      investorName: "Robert Taylor",
      amount: 8000,
      createdAt: Date.now() - 604800000, // 7 days ago
      isPartner: true,
      "eventID;year": "kickstart-2025",
      comment:
        "The technical implementation looks solid and the user experience design is thoughtful. I appreciate the attention to detail.",
    },
  ];

  useEffect(() => {
    if (team && team.id) {
      const fetchFundingStatus = async () => {
        try {
          const data = await fetchBackend({
            endpoint: isPartner
              ? `/investments/investorStatus/${userRegistration?.id}`
              : `/investments/teamStatus/${team?.id}`,
            method: "GET",
            authenticatedCall: true,
          });

          console.log(data);

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

  console.log("recentInvestments", recentInvestments);
  console.log("rawInvestments", rawInvestments);
  return (
    <>
      {isPartner ? (
        <div className="w-[90%] flex flex-col pb-20">
          <div className="w-full flex flex-col items-center justify-center mt-14">
            <span className="font-instrument text-[60px] leading-none">
              ${userRegistration?.balance || 0}
            </span>
            <span className="text-[#8C8C8C] text-xs mt-2">
              available to invest
            </span>
          </div>
          <span className="text-xs">past investments</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 mx-auto">
            {mockInvestments.map((investment) => (
              <PartnerInvestmentCard
                key={investment.id}
                investment={investment}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="w-[90%] flex flex-col pb-20">
          <Header teamName={team?.teamName || ""} />
          <div className="w-full md:h-[6em] flex md:flex-row flex-col mt-4">
            <Graph investments={rawInvestments || []} />
            <div className="md:w-2/5 w-full h-full flex flex-col gap-3">
              <Stats received={receivedFunding} />
              <Recent investments={recentInvestments} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const processInvestments = (rawInvestments: RawInvestment[]): Investment[] => {
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
      amount: item.amount,
      timestamp: formatTimestamp(date),
    };
  });
};

export default Overview;
