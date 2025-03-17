import React, { useState } from "react";
import { BadgeCheck, PanelsTopLeft } from "lucide-react";
import Dashboard from "./user/Dashboard";
import Scores from "./user/Scores";

// TODO : replace this with actual data from api req {team/feedback/{teamID}}
const sampleTeamsFeedbackScore = {
    message: "Scores retrieved successfully",
    scores: {
        "1": [
            {
                judgeID: "judge123",
                scores: {
                    metric1: { N: "4" },
                    metric2: { N: "3" },
                    metric3: { N: "5" },
                    metric4: { N: "4" },
                    metric5: { N: "3" },
                },
                feedback:
                    "Great performance, but could improve the presentation.",
                createdAt: "2024-03-17T10:30:00Z",
            },
            {
                judgeID: "judge456",
                scores: {
                    metric1: { N: "5" },
                    metric2: { N: "4" },
                    metric3: { N: "4" },
                    metric4: { N: "5" },
                    metric5: { N: "4" },
                },
                feedback: "Excellent presentation, loved the innovation!",
                createdAt: "2024-03-17T11:00:00Z",
            },
        ],
        "2": [
            {
                judgeID: "judge789",
                scores: {
                    metric1: { N: "3" },
                    metric2: { N: "4" },
                    metric3: { N: "4" },
                    metric4: { N: "3" },
                    metric5: { N: "4" },
                },
                feedback:
                    "Good, but the technical execution could be improved.",
                createdAt: "2024-03-18T10:30:00Z",
            },
        ],
    },
};

interface UserProps {
    teamID: string;
}

const User: React.FC<UserProps> = ({ teamID }) => {
    const [page, setPage] = useState("dashboard");

    // TODO : Fetch team's feedback {team/feedback/{teamID}} and basic team information
    const teamName = "Team 4";

    return (
        <div className="w-full px-10">
            <div className="flex flex-col">
                <header className="mt-16 text-lg font-ibm">
                    {teamName} - OVERVIEW
                </header>
                <div className="border-b-2 border-[#41437D] mt-6 flex flex-row">
                    <div
                        className={`w-24 h-10 border-b-2 ${
                            page === "dashboard"
                                ? "border-[#4CC8BD] text-[#4CC8BD]"
                                : "border-[#41437D] text-[#41437D]"
                        } -mb-[2px] flex flex-row items-center justify-center gap-1 cursor-pointer`}
                        onClick={() => {
                            setPage("dashboard");
                        }}
                    >
                        <PanelsTopLeft
                            size={16}
                            color={page === "dashboard" ? "#4CC8BD" : "#41437D"}
                        />
                        Dashboard
                    </div>
                    <div
                        className={`w-24 h-10 border-b-2 ${
                            page === "scores"
                                ? "border-[#4CC8BD] text-[#4CC8BD]"
                                : "border-[#41437D] text-[#41437D]"
                        } -mb-[2px] flex flex-row items-center justify-center gap-1 cursor-pointer`}
                        onClick={() => setPage("scores")}
                    >
                        <BadgeCheck
                            size={16}
                            color={page === "scores" ? "#4CC8BD" : "#41437D"}
                        />
                        Scores
                    </div>
                </div>

                {/* Conditionally render pages */}

                {page === "dashboard" && (
                    <Dashboard
                        projectName={"Product X"}
                        teamMember1={"Team Member 1"}
                        teamMember2={"Team Member 2"}
                        teamMember3={"Team Member 3"}
                        teamMember4={"Team Member 4"}
                        feedback={sampleTeamsFeedbackScore.scores}
                    /> // TODO : pass actual data
                )}
                {page === "scores" && (
                    <Scores teamName={"Team 4"} feedback={sampleTeamsFeedbackScore.scores} />
                )}
            </div>
        </div>
    );
};

export default User;
