import Button from "../ui/Button";
import { fetchBackend } from "@/lib/db";
import { useUserRegistration } from "@/pages/companion";
import React, { useEffect, useState } from "react";
import RubricModal from "../ui/rubric/RubricModal";
import { initScore, mapMetricsToCategories } from "../constants/rubricContents";
import Tag from "../ui/rubric/Tag";
import RubricGrid from "../ui/rubric/RubricGrid";
import { ScoringMetric, ScoringRecord, TeamFeedback } from "@/components/companion/productX/types";
import RubricComments from "../ui/rubric/RubricComments";
import { useJudgesRefresh } from "../Judges";
import { capitalizeTeamName } from "../../CompanionHome";

interface RubricProps {
  team_feedback: TeamFeedback; // should be near-native output of endpoint
  team_status: string;
  showRubric: (arg0: boolean) => void;
  createOrUpdateFlag: boolean;
}

const Rubric: React.FC<RubricProps> = ({ team_feedback, team_status, showRubric, createOrUpdateFlag }) => {
  const { userRegistration } = useUserRegistration();
  const { refreshData } = useJudgesRefresh();
  const [comments, setComments] = useState<{ [key: string]: string }>(team_feedback.feedback || {});

  const [modal, setModal] = useState(false);
  const [score, setScore] = useState<ScoringRecord>(team_feedback.scores || initScore);

  const metrics = Object.keys(score) as ScoringMetric[];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []); // disabled scroll when rubric is overlayed

  const confirmExit = () => {
    if (JSON.stringify(score) !== JSON.stringify(team_feedback.scores)) {
      setModal(true);
    } else {
      showRubric(false);
    }
  }; // confirm exit if there are unsaved changes

  const handleSubmitScore = async () => {
    const data = {
      teamID: team_feedback.teamID,
      round: Number(team_feedback.round),
      eventID: "productx",
      year: 2025,
      judgeID: userRegistration?.id || "",
      feedback: comments,
      scores: {
        metric1: score.metric1,
        metric3: score.metric3,
        metric2: score.metric2,
        metric4: score.metric4,
        metric5: score.metric5
      }
    };
    try {
      await fetchBackend({
        endpoint: "/team/judge/feedback",
        method: createOrUpdateFlag ? "POST" : "PUT",
        data,
        authenticatedCall: false
      });

      await refreshData();
      showRubric(false);
    } catch (error) {
      console.error(error);
      return;
    }
  };

  return (
    <>
      <div className='top-0 left-0 w-screen h-screen scroll overflow-y-auto fixed z-30 bg-[#020319] flex flex-col items-center px-14'>
        <div className='w-full flex flex-row justify-between mt-36'>
          <div className='flex flex-row gap-5 items-center'>
            <header className='text-xl'>
              ROUND  {team_feedback.round}: {capitalizeTeamName(team_feedback.teamName)}
            </header>

            {/* Tags */}
            <Tag flag={!createOrUpdateFlag} />
          </div>
          <div className='flex flex-row gap-3 items-center text-[#898BC3]'>
            <span>{team_status}</span>
            <span>|</span>
            <span
              className='underline cursor-pointer z-50'
              onClick={() => {
                confirmExit();
              }}
            >
              Return to Home
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className='w-full h-[1px] bg-[#41437D] mt-3'>&nbsp;</div>

        {/* Grid */}
        <RubricGrid scoring={score} setScoring={setScore} editable={true} idx={-1} />

        {/* Comments */}
        <RubricComments feedback={comments} setFeedback={setComments} />

        {/* Submission */}
        <div className='w-full flex flex-row items-center justify-between mb-56 mt-12'>
          <div className='flex flex-col text-[#898BC3] gap-2'>
            <span className='text-lg text-white'>
              TOTAL SCORE:&nbsp;
              {metrics.every((metric) => score[metric] !== undefined) ? metrics.reduce((total, metric) => total + score[metric], 0) : "N/A"}
            </span>
            {metrics.map((metric) => (
              <span key={metric}>{`${mapMetricsToCategories[metric]}: ${score[metric] || "N/A"}`}</span>
            ))}
          </div>
          <div className='flex flex-row gap-2'>
            <Button
              label='CANCEL'
              Icon={null}
              className='hover:text-[#000000] bg-[#FF4262] border border-[#FF4262] text-[#FF4262] w-24 h-10 hover:bg-opacity-100 bg-opacity-0'
              onClick={() => {
                confirmExit();
              }}
            />
            <Button
              label='SUBMIT SCORE'
              Icon={null}
              className='hover:text-black hover:bg-white bg-[#198E7C] border border-[#198E7C] text-white w-36 h-10'
              onClick={() => {
                const allScored = metrics.every(
                  (metric) => typeof score[metric] === "number" && score[metric] > 0
                );

                if (!allScored) {
                  alert("Please score all metrics before submitting.");
                  return;
                }

                handleSubmitScore();
              }}
            />
          </div>
        </div>
      </div>

      {/* Confirm if you want to discard unsaved changes */}
      <RubricModal modal={modal} setModal={setModal} showRubric={showRubric} />
    </>
  );
};

export default Rubric;
