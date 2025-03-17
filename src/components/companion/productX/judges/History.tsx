import Box from "@/components/ui/productX/box";
import Button from "@/components/ui/productX/button";
import FadeWrapper from "@/components/ui/productX/fade-up-wrapper";
import { Pen } from "lucide-react";
import Rubric from "./Rubric";
import { useState } from "react";

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
                        <span className="text-sm text-[#898BC3]">{res.date}</span>
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
    data: any[];
    rounds: any[];
}

const History: React.FC<HistoryProps> = ({ data, rounds }) => {
    const [TeamData, setTeamData] = useState({
        team: "",
        date: "",
        round: "",
        grades: {
            TECHNICALITY: 0,
            BUSINESS: 0,
            "DESIGN + UX": 0,
            PRESENTATION: 0,
        },
        comments: {},
    });
    const [showRubric, setShowRubric] = useState(false);
    const judge_day = "MAR 7 ";

    return (
        <>
            <FadeWrapper className="flex flex-col">
                {rounds.map((round, index) => (
                    <>
                        <header className="mt-16 text-lg font-ibm">
                            {round.name}
                        </header>
                        <div className="grid grid-cols-4 gap-5 mt-10">
                            {data.map(
                                (team, index) =>
                                    !(
                                        round.filterFinalists && !team.finalist
                                    ) && (
                                        <div key={index}>
                                            <ProjectBox
                                                res={{
                                                    team: team.team,
                                                    date: (team.status === "completed"
                                                        ? "COMPLETED "
                                                        : "LAST UPDATED ") +
                                                    judge_day +
                                                    team.date +
                                                    " • " +
                                                    team.room,
                                                    round: round.name,
                                                    grades: team.grades,
                                                    comments: team.comments,
                                                }}
                                                setTeamData={setTeamData}
                                                showRubric={setShowRubric}
                                            />
                                        </div>
                                    )
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
                    gradedStatus="Graded"
                    grades={TeamData.grades}
                    showRubric={setShowRubric}
                />
            )}
        </>
    );
};

export default History;
