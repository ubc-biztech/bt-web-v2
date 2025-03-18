import React, { useState, useEffect } from "react";
import { BadgeCheck, PanelsTopLeft } from "lucide-react";
import Dashboard from "./user/Dashboard";
import Scores from "./user/Scores";
import { fetchBackend } from "@/lib/db";
import { useUserRegistration } from "@/pages/companion";

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

interface TeamInfo {
    eventID: string;
    year: number;
    id: string;
    inventory: any[];
    memberIDs: string[];
    metadata: {
        points: number;
        pointsSpent: number;
    };
    scannedQRs: any[];
    submission: string;
    teamName: string;
    transactions: any[];
}

const User: React.FC<UserProps> = ({ teamID }) => {
    const [page, setPage] = useState("dashboard");
    const { userRegistration } = useUserRegistration();
    // TODO: Revisit and see if there is more optimized approach
    const [feedback, setFeedback] = useState(() => {
        return JSON.parse(localStorage.getItem("feedback") || "null");
    });
    const [teamInfo, setTeamInfo] = useState(() => {
        return JSON.parse(localStorage.getItem("teamInfo") || "null");
    });
    const teamMembers = teamInfo?.memberIDs || [];
    const [teamMember1, teamMember2, teamMember3, teamMember4] = [
        teamMembers[0] || null,
        teamMembers[1] || null,
        teamMembers[2] || null,
        teamMembers[3] || null
    ];


    useEffect(() => {
        const fetchTeamFeedback = async () => {
            try {
                const response = await fetchBackend({
                    endpoint: `/team/feedback/${teamID}`,
                    method: "GET",
                    authenticatedCall: false,
                });

                if (response?.scores) {
                    setFeedback(response.scores);
                    localStorage.setItem("feedback", JSON.stringify(response.scores));
                }
            } catch (err) {
                console.error("Error fetching team feedback:", err);
            }
        };

        if (teamID) {
            fetchTeamFeedback();
        }
    }, [teamID]);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const [eventID, year] = userRegistration?.["eventID;year"].split(";");
                const response = await fetchBackend({
                    endpoint: `/team/getTeamFromUserID`,
                    method: "POST",
                    data: { user_id: userRegistration?.id, eventID: eventID, year: +year },
                    authenticatedCall: false,
                });

                if (response?.response) {
                    setTeamInfo(response.response);
                    localStorage.setItem("teamInfo", JSON.stringify(response.response));
                }
            } catch (err) {
                console.error("Error fetching team:", err);
            }
        };

        if (teamID) {
            fetchTeam();
        }
    }, [teamID, userRegistration]);

    const teamName = teamInfo?.teamName;

    return (
        <div className="w-full px-10">
            <div className="flex flex-col">
                <header className="mt-16 text-lg font-ibm">
                    {teamName} - OVERVIEW
                </header>
                <div className="border-b-2 border-[#41437D] mt-6 flex flex-row">
                    <div
                        className={`w-24 h-10 border-b-2 ${page === "dashboard"
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
                        className={`w-24 h-10 border-b-2 ${page === "scores"
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
                        teamMember1={teamMember1}
                        teamMember2={teamMember2}
                        teamMember3={teamMember3}
                        teamMember4={teamMember4}
                        feedback={feedback}
                    />
                )}
                {page === "scores" && (
                    <Scores teamName={teamName} feedback={feedback} />
                )}
            </div>
        </div>
    );
};

export default User;
