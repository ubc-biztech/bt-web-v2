import BarChart from "./BarChart";
import Box from "@/components/ui/productX/box";
import FadeWrapper from "@/components/ui/productX/fade-up-wrapper";
import { metricMapping } from "@/constants/productx-scoringMetrics";
import { User } from "lucide-react";
import { useEffect, useState } from "react";

interface FeedbackEntry {
    judgeID: string;
    scores: Record<string, number>;
    feedback: string;
    createdAt: string;
}

// helpers

const calculateAverageJudgeScore = (teamFeedback: FeedbackEntry[]) => {
    const totalScores = teamFeedback.reduce((sum, entry) => {
        const sumOfMetrics = Object.values(entry.scores).reduce(
            (metricSum, score) => metricSum + score,
            0
        );
        return sum + sumOfMetrics;
    }, 0);

    const totalJudges =
        teamFeedback.length;

    const averageScore = totalScores / totalJudges;

    return Math.round(averageScore); // round
};

const transformFeedbackToBarChartData = (independentEntries: FeedbackEntry[]) => {
    const transformedData = independentEntries.map((entry, index) => {
        const totalScore = Object.values(entry.scores).reduce(
            (sum, score) => sum + score,
            0
        );

        return {
            // TODO: Display Judge Name instead of ID
            label: entry.judgeID,
            value: totalScore,
        };
    });

    return transformedData;
};

const findBestMetric = (independentEntries: FeedbackEntry[]) => {
    const metricScores: Record<string, { totalScore: number; count: number }> = {};

    independentEntries.forEach(entry => {
        Object.entries(entry.scores).forEach(([metric, score]) => {
            const scoreValue = score;

            if (!metricScores[metric]) {
                metricScores[metric] = { totalScore: 0, count: 0 };
            }

            metricScores[metric].totalScore += scoreValue;
            metricScores[metric].count += 1;
        });
    });

    const metricAverages = Object.entries(metricScores).map(([metric, { totalScore, count }]) => ({
        metric,
        averageScore: totalScore / count,
    }));

    const bestMetric = metricAverages.reduce((best, current) =>
        current.averageScore > best.averageScore ? current : best
    );

    return bestMetric;
};


// dashboard

interface DashboardProps {
    projectName: string;
    teamMember1: string | null;
    teamMember2: string | null;
    teamMember3: string | null;
    teamMember4: string | null;
    feedback: Record<string, FeedbackEntry[]>;
}

const Dashboard: React.FC<DashboardProps> = ({
    projectName,
    teamMember1,
    teamMember2,
    teamMember3,
    teamMember4,
    feedback,
}) => {
    const [independentEntries, setIndependentEntries] = useState(
        Object.values(feedback).flat()
    );
    const comments = (
        independentEntries.map((entry) => {
            const feedbackEntry = entry as FeedbackEntry;
            return {
                judgeID: feedbackEntry.judgeID,
                feedback: feedbackEntry.feedback,
            };
        })
    );
    const bestArea = (metricMapping[findBestMetric(independentEntries).metric]);

    useEffect(() => {
        setIndependentEntries(
            Object.values(feedback).flat()
        );
    }, [feedback]);

    return (
        <FadeWrapper className="flex flex-col">
            <div className="w-full flex flex-row mt-5">
                <div className="w-1/3 h-full  flex flex-col text-[#ADAFE4]">
                    <header className="text-xl text-white">
                        {projectName}
                    </header>
                    <span>{teamMember1 && teamMember1}</span>
                    <span>{teamMember2 && teamMember2}</span>
                    <span>{teamMember3 && teamMember3}</span>
                    <span>{teamMember4 && teamMember4}</span>
                </div>
                <div className="w-2/3 h-full flex flex-col gap-2">
                    {/* AVERAGE JUDGE SCORE */}
                    <div className="flex flex-row h-44 gap-2">
                        <div className="w-1/3 h-full">
                            <Box
                                width={100}
                                height={50}
                                fitToParent
                                className="flex flex-col justify-center items-center"
                            >
                                <header className="text-[#4CC8BD] text-[5em] -mt-5">
                                    {calculateAverageJudgeScore(independentEntries)}/25
                                </header>
                                <span className="text-sm -mt-2">
                                    Raw Average Judge Score
                                </span>
                            </Box>
                        </div>
                        {/* BEST AREA */}
                        <div className="w-2/3 h-full">
                            <Box
                                width={100}
                                height={50}
                                fitToParent
                                className="flex flex-col justify-center items-start pl-16"
                            >
                                <div className="flex flex-col justify-center items-start">
                                    <span className="text-lg -mb-2">
                                        Best Area
                                    </span>
                                    <header className="text-[#BC88FF] text-[2em]">
                                        {bestArea}
                                    </header>
                                </div>
                            </Box>
                        </div>
                    </div>
                    <div className="flex flex-row h-72 gap-2">
                        {/* BAR CHART */}
                        <div className="w-1/2 h-full">
                            <Box
                                width={100}
                                height={50}
                                fitToParent
                                className="flex flex-col"
                            >
                                <span className="text-md text-white mt-4 ml-8 -mb-8">
                                    Scoring Distribution
                                </span>
                                <BarChart
                                    data={transformFeedbackToBarChartData(
                                        independentEntries)}
                                    height={300}
                                />
                            </Box>
                        </div>

                        {/* COMMENTS */}
                        <div className="w-1/2 h-full">
                            <Box
                                width={100}
                                height={50}
                                fitToParent
                                className="p-4 pl-8 text-[#898BC3] flex flex-col gap-4"
                            >
                                <span className="text-md text-white">
                                    Comments
                                </span>
                                {comments.slice(0, 3).map((comment, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col text-[12px]"
                                    >
                                        <div className="flex flex-row gap-1">
                                            <User size={20} />
                                            <header className="text-mb">
                                                {comment.judgeID}
                                            </header>
                                        </div>

                                        <span>{comment.feedback}</span>
                                    </div>
                                ))}
                            </Box>
                        </div>
                    </div>
                </div>
            </div>
        </FadeWrapper>
    );
};

export default Dashboard;
