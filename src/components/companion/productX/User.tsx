import React, { useState, useEffect } from "react";
import { BadgeCheck, PanelsTopLeft } from "lucide-react";
import Dashboard from "./user/Dashboard";
import Scores from "./user/Scores";
import { fetchBackend } from "@/lib/db";
import { useUserRegistration } from "@/pages/companion";
import { TeamFeedback } from "./types";
import { UserDashboardLayout } from "./ui/UserDashboardLayout";
import { capitalizeTeamName } from "../CompanionHome";

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
  const [teamMemberNames, setTeamMemberNames] = useState<string[]>([]);
  const [team_feedback, setTeamFeedback] = useState<Record<string, TeamFeedback[]> | null>(null);
  const [eventID, year] = userRegistration?.["eventID;year"].split(";");

  useEffect(() => {
    const fetchTeamFeedback = async () => {
      try {
        const response = await fetchBackend({
          endpoint: `/team/feedback/${teamID}`,
          method: "GET",
          authenticatedCall: false
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
        const response = await fetchBackend({
          endpoint: `/team/getTeamFromUserID`,
          method: "POST",
          data: {
            user_id: userRegistration?.id,
            eventID: eventID,
            year: +year
          },
          authenticatedCall: false
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

  useEffect(() => {
    const fetchMemberNames = async () => {
      if (!team_info?.memberIDs?.length) return;

      const memberNames: string[] = [];

      for (const memberID of team_info.memberIDs) {
        try {
          const response = await fetchBackend({
            endpoint: `/registrations/?email=${memberID}&eventID=${eventID}&year=${year}`,
            method: "GET",
            authenticatedCall: false
          });

          if (response.data) {
            const user = response.data[0];
            const fullName = `${user.basicInformation.fname} ${user.basicInformation.lname}`;
            memberNames.push(fullName);
          }
        } catch (error) {
          console.error(`Error fetching user ${memberID}:`, error);
        }
      }

      setTeamMemberNames(memberNames);
    };

    if (team_info?.memberIDs) {
      fetchMemberNames();
    }
  }, [team_info]);

  const teamName = team_info?.teamName;
  const flattened_team_feedback = team_feedback && Object.values(team_feedback).flat();
  const hasFeedback = !!flattened_team_feedback?.length;
  const comments = flattened_team_feedback?.flatMap(({ judgeName, feedback }) =>
    Object.entries(feedback).map(([category, message]) => ({
      judgeName,
      category,
      message
    }))
  );
  const pages = [
    {
      name: "Dashboard",
      icon: PanelsTopLeft,
      component: hasFeedback ? (
        <Dashboard
          team_name={teamName || ""}
          members={teamMemberNames}
          flat_records={flattened_team_feedback}
          comments={comments || []}
        />
      ) : (
        <div className="p-4 text-center text-gray-500">
          No feedback given yet.
        </div>
      )
    },
    {
      name: "Scores",
      icon: BadgeCheck,
      component: hasFeedback ? (
        <Scores teamName={teamName || ""} records={team_feedback} />
      ) : (
        <div className="p-4 text-center text-gray-500">
          No feedback given yet.
        </div>
      )
    }
  ];

  return <UserDashboardLayout title={`${capitalizeTeamName(teamName || '')} - OVERVIEW`} pages={pages} />;
};

export default User;
