import Box from "../ui/rubric/RubricCell";
import Rubric from "./Rubric";
import { useState } from "react";
import React from "react";
import FadeWrapper from "../ui/FadeAnimationWrapper";
import ProjectRow from "../ui/ProjectRow";
import { TeamFeedback } from "../types";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface ScoresProps {
  teamName: string;
  records: Record<string, TeamFeedback[]> | null;
}

const Scores: React.FC<ScoresProps> = ({ teamName, records }) => {
  const [selectedJudges, setSelectedJudges] = useState<Record<string, string>>({});
  const [team_feedback, setTeamFeedback] = useState<TeamFeedback>(
    records
      ? Object.values(records).flat()[0]
      : {
          round: "none",
          judgeID: "loading",
          judgeName: "string",
          scores: { metric1: 0, metric2: 0, metric3: 0, metric4: 0, metric5: 0 },
          feedback: {},
          teamID: "loading",
          teamName: "loading",
          createdAt: ""
        }
  );
  const [showRubric, setShowRubric] = useState(false);
  const [Round, setRound] = useState("");

  if (!records) {
    return <div>Loading...</div>;
  }

  const flat_records = Object.values(records).flat();

  return (
    <>
      <FadeWrapper className='flex flex-row mt-10 gap-8'>
        <div className='w-full flex flex-col gap-5'>
          {Object.keys(records).map((round: string, index) => {
            const reports = records[round];
            const selectedJudgeName = selectedJudges[round];

            const selectedReport = reports.find((report) => report.judgeName === selectedJudgeName) || reports[0]; // default to first

            return (
              <React.Fragment key={round}>
                <div className='flex flex-row gap-5'>
                  <span className='w-full text-md text-white'>ROUND {round}</span>
                  <div className='w-64 text-md'>JUDGES</div>
                </div>

                <div className='flex flex-row gap-5'>
                  <ProjectRow
                    team_name={teamName}
                    round={selectedReport.round}
                    team_status={`${reports.length} GRADING ENTRIES`}
                    read_only={true}
                    onClick={() => {
                      setShowRubric(true);
                      setTeamFeedback(selectedReport); // use selected judge's report
                      setRound(round);
                    }}
                  />
                  <div className='w-64 h-32'>
                    <Box innerShadow={20} className='flex flex-col justify-center pl-5'>
                      <Select // TODO: make this select component nicer
                        onValueChange={(val) => setSelectedJudges((prev) => ({ ...prev, [round]: val }))}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select Judge' />
                        </SelectTrigger>
                        <SelectContent>
                          {reports.map((report, i) => (
                            <SelectItem key={i} value={report.judgeName}>
                              {report.judgeName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Box>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </FadeWrapper>
      {showRubric && <Rubric team_feedback={team_feedback} team_status={`ROUND ${Round}`} showRubric={setShowRubric} />}
    </>
  );
};

export default Scores;
