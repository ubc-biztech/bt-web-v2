import Box from "@/components/ui/productX/box";
import Button from "@/components/ui/productX/button";
import FadeWrapper from "@/components/ui/productX/fade-up-wrapper";
import { Pen } from "lucide-react";
import Rubric from "./Rubric";
import { useState } from "react";
import { defaultScoring } from "@/constants/productx-scoringMetrics";
import { mapGrades } from "@/constants/productx-scoringMetrics";

interface ProjectBoxProps {
    res: {
        team: string;
        date: string;
        round: string;
        grades: any;
        comments: any;
    };
    setTeamData: (arg0: any) => void;
    showRubric: (arg0: boolean) => void;
}

const ProjectBox: React.FC<ProjectBoxProps> = ({
    res,
    setTeamData,
    showRubric,
}) => {
    return (
        <>
            <div className="w-full h-48">
                <Box
                    width={100}
                    height={20}
                    fitToParent={true}
                    className={`flex flex-col justify-center pl-5`}
                >
                    <div className="flex flex-col gap-2">
                        <header className="text-md">{res.team}</header>
                        <span className="text-sm text-[#898BC3]">
                            {res.date}
                        </span>
                    </div>

                    <Button
                        label="EDIT SCORE"
                        Icon={Pen}
                        className={`hover:bg-[#FFFFFF] hover:text-[#000000] bg-[#41437D] text-[#FFFFFF] w-56 h-10 mt-5`}
                        onClick={() => {
                            setTeamData(res);
                            showRubric(true);
                        }}
                    />
                </Box>
            </div>
        </>
    );
};

interface HistoryProps {
    feedback: any;
}

type Score = { N: string };

type Team = {
    round: string;
    judgeID: string;
    scores: Record<string, Score>;
    teamName: string;
    feedback: string;
    createdAt: string;
};

const History: React.FC<HistoryProps> = ({ feedback }) => {
    const [TeamData, setTeamData] = useState({
        team: "",
        date: "",
        round: "",
        grades: defaultScoring,
        comments: [],
    });
    const [showRubric, setShowRubric] = useState(false);

    const isGraded = (grades: Record<string, { N: string }>) => {
        return Object.values(grades).every((grade) => Number(grade.N) !== 0);
    }; // expecting to deal with Nkeys

    return (
        <>
            <FadeWrapper className="flex flex-col">
                {Object.keys(feedback).map((round: string, index: number) => (
                    <>
                        <header className="mt-16 text-lg font-ibm">
                            ROUND {round}
                        </header>
                        <div className="grid grid-cols-4 gap-5 mt-10">
                            {feedback[round].map(
                                (team: Team, index: number) => {
                                    const date = new Date(team.createdAt);
                                    const formattedDateTime = `${date
                                        .toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                        .toUpperCase()} ${date.toLocaleTimeString(
                                        "en-US",
                                        {
                                            hour: "numeric",
                                            minute: "2-digit",
                                            hour12: true,
                                        }
                                    )}`;
                                    return (
                                        <div key={index}>
                                            <ProjectBox
                                                res={{
                                                    team: team.teamName,
                                                    date:
                                                        "LAST UPDATED: " +
                                                        formattedDateTime,
                                                    round: `ROUND ${round}`,
                                                    grades: team.scores,
                                                    comments: [team.feedback],
                                                }}
                                                setTeamData={setTeamData}
                                                showRubric={setShowRubric}
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
                    round={TeamData.round}
                    team={TeamData.team}
                    lastEdited={TeamData.date}
                    gradedStatus={
                        isGraded(TeamData.grades) ? "Graded" : "Ungraded"
                    }
                    grades={mapGrades(TeamData)}
                    comments={TeamData.comments}
                    showRubric={setShowRubric}
                />
            )}
        </>
    );
};

export default History;
