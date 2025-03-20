import Box from "../ui/rubric/RubricCell";
import Rubric from "./Rubric";
import { useState } from "react";
import FadeWrapper from "../ui/FadeAnimationWrapper";
import ProjectRow from "../ui/ProjectRow";
import { TeamFeedback } from "../types";

interface ScoresProps {
    teamName: string;
    records: Record<string, TeamFeedback[]> | null;
}

const Scores: React.FC<ScoresProps> = ({ teamName, records }) => {
    if (!records) {
        return <div>Loading...</div>;
    }

    const flat_records = Object.values(records).flat()

    const [team_feedback, setTeamFeedback] = useState<TeamFeedback>(flat_records[0]);
    const [showRubric, setShowRubric] = useState(false);
    const [Round, setRound] = useState("");

    return (
        <>
            <FadeWrapper className="flex flex-row mt-10 gap-8">
                <div className="w-full flex flex-col gap-5">
                    {Object.keys(records).map((round: string, index) => {
                        const reports = records[round];
                        return (
                            <>
                                <div className="flex flex-row gap-5">
                                    <span
                                        className={`w-full text-md text-white`}
                                    >
                                        ROUND {round}
                                    </span>
                                    <div className="w-64 text-md"> JUDGES </div>
                                </div>

                                <div className="flex flex-row gap-5">
                                    <ProjectRow
                                        key={index}
                                        team_name={teamName}
                                        team_status={`${reports.length} GRADING ENTRIES`}
                                        read_only={true}
                                        onClick={() => {
                                            setShowRubric(true);
                                            setTeamFeedback(reports[0]);
                                            setRound(round);
                                        }}
                                    />
                                    <div className="w-64 h-32">
                                        <Box
                                            innerShadow={20}
                                            className={`flex flex-col justify-center pl-5`}
                                        >
                                            <ul className="text-[#898BC3]">
                                                {reports.map(
                                                    (report, index) => {
                                                        return (
                                                            <li key={index}>
                                                                {report.judgeID}
                                                            </li>
                                                        );
                                                    }
                                                )}
                                            </ul>
                                        </Box>
                                    </div>
                                </div>
                            </>
                        );
                    })}
                </div>
            </FadeWrapper>
            {showRubric && (
                <Rubric
                    team_feedback={team_feedback}
                    team_status={`ROUND ${Round}`}
                    showRubric={setShowRubric}
                />
            )}
        </>
    );
};

export default Scores;
