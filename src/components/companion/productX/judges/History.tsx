import FadeWrapper from "../ui/FadeAnimationWrapper";
import ProjectGrid from "../ui/ProjectGrid";
import Rubric from "./Rubric";
import { useState } from "react";
import { TeamFeedback } from "../types";
import { formatDate } from "../constants/formatDate";

interface HistoryProps {
    records: Record<string, TeamFeedback[]> | null;
}

const History: React.FC<HistoryProps> = ({ records }) => {
    if (!records) {
        console.log(records)
        return <div>Loading...</div>;
    }

    const [showRubric, setShowRubric] = useState(false);
    const [team_feedback, setTeamFeedback] = useState<TeamFeedback>(
        Object.values(records).flat()[0]
    );
    

    const isGraded = (grades: Record<string, { N: string }>) => {
        return Object.values(grades).every((grade) => Number(grade.N) !== 0);
    }; // expecting to deal with Nkeys

    return (
        <>
            <FadeWrapper className="flex flex-col">
                {Object.keys(records).map((round: string, index: number) => (
                    <>
                        <header className="mt-16 text-lg font-ibm">
                            ROUND {round}
                        </header>
                        <div className="grid grid-cols-4 gap-5 mt-10">
                            {records[round].map(
                                (team: TeamFeedback, index: number) => {
                                    return (
                                        <div key={index}>
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
                                }
                            )}
                        </div>
                    </>
                ))}
            </FadeWrapper>
            {showRubric && (
                <Rubric
                    team_feedback={team_feedback}
                    team_status={`COMPLETED ${formatDate(team_feedback.createdAt)}`}
                    showRubric={setShowRubric}
                />
            )}
        </>
    );
};

export default History;
