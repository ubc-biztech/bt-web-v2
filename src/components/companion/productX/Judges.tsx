import React, { useState, useEffect } from "react";
import { HistoryIcon, PanelsTopLeft } from "lucide-react";
import History from "./judges/History";
import Rounds from "./judges/Rounds";
import { fetchBackend } from "@/lib/db";
import { useUserRegistration } from "@/pages/companion";
import DashboardLayout from "./ui/DashboardLayout";
import { TeamFeedback } from "./types";

const Judges: React.FC = () => {
    const [teams, setTeams] = useState<Record<string, TeamFeedback[]> | null>(null);

    const { userRegistration } = useUserRegistration();
    useEffect(() => {
        const fetchTeamsForJudge = async () => {
            try {
                const response = await fetchBackend({
                    endpoint: `/team/judge/feedback/${userRegistration?.id}`,
                    method: "GET",
                    authenticatedCall: false,
                });

                console.log(response);

                if (response && response.scores) {
                    setTeams(response.scores);
                }
            } catch (error) {
                console.error("Error fetching teams for judge:", error);
            }
        };

        if (userRegistration?.id) {
            fetchTeamsForJudge();
        }
    }, [userRegistration?.id]);

    const pages = [
        {
            name: "Rounds",
            icon: PanelsTopLeft,
            component: <Rounds records={teams} />,
        },
        {
            name: "History",
            icon: HistoryIcon,
            component: <History records={teams} />,
        },
    ];

    return <DashboardLayout title="JUDGING DASHBOARD" pages={pages} />;
};

export default Judges;
