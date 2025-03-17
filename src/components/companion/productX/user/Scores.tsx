import Box from "@/components/ui/productX/box";
import Button from "@/components/ui/productX/button";
import { ArrowUpRight } from "lucide-react";
import Rubric from "./Rubric";
import { useState } from "react";
import FadeWrapper from "@/components/ui/productX/fade-up-wrapper";

interface Score {
    N: string;
}

interface FeedbackEntry {
    judgeID: string;
    scores: Record<string, Score>;
    feedback: string;
    createdAt: string;
}

interface ProjectBoxProps {
    res: {
        team: string;
        date: string;
        round: string;
        reports: FeedbackEntry[];
    };
    presenting: boolean;
    showRubric: (arg0: boolean) => void;
    setActiveReport: (arg0: FeedbackEntry[]) => void;
    setRound: (arg0: string) => void;
}

const ProjectBox: React.FC<ProjectBoxProps> = ({
    res,
    presenting,
    showRubric,
    setActiveReport,
    setRound
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
                        setActiveReport(res.reports);
                        showRubric(true);
                        setRound(res.round);
                    }}
                />
            </Box>
        </div>
    );
};

interface ScoresProps {
    teamName: string;
    feedback: Record<string, FeedbackEntry[]>;
}

const Scores: React.FC<ScoresProps> = ({ teamName, feedback }) => {
    const [activeReport, setActiveReport] = useState([] as FeedbackEntry[]);
    const [showRubric, setShowRubric] = useState(false);
    const [Round, setRound] = useState("");

    return (
        <>
            <FadeWrapper className="flex flex-row mt-10 gap-8">
                <div className="w-full flex flex-col gap-5">
                    {Object.keys(feedback).map((round, index) => {
                        const reports = feedback[round];
                        const date = new Date(reports[0].createdAt);
                        const formattedDateTime = `${date
                            .toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                            })
                            .toUpperCase()} ${date.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                        })}`;
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
                                    <ProjectBox
                                        key={index}
                                        res={{
                                            team: teamName,
                                            date: formattedDateTime,
                                            round: round,
                                            reports: reports,
                                        }}
                                        presenting={false}
                                        showRubric={setShowRubric}
                                        setActiveReport={setActiveReport}
                                        setRound={setRound}
                                    />
                                    <div className="w-64 h-32">
                                        <Box
                                            width={100}
                                            height={20}
                                            fitToParent={true}
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
                    teamName={teamName}
                    round={Round}
                    report={activeReport}
                    showRubric={setShowRubric}
                />
            )}
        </>
    );
};

export default Scores;
