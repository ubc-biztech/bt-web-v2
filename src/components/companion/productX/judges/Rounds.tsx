import Box from "@/components/ui/productX/box";
import Button from "@/components/ui/productX/button";
import { ArrowUpRight, Pen } from "lucide-react";
import Rubric from "./Rubric";
import CornerBorderWrapper from "@/components/ui/productX/corner-box";
import { useEffect, useState } from "react";
import FadeWrapper from "@/components/ui/productX/fade-up-wrapper";
import BizBot from '@/assets/2025/productx/bizbotxx.png';
import Image from 'next/image';

interface ProjectBoxProps {
    team: string;
    date: string;
    presenting: boolean;
    showRubric: (arg0: boolean) => void;
    setSelectedTeam: (arg0: any) => void;
}

const ProjectBox: React.FC<ProjectBoxProps> = ({
    team,
    date,
    presenting,
    showRubric,
    setSelectedTeam
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
                    <header className="text-md">{team}</header>
                    <span className="text-sm text-[#898BC3]">{date}</span>
                </div>
                <Button
                    label={presenting ? "BEGIN JUDGING" : "EDIT SCORE"}
                    Icon={presenting ? ArrowUpRight : Pen}
                    className={`hover:bg-[#FFFFFF] hover:text-[#000000] bg-[#41437D] text-[#FFFFFF] w-56 h-14 mr-10`}
                    onClick={() => {
                        console.log("click");
                        showRubric(true);
                        setSelectedTeam({ team, date });
                    }}
                />
            </Box>
        </div>
    );
};

interface RoundsProps {
    data: any[];
}

const rounds = [
    {
        name: "ROUND 1",
        selected: true,
    },
    {
        name: "ROUND 2",
        selected: false,
    },
    {
        name: "ROUND 3",
        selected: false,
    },
];

const Rounds: React.FC<RoundsProps> = ({ data }) => {
    const [currentRound, setCurrentRound] = useState(rounds[0]);
    const [showRubric, setShowRubric] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState({ team: '', date: '' });
    const [noData, setNoData] = useState(data.length===0);

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
                {noData &&
                <div className="flex flex-col items-center justify-center w-full min-h-[600px] border-2 border-dashed border-[#41437D] p-8">
                <div className=" relative w-[70%] h-[70%]">
                  <Image
                    src={BizBot} 
                    alt="BizBot" 
                    className="object-contain"
                    fill
                  />
                </div>
                <header className="text-lg font-ibm">
                  NO ENTRIES FOUND
                </header>
                <span className="pt-2 text-[#656795] text-center max-w-[600px] text-sm">
                  "When a team begins their presentation for this round, you'll see an option to begin scoring their project."
                </span>
              </div>
                }
                {!noData &&
                <div className="w-full flex flex-col gap-5">
                    {data.map(
                        (team, index) =>
                            team.status === "current" && (
                                <ProjectBox
                                    key={index}
                                    team={team.team}
                                    date={"CURRENTLY PRESENTING • " + team.room}
                                    presenting={team.status === "current"}
                                    showRubric={setShowRubric}
                                    setSelectedTeam={setSelectedTeam}
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
                                    team={team.team}
                                    date={"CURRENTLY PRESENTING • " + team.room}
                                    presenting={team.status === "current"}
                                    showRubric={setShowRubric}
                                    setSelectedTeam={setSelectedTeam}
                                />
                            )
                    )}
                </div>
                }
            </FadeWrapper>
            {showRubric && (
                <Rubric
                    round={currentRound.name}
                    team={selectedTeam.team}
                    gradedStatus="Graded"
                    lastEdited="Last Edited: 3:41 PM"
                    grades={[]}
                    showRubric={setShowRubric}
                />
            )}
        </>
    );
};

export default Rounds;
