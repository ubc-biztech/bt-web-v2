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
      round: 1, // ! hardcoded values here
      eventID: "productx",
      year: 2025,
      judgeID: userRegistration?.id || "",
      feedback: comments,
      scores: score
    };

    try {
      console.log(data);
      console.log(createOrUpdateFlag);

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

    console.log("great success!");
  };
  console.log(comments)
  return (
    <>
      <div className='top-0 left-0 w-screen h-screen scroll overflow-y-auto fixed z-30 bg-[#020319] flex flex-col items-center px-14'>
        <div className='w-full flex flex-row justify-between mt-36'>
          <div className='flex flex-row gap-5 items-center'>
            <header className='text-xl'>
              {team_feedback.round}: {team_feedback.teamName}
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
        <RubricGrid scoring={score} setScoring={setScore} editable={true} />

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
              className='hover:text-[#000000] hover:bg-white bg-[#198E7C] border border-[#198E7C] text-white w-36 h-10'
              onClick={handleSubmitScore}
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
