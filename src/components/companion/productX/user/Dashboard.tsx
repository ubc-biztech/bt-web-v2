import BarChart from "./BarChart";
import Box from "@/components/ui/productX/box";
import FadeWrapper from "@/components/ui/productX/fade-up-wrapper";
import { User } from "lucide-react";
import { useState } from "react";

interface DashboardProps {
    data: any[];
    rounds: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ data, rounds }) => {
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
        comments: [
            {
                author: "FIRSTNAME LASTNAME",
                comment:
                    "Great presentation, well researched. Could use more work on the usability.",
            },
            {
                author: "FIRSTNAME LASTNAME",
                comment:
                    "Great presentation, well researched. Could use more work on the usability.",
            },
            {
                author: "FIRSTNAME LASTNAME",
                comment:
                    "Great presentation, well researched. Could use more work on the usability.",
            },
            {
                author: "FIRSTNAME LASTNAME",
                comment:
                    "Great presentation, well researched. Could use more work on the usability.",
            },
        ],
    });

    return (
        <FadeWrapper className="flex flex-col">
            <div className="w-full flex flex-row mt-5">
                <div className="w-1/3 h-full  flex flex-col text-[#ADAFE4]">
                    <header className="text-xl text-white">Project Name</header>
                    <span>Firstname Lastname</span>
                    <span>Firstname Lastname</span>
                    <span>Firstname Lastname</span>
                    <span>Firstname Lastname</span>
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
                                    83%
                                </header>
                                <span className="text-sm -mt-2">
                                    Average Judge Score (2 rounds)
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
                                    <span className="text-lg -mb-5 ml-2">
                                        Best Area
                                    </span>
                                    <header className="text-[#BC88FF] text-[4em]">
                                        CREATIVITY
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
                                <span className="text-md text-white mt-4 ml-8 -mb-8">Scoring Distribution</span>
                                <BarChart
                                    data={[
                                        { label: "1", value: 10 },
                                        { label: "2", value: 18 },
                                        { label: "3", value: 14 },
                                        { label: "4", value: 20 },
                                        { label: "5", value: 8 },
                                        { label: "6", value: 12 },
                                    ]}
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
                                <span className="text-md text-white">Comments</span>
                                {TeamData.comments
                                    .slice(0, 3)
                                    .map((comment, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col text-[12px]"
                                        >
                                            <div className="flex flex-row gap-1">
                                                <User size={20} />
                                                <header className="text-mb">
                                                    {comment.author}
                                                </header>
                                            </div>

                                            <span>{comment.comment}</span>
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
