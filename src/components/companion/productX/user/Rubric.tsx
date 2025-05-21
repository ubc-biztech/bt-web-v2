import Button from "../ui/Button";
import { fetchBackend } from "@/lib/db";
import { useUserRegistration } from "@/pages/companion";
import React, { useEffect, useState } from "react";
import RubricModal from "../ui/rubric/RubricModal";
import {
  initScore,
  isGraded,
  mapMetricsToCategories,
} from "../constants/rubricContents";
import Tag from "../ui/rubric/Tag";
import RubricGrid from "../ui/rubric/RubricGrid";
import {
  ScoringMetric,
  ScoringRecord,
  TeamFeedback,
} from "@/components/companion/productX/types";
import RubricComments from "../ui/rubric/RubricComments";
import { capitalizeTeamName } from "../../CompanionHome";

interface RubricProps {
  team_feedback: TeamFeedback; // should be near-native output of endpoint
  team_status: string;
  showRubric: (arg0: boolean) => void;
}

const Rubric: React.FC<RubricProps> = ({
  team_feedback,
  team_status,
  showRubric,
}) => {
  const [modal, setModal] = useState(false);
  const [scoring, setScoring] = useState<ScoringRecord>(
    team_feedback.scores || initScore,
  );
  const [comments, setComments] = useState<{ [key: string]: string }>(
    team_feedback.feedback || {},
  );

  const metrics = Object.keys(scoring) as ScoringMetric[];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []); // disabled scroll when rubric is overlayed

  const confirmExit = () => {
    if (JSON.stringify(scoring) !== JSON.stringify(team_feedback.scores)) {
      setModal(true);
    } else {
      showRubric(false);
    }
  }; // confirm exit if there are unsaved changes

  return (
    <>
      <div className="top-0 left-0 w-screen h-screen scroll overflow-y-auto fixed z-30 bg-[#020319] flex flex-col items-center px-14">
        <div className="w-full flex flex-row justify-between mt-36">
          <div className="flex flex-col gap-1">
            <div className="flex flex-row gap-5 items-center">
              <header className="text-xl">
                {team_feedback.round}:{" "}
                {capitalizeTeamName(team_feedback.teamName)}
              </header>

              {/* Tags */}
              <Tag flag={isGraded(scoring)} />
            </div>
            <span className="text-sm text-[#898BC3]">
              Judge: {team_feedback.judgeName}
            </span>
          </div>

          <div className="flex flex-row gap-3 items-center text-[#898BC3]">
            <span>{team_status}</span>
            <span>|</span>
            <span
              className="underline cursor-pointer z-50"
              onClick={() => {
                confirmExit();
              }}
            >
              Return to Home
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-[#41437D] mt-3">&nbsp;</div>

        {/* Grid */}
        <RubricGrid
          scoring={scoring}
          setScoring={setScoring}
          editable={false}
          idx={1}
        />

        {/* Comments */}
        <RubricComments feedback={comments} setFeedback={setComments} />

        {/* Submission */}
        <div className="w-full flex flex-row items-center justify-between mb-56 mt-12">
          <div className="flex flex-col text-[#898BC3] gap-2">
            <span className="text-lg text-white">
              TOTAL SCORE:&nbsp;
              {metrics.every((metric) => scoring[metric] !== undefined)
                ? metrics.reduce((total, metric) => total + scoring[metric], 0)
                : "N/A"}
            </span>
            {metrics.map((metric) => (
              <span
                key={metric}
              >{`${mapMetricsToCategories[metric]}: ${scoring[metric] || "N/A"}`}</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Rubric;

// Untangling this shit
