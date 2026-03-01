import FadeWrapper from "../ui/FadeAnimationWrapper";
import ProjectGrid from "../ui/ProjectGrid";
import Rubric from "./Rubric";
import { Fragment, useState } from "react";
import { TeamFeedback } from "../types";
import { formatDate } from "../constants/formatDate";

interface HistoryProps {
  records: Record<string, TeamFeedback[]> | null;
}

const History: React.FC<HistoryProps> = ({ records }) => {
  const [showRubric, setShowRubric] = useState(false);
  const [team_feedback, setTeamFeedback] = useState<TeamFeedback>(
    records
      ? Object.values(records).flat()[0]
      : {
          round: "none",
          judgeID: "loading",
          judgeName: "string",
          scores: {
            metric1: 0,
            metric2: 0,
            metric3: 0,
            metric4: 0,
            metric5: 0,
          },
          feedback: {},
          teamID: "loading",
          teamName: "loading",
          createdAt: "",
        },
  );

  if (!records) {
    console.log(records);
    return <div>Loading...</div>;
  } // expecting to deal with Nkeys

  return (
    <>
      <FadeWrapper className="flex flex-col">
        {Object.keys(records).map((round: string) => (
          <Fragment key={round}>
            <header className="mt-16 text-lg font-ibm">ROUND {round}</header>
            <div className="grid grid-cols-4 gap-5 mt-10">
              {records[round].map((team: TeamFeedback) => {
                return (
                  <div key={team.teamID}>
                    <ProjectGrid
                      team_name={team.teamName}
                      team_status={`COMPLETED ${formatDate(team.createdAt)}`}
                      onClick={() => {
                        setShowRubric(true);
                        setTeamFeedback(team);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </Fragment>
        ))}
      </FadeWrapper>
      {showRubric && (
        <Rubric
          team_feedback={team_feedback}
          team_status={`COMPLETED ${formatDate(team_feedback.createdAt)}`}
          showRubric={setShowRubric}
          createOrUpdateFlag={false}
        />
      )}
    </>
  );
};

export default History;
