import Box from "@/components/ui/productX/box";
import Button from "@/components/ui/productX/button";
import { ArrowUpRight, Pen } from "lucide-react";
import Rubric from "./Rubric";
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
}

const ProjectBox: React.FC<ProjectBoxProps> = ({
    res,
    presenting,
    showRubric,
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
                    label={"VIEW GRADING RUBRIC"}
                    Icon={ArrowUpRight}
                    className={`hover:bg-[#FFFFFF] hover:text-[#000000] bg-[#41437D] text-[#FFFFFF] w-56 h-14 mr-10`}
                    onClick={() => {
                        console.log("click");
                        showRubric(true);
                    }}
                />
            </Box>
        </div>
    );
};

interface ScoresProps {
    data: any[];
    rounds: any[];
}

const Scores: React.FC<ScoresProps> = ({ data, rounds }) => {
    const [showRubric, setShowRubric] = useState(false);

    return (
        <>
            <FadeWrapper className="flex flex-row mt-10 gap-8">
                <div className="w-full flex flex-col gap-5">
                    {rounds.map((round, index) => (
                        <>
                            <div className="flex flex-row gap-5">
                                <span className={`w-full text-md text-white`}>
                                    {round.name}
                                </span>
                                <div className="w-64 text-md"> JUDGES </div>
                            </div>

                            <div className="flex flex-row gap-5">
                                <ProjectBox
                                    key={index}
                                    res={{
                                        team: data[0].team,
                                        date:
                                            data[0].date + " • " + data[0].room,
                                        round: data[0].name,
                                        grades: data[0].grades,
                                        comments: data[0].comments,
                                    }}
                                    presenting={data[0].status === "current"}
                                    showRubric={setShowRubric}
                                />
                                <div className="w-64 h-32">
                                    <Box
                                        width={100}
                                        height={20}
                                        fitToParent={true}
                                        className={`flex flex-col justify-center pl-5`}
                                    >
                                        <ul className="text-[#898BC3]">
                                            <li>Firstname Lastname</li>
                                            <li>Firstname Lastname</li>
                                            <li>Firstname Lastname</li>
                                        </ul>
                                    </Box>
                                </div>
                            </div>
                        </>
                    ))}
                </div>
            </FadeWrapper>
            {showRubric && (
                <Rubric
                    round={data[0].round}
                    team={data[0].team}
                    lastEdited={data[0].date}
                    gradedStatus="Graded"
                    grades={data[0].grades}
                    showRubric={setShowRubric}
                />
            )}
        </>
    );
};

export default Scores;
