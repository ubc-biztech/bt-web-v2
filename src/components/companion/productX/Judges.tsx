import React, { useState, useEffect } from "react";
import { HistoryIcon, PanelsTopLeft } from "lucide-react";
import History from "./judges/History";
import Rounds from "./judges/Rounds";
import { fetchBackend } from "@/lib/db";
import { useUserRegistration } from "@/pages/companion";

interface JudgesProps {
  judgeID: string;
}



const Judges: React.FC<JudgesProps> = ({ judgeID }) => {
  const [page, setPage] = useState("rounds");
  const [teams, setTeams] = useState([]);

  const { userRegistration } = useUserRegistration();
  useEffect(() => {
    const fetchTeamsForJudge = async () => {
      try {
        const response = await fetchBackend({
          endpoint: `/team/judge/feedback/${userRegistration?.id}`,
          method: "GET",
          authenticatedCall: false
        });

        console.log(response);

        if (response && response.scores) {
          setTeams(response.scores);
        }
      } catch (error) {
        console.error("Error fetching teams for judge:", error);
      }
    };

    if (userRegistration?.id) {
      fetchTeamsForJudge();
    }
  }, [userRegistration?.id]);

  return (
    <div className='w-full px-10'>
      <div className='flex flex-col'>
        <header className='mt-16 text-lg font-ibm'>JUDGING DASHBOARD</header>
        <div className='border-b-2 border-[#41437D] mt-6 flex flex-row'>
          <div
            className={`w-24 h-10 border-b-2 ${
              page === "rounds" ? "border-[#4CC8BD] text-[#4CC8BD]" : "border-[#41437D] text-[#41437D]"
            } -mb-[2px] flex flex-row items-center justify-center gap-1 cursor-pointer`}
            onClick={() => {
              setPage("rounds");
            }}
          >
            <PanelsTopLeft size={16} color={page === "rounds" ? "#4CC8BD" : "#41437D"} />
            Rounds
          </div>
          <div
            className={`w-24 h-10 border-b-2 ${
              page === "history" ? "border-[#4CC8BD] text-[#4CC8BD]" : "border-[#41437D] text-[#41437D]"
            } -mb-[2px] flex flex-row items-center justify-center gap-1 cursor-pointer`}
            onClick={() => setPage("history")}
          >
            <HistoryIcon size={16} color={page === "history" ? "#4CC8BD" : "#41437D"} />
            History
          </div>
        </div>

        {/* Conditionally render pages */}

        {page === "history" && <History feedback={teams} />}
        {page === "rounds" && <Rounds feedback={teams} />}
      </div>
    </div>
  );
};

export default Judges;
