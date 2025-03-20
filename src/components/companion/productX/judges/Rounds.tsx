import Rubric from "./Rubric";
import { useEffect, useState } from "react";
import FadeWrapper from "../ui/FadeAnimationWrapper";
import BizBot from "@/assets/2025/productx/bizbotxx.png";
import Image from "next/image";
import { fetchBackend } from "@/lib/db";
import { useUserRegistration } from "@/pages/companion";
import ProjectRow from "../ui/ProjectRow";
import { formatDate } from "../constants/formatDate";
import { TeamFeedback } from "../types";
import { initScore } from "../constants/rubricContents";

interface RoundsProps {
  records: Record<string, TeamFeedback[]> | null; // should be raw response from endpoint hit
}

const Rounds: React.FC<RoundsProps> = ({ records }) => {
  const { userRegistration } = useUserRegistration();

  const teamsJudged = records ? Object.values(records).flat() : [];

  const [showRubric, setShowRubric] = useState(false);
  const [teamFeedback, setTeamFeedback] = useState<TeamFeedback>(teamsJudged[0]);
  const [teamStatus, setTeamStatus] = useState("CURRENTLY PRESENTING");
  const [currentTeam, setCurrentTeam] = useState(null);

  const [currentRound, setCurrentRound] = useState(Math.max(...Object.keys(records || {}).map((key) => parseInt(key, 10))));

  useEffect(() => {
    if (!records) {
      return;
    }
    setCurrentRound(Math.max(...Object.values(records).map((record: any) => parseInt(record.round, 10))));
  }, [records]);

  useEffect(() => {
    const fetchCurrentTeam = async () => {
      try {
        const response = await fetchBackend({
          endpoint: `/team/judge/currentTeamID/${userRegistration?.id}`,
          method: "GET",
          authenticatedCall: false
        });

        if (
          teamsJudged.find((val) => {
            return val.teamID === response.currentTeamID;
          })
        ) {
          setCurrentTeam(null);
          return;
        }

        if (response?.currentTeamName) {
          setCurrentTeam(response);
          const searchFeedback = teamsJudged.find((feedback) => feedback.teamID === response.currentTeamID);
          if (searchFeedback) setTeamFeedback(searchFeedback);
          else {
            // fallback, manually setting new feedback params
            setTeamFeedback({
              round: `ROUND ${currentRound}`,
              judgeID: response.id,
              judgeName: response.judgeName,
              scores: { ...initScore },
              feedback: {},
              teamID: response.currentTeamID,
              teamName: response.currentTeamName,
              createdAt: `CURRENTLY PRESENTING`
            });
          }
        }
      } catch (error) {
        console.error("Error fetching current team:", error);
      }
    };

    if (userRegistration?.id) {
      fetchCurrentTeam();
    }
  }, [userRegistration?.id, records]);

  if (!currentTeam && !records) {
    return (
      <div className='flex flex-col items-center justify-center w-full min-h-[600px] border-2 border-dashed border-[#41437D] p-8'>
        <div className=' relative w-[70%] h-[70%]'>
          <Image src={BizBot} alt='BizBot' className='object-contain' fill />
        </div>
        <header className='text-lg font-ibm'>NO ENTRIES FOUND</header>
        <span className='pt-2 text-[#656795] text-center max-w-[600px] text-sm'>
          &quot;When a team begins their presentation for this round, you&apos;ll see an option to begin scoring their project.&quot;
        </span>
      </div>
    );
  }

  // console.log(
  //   !!teamsJudged.find((val) => {
  //     return currentTeam && val.teamID === (currentTeam as any).currentTeamID;
  //   })
  // );

  return (
    <>
      <FadeWrapper className='flex flex-row mt-10 gap-8'>
        <div className='w-full flex flex-col gap-5'>
          {currentTeam && (
            <ProjectRow
              team_name={(currentTeam as any).currentTeamName}
              team_status={`CURRENTLY PRESENTING`}
              read_only={false}
              presenting={true}
              onClick={() => {
                setShowRubric(true);
                setTeamStatus("CURRENTLY PRESENTING");
                setTeamFeedback(teamFeedback);
              }}
            />
          )}

          <div className='my-4 text-[#3D3E63] flex flex-row items-center'>
            <span>RECENT HISTORY</span>
            <figure className='ml-2 w-56 h-[1px] bg-[#3D3E63]' />
          </div>

          {teamsJudged.map((teamFeedback: TeamFeedback, index: number) => {
            const scored = Object.values(teamFeedback.scores).every((score: number) => score != 0);
            return (
              scored && (
                <ProjectRow
                  key={index}
                  team_name={teamFeedback.teamName}
                  team_status={`COMPLETED ${formatDate(teamFeedback.createdAt)}`}
                  read_only={false}
                  presenting={false}
                  onClick={() => {
                    setShowRubric(true);
                    setTeamFeedback(teamFeedback);
                  }}
                />
              )
            );
          })}
        </div>
      </FadeWrapper>
      {showRubric && (
        <Rubric
          team_feedback={teamFeedback}
          team_status={teamStatus}
          showRubric={setShowRubric}
          createSubmissionFlag={
            !!teamsJudged.find((val) => {
              return currentTeam && val.teamID === (currentTeam as any).currentTeamID;
            })
          }
        />
      )}
    </>
  );
};

export default Rounds;
