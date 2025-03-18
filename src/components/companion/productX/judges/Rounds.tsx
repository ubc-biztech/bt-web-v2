import Box from "@/components/ui/productX/box";
import Button from "@/components/ui/productX/button";
import { ArrowUpRight, Pen } from "lucide-react";
import Rubric from "./Rubric";
import CornerBorderWrapper from "@/components/ui/productX/corner-box";
import { useEffect, useState } from "react";
import FadeWrapper from "@/components/ui/productX/fade-up-wrapper";
import BizBot from "@/assets/2025/productx/bizbotxx.png";
import Image from "next/image";
import { defaultScoring, mapGrades } from "@/constants/productx-scoringMetrics";
import { fetchBackend } from "@/lib/db";
import { useUserRegistration } from "@/pages/companion";

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

const Rounds: React.FC<RoundsProps> = ({ feedback }) => {
    const [currentRound, setCurrentRound] = useState(
        Math.max(...Object.keys(feedback).map((key) => parseInt(key, 10)))
    ); //may not be true
    const [showRubric, setShowRubric] = useState(false);
    const [TeamData, setTeamData] = useState({
        team: "",
        date: "",
        round: "",
        grades: defaultScoring,
        comments: [],
    });

    const [noData, setNoData] = useState(false);
    const [currentTeam, setCurrentTeam] = useState(null);
    const { userRegistration } = useUserRegistration();

    useEffect(() => {
        setCurrentRound(
            Math.max(...Object.keys(feedback).map((key) => parseInt(key, 10)))
        );
    }, [feedback]);


    useEffect(() => {
        const fetchCurrentTeam = async () => {
            try {
                const response = await fetchBackend({
                    endpoint: `/team/judge/currentTeamID/${userRegistration?.id}`,
                    method: "GET",
                    authenticatedCall: false
                });
                

                if (response?.currentTeamName) {
                    setCurrentTeam(response.currentTeamName);
                }
            } catch (error) {
                console.error("Error fetching current team:", error);
            }
        };

        if (userRegistration?.id) {
            fetchCurrentTeam();
        }
    }, [userRegistration?.id]);

    const isGraded = (grades: Record<string, { N: string }>) => {
        return Object.values(grades).every((grade) => Number(grade.N) !== 0);
    }; // expecting to deal with Nkeys

    return (
        <>
            <FadeWrapper className="flex flex-row mt-10 gap-8">
                <div className="w-36 flex flex-col gap-5">
                    {Object.keys(feedback).map((round, index) => (
                        <CornerBorderWrapper
                            selected={
                                round === currentRound.toString()
                            }
                            key={index}
                        >
                            <div
                                className="w-36 h-16 flex flex-row items-center justify-center"
                                style={{
                                    boxShadow: `inset 0 0 36px rgba(39, 40, 76, 1)`,
                                }}
                            >
                                <span
                                    className={`text-md ${round ===
                                        currentRound.toString()
                                        ? "text-white"
                                        : "text-[#656795]"
                                        }`}
                                >
                                    ROUND {round}
                                    {feedback[round] === 2 && "(FINAL)"}
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
                            &quot;When a team begins their presentation for this round, you&apos;ll see an option to begin scoring their project.&quot;
                        </span>
                    </div>
                }
                {!noData &&
                    <div className="w-full flex flex-col gap-5">
                        {currentTeam && (
                            <ProjectBox
                                res={{
                                    team: currentTeam,
                                    date: `CURRENTLY PRESENTING`,
                                    round: `ROUND ${currentRound}`,
                                    grades: [],
                                    comments: [],
                                }}
                                presenting={true}
                                showRubric={setShowRubric}
                                setSelectedTeam={setTeamData}
                            />
                        )}

                        <div className="my-4 text-[#3D3E63] flex flex-row items-center">
                            <span>RECENT HISTORY</span>
                            <figure className="ml-2 w-56 h-[1px] bg-[#3D3E63]" />
                        </div>

                        {Object.keys(feedback).map(
                            (round: string, index: number) => {
                                return feedback[round].map(
                                    (team: Team, sIndex: number) => {
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

                                        const scored = Object.values(
                                            team.scores
                                        ).every(
                                            (score: Score) =>
                                                parseInt(score.N) != 0
                                        );

                                        if (scored) {
                                            return (
                                                <ProjectBox
                                                    key={index * 10 + sIndex}
                                                    res={{
                                                        team: team.teamName,
                                                        date: `COMPLETED ${formattedDateTime}`,
                                                        round: `ROUND ${currentRound}`,
                                                        grades: team.scores,
                                                        comments: Object.values(team.feedback || {}).join(", "),
                                                    }}
                                                    presenting={false}
                                                    showRubric={setShowRubric}
                                                    setSelectedTeam={setTeamData}
                                                />
                                            );
                                        }

                                        return null; // Return null if no JSX should be rendered
                                    }
                                );
                            }
                        )}
                    </div>
                }
            </FadeWrapper>
            {showRubric && (
                <Rubric
                    round={TeamData.round}
                    team={TeamData.team}
                    lastEdited={TeamData.date}
                    gradedStatus={isGraded(TeamData.grades) ? "Graded" : "Not Graded"}
                    grades={mapGrades(TeamData)}
                    comments={Array.isArray(TeamData.comments) ? TeamData.comments : [String(TeamData.comments)]}
                    showRubric={setShowRubric}
                />
            )}
        </>
    );
};

export default Rounds;