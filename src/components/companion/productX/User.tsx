import React, { useState, useEffect } from "react";
import { BadgeCheck, PanelsTopLeft } from "lucide-react";
import Dashboard from "./user/Dashboard";
import Scores from "./user/Scores";
import { fetchBackend } from "@/lib/db";
import { useUserRegistration } from "@/pages/companion";
import DashboardLayout from "./ui/DashboardLayout";
import { TeamFeedback } from "./types";

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
    const { userRegistration } = useUserRegistration();
    const [team_info, setTeamInfo] = useState<TeamInfo | null>(null);
    const [team_feedback, setTeamFeedback] = useState<Record<
        string,
        TeamFeedback[]
    > | null>(null);

    useEffect(() => {
        const fetchTeamFeedback = async () => {
            try {
                const response = await fetchBackend({
                    endpoint: `/team/feedback/${teamID}`,
                    method: "GET",
                    authenticatedCall: false,
                });

                if (response?.scores) {
                    setTeamFeedback(response.scores);
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
                const [eventID, year] =
                    userRegistration?.["eventID;year"].split(";");
                const response = await fetchBackend({
                    endpoint: `/team/getTeamFromUserID`,
                    method: "POST",
                    data: {
                        user_id: userRegistration?.id,
                        eventID: eventID,
                        year: +year,
                    },
                    authenticatedCall: false,
                });

                if (response?.response) {
                    setTeamInfo(response.response);
                    localStorage.setItem(
                        "teamInfo",
                        JSON.stringify(response.response)
                    );
                }
            } catch (err) {
                console.error("Error fetching team:", err);
            }
        };

        if (teamID) {
            fetchTeam();
        }
    }, [teamID, userRegistration]);

    const teamName = team_info?.teamName;
    const teamMembers = team_info?.memberIDs || [];
    const flattened_team_feedback =
        team_feedback && Object.values(team_feedback).flat();
    const comments = flattened_team_feedback?.flatMap(({ judgeID, feedback }) =>
        Object.values(feedback).map((message) => ({
            judgeID,
            message,
        }))
    );
    const pages = [
        {
            name: "Dashboard",
            icon: PanelsTopLeft,
            component: (
                <Dashboard
                    team_name={teamName || ""}
                    members={teamMembers}
                    flat_records={flattened_team_feedback || []}
                    comments={comments || []}
                />
            ),
        },
        {
            name: "Scores",
            icon: BadgeCheck,
            component: <Scores teamName={teamName || ""} records={team_feedback} />,
        },
    ];

    return <DashboardLayout title={`${teamName} - OVERVIEW`} pages={pages} />;
};

export default User;
