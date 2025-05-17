import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { HistoryIcon, PanelsTopLeft } from "lucide-react";
import History from "./judges/History";
import Rounds from "./judges/Rounds";
import { fetchBackend } from "@/lib/db";
import { useUserRegistration } from "@/pages/companion";
import DashboardLayout from "./ui/DashboardLayout";
import { TeamFeedback } from "./types";

// Create a context for refreshing data
export const JudgesRefreshContext = createContext<{
  refreshTrigger: boolean;
  refreshData: () => Promise<void>;
}>({
  refreshTrigger: false,
  refreshData: () => new Promise<void>(() => {}),
});

// Custom hook to use the refresh context
export const useJudgesRefresh = () => useContext(JudgesRefreshContext);

const Judges: React.FC = () => {
  const [teams, setTeams] = useState<Record<string, TeamFeedback[]>>({});
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const { userRegistration } = useUserRegistration();

  // Callback to refresh data that can be passed to children
  const refreshData = useCallback(async () => {
    const fetchTeamsForJudge = async () => {
      try {
        const response = await fetchBackend({
          endpoint: `/team/judge/feedback/${userRegistration?.id}`,
          method: "GET",
          authenticatedCall: false,
        });

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
  }, []);

  useEffect(() => {
    const fetchTeamsForJudge = async () => {
      try {
        const response = await fetchBackend({
          endpoint: `/team/judge/feedback/${userRegistration?.id}`,
          method: "GET",
          authenticatedCall: false,
        });

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
  }, [userRegistration?.id, refreshTrigger]);

  const pages = [
    // TODO: Reversed naming, leave as is, come back to refactor component names
    {
      name: "History",
      icon: PanelsTopLeft,
      component: Rounds,
    },
    {
      name: "Rounds",
      icon: HistoryIcon,
      component: History,
    },
  ];

  return (
    <JudgesRefreshContext.Provider value={{ refreshTrigger, refreshData }}>
      <DashboardLayout title="JUDGING DASHBOARD" pages={pages} teams={teams} />
    </JudgesRefreshContext.Provider>
  );
};

export default Judges;
