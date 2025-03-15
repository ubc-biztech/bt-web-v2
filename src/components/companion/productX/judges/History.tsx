import Box from "@/components/ui/productX/box";
import Button from "@/components/ui/productX/button";
import FadeWrapper from "@/components/ui/productX/fade-up-wrapper";
import { Pen } from "lucide-react";
import Rubric from "./Rubric";
import { useState } from "react";
import { date } from "zod";
import { set } from "lodash";

interface ProjectBoxProps {
    team: string;
    date: string;
    round: string;
    setTeamData: (arg0: any) => void;
    showRubric: (arg0: boolean) => void;
}

const ProjectBox: React.FC<ProjectBoxProps> = ({
    team,
    date,
    round,
    setTeamData,
    showRubric
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
                        <header className="text-md">{team}</header>
                        <span className="text-sm text-[#898BC3]">{date}</span>
                    </div>

                    <Button
                        label="EDIT SCORE"
                        Icon={Pen}
                        className={`hover:bg-[#FFFFFF] hover:text-[#000000] bg-[#41437D] text-[#FFFFFF] w-56 h-10 mt-5`}
                        onClick={() => {setTeamData({ team: team, date: date, round: round }); showRubric(true);}}
                    />
                </Box>
            </div>
        </>
    );
};

interface HistoryProps {
    data: any[];
}

const History: React.FC<HistoryProps> = ({ data }) => {
    const [TeamData, setTeamData] = useState({ team: "", date: "", round: "" });
    const [showRubric, setShowRubric] = useState(false);
    const judge_day = "MAR 7 ";

    return (
        <>
            <FadeWrapper className="flex flex-col">
                <header className="mt-16 text-lg font-ibm">ROUND 1</header>
                <div className="grid grid-cols-4 gap-5 mt-10">
                    {data.map(
                        (team, index) =>
                            (team.status === "completed" ||
                                team.status === "updated") && (
                                <div key={index}>
                                    <ProjectBox
                                        team={team.team}
                                        date={
                                            (team.status === "completed"
                                                ? "COMPLETED "
                                                : "LAST UPDATED ") +
                                            judge_day +
                                            team.date +
                                            " • " +
                                            team.room
                                        }
                                        round={"ROUND 1"}
                                        setTeamData={setTeamData}
                                        showRubric={setShowRubric}
                                    />
                                </div>
                            )
                    )}
                </div>
                <header className="mt-16 text-lg font-ibm">ROUND 2</header>
                <div className="grid grid-cols-4 gap-5 mt-10">
                    {data.map(
                        (team, index) =>
                            team.finalist === true && (
                                <div key={index}>
                                    <ProjectBox
                                        team={team.team}
                                        date={
                                            (team.status === "completed"
                                                ? "COMPLETED "
                                                : "LAST UPDATED ") +
                                            judge_day +
                                            team.date +
                                            " • " +
                                            team.room
                                        }
                                        round={"ROUND 2"}
                                        setTeamData={setTeamData}
                                        showRubric={setShowRubric}
                                    />
                                </div>
                            )
                    )}
                </div>
            </FadeWrapper>
            {showRubric && (
                <Rubric
                    round={TeamData.round}
                    team={TeamData.team}
                    lastEdited={TeamData.date}
                    gradedStatus="Graded"
                    grades={[]}
                    showRubric={setShowRubric}
                />
            )}
        </>
    );
};

export default History;
