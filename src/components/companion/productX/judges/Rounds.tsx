import Box from "@/components/ui/productX/box";
import Button from "@/components/ui/productX/button";
import { ArrowUpRight, Pen } from "lucide-react";
import Rubric from "./Rubric";
import CornerBorderWrapper from "@/components/ui/productX/corner-box";
import { useEffect, useState } from "react";
import FadeWrapper from "@/components/ui/productX/fade-up-wrapper";

interface ProjectBoxProps {
    res: {
        team: string;
        date: string;
        round: string;
        grades: any;
        comments: any;
    };
    presenting: boolean;
    showRubric: (arg0: boolean) => void;
    setSelectedTeam: (arg0: any) => void;
}

const ProjectBox: React.FC<ProjectBoxProps> = ({
    res,
    presenting,
    showRubric,
    setSelectedTeam,
}) => {
    return (
        <div className="w-full h-32">
            <Box
                width={100}
                height={20}
                fitToParent={true}
                className={`flex flex-row justify-between items-center pl-5`}
            >
                <div className="flex flex-col gap-2">
                    <header className="text-md">{res.team}</header>
                    <span className="text-sm text-[#898BC3]">{res.date}</span>
                </div>
                <Button
                    label={presenting ? "BEGIN JUDGING" : "EDIT SCORE"}
                    Icon={presenting ? ArrowUpRight : Pen}
                    className={`hover:bg-[#FFFFFF] hover:text-[#000000] bg-[#41437D] text-[#FFFFFF] w-56 h-14 mr-10`}
                    onClick={() => {
                        console.log("click");
                        showRubric(true);
                        setSelectedTeam(res);
                    }}
                />
            </Box>
        </div>
    );
};

interface RoundsProps {
    data: any[];
    rounds: any[];
}

const Rounds: React.FC<RoundsProps> = ({ data, rounds }) => {
    const [currentRound, setCurrentRound] = useState(rounds[0]);
    const [showRubric, setShowRubric] = useState(false);
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

    useEffect(() => {
        setCurrentRound(rounds.filter((round) => round.selected)[0]);
    }, []);

    return (
        <>
            <FadeWrapper className="flex flex-row mt-10 gap-8">
                <div className="w-36 flex flex-col gap-5">
                    {rounds.map((round, index) => (
                        <CornerBorderWrapper
                            selected={round.selected}
                            key={index}
                        >
                            <div
                                className="w-36 h-16 flex flex-row items-center justify-center"
                                style={{
                                    boxShadow: `inset 0 0 36px rgba(39, 40, 76, 1)`,
                                }}
                            >
                                <span
                                    className={`text-md ${
                                        round.selected
                                            ? "text-white"
                                            : "text-[#656795]"
                                    }`}
                                >
                                    {round.name}
                                </span>
                            </div>
                        </CornerBorderWrapper>
                    ))}
                </div>
                <div className="w-full flex flex-col gap-5">
                    {data.map(
                        (team, index) =>
                            team.status === "current" && (
                                <ProjectBox
                                    key={index}
                                    res={{
                                        team: team.team,
                                        date:
                                            "CURRENTLY PRESENTING • " +
                                            team.room,
                                        round: currentRound.name,
                                        grades: team.grades,
                                        comments: team.comments,
                                    }}
                                    presenting={team.status === "current"}
                                    showRubric={setShowRubric}
                                    setSelectedTeam={setTeamData}
                                />
                            )
                    )}

                    <div className="my-4 text-[#3D3E63] flex flex-row items-center">
                        <span>RECENT HISTORY</span>
                        <figure className="ml-2 w-56 h-[1px] bg-[#3D3E63]" />
                    </div>

                    {data.map(
                        (team, index) =>
                            team.status != "current" && (
                                <ProjectBox
                                    key={index}
                                    res={{
                                        team: team.team,
                                        date: team.date + " • " + team.room,
                                        round: currentRound.name,
                                        grades: team.grades,
                                        comments: team.comments,
                                    }}
                                    presenting={team.status === "current"}
                                    showRubric={setShowRubric}
                                    setSelectedTeam={setTeamData}
                                />
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
                    grades={TeamData.grades}
                    showRubric={setShowRubric}
                />
            )}
        </>
    );
};

export default Rounds;
