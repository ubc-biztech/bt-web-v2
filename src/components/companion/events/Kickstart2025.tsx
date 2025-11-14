import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { fetchBackend } from "@/lib/db";
import { useUserRegistration } from "@/pages/companion/index";
import { KickstartNav } from "@/components/companion/kickstart/ui/KickstartNav";
import Loading from "@/components/Loading";
import { AnimatePresence, motion } from "framer-motion";
import Overview from "../kickstart/overview/Overview";
import router from "next/router";
import { Link } from "lucide-react";

export enum KickstartPages {
  OVERVIEW = "OVERVIEW",
  INVEST = "INVEST",
  SETTINGS = "SETTINGS",
  MY_TEAM = "MY_TEAM",
  PROFILE = "PROFILE",
}

export interface TeamData {
  "eventID;year": string;
  funding: number;
  id: string;
  inventory: string[];
  memberIDs: string[];
  metadata: Record<string, any>;
  points: number;
  pointsSpent: number;
  scannedQRs: string[];
  submission: string;
  teamName: string;
  transactions: any[];
}

interface TeamContextType {
  team: TeamData | null;
  isLoading: boolean;
}

export const TeamContext = createContext<TeamContextType | null>(null);

export const useTeam = () => {
  const context = useContext(TeamContext) as TeamContextType;
  if (!context) {
    throw new Error(
      "useTeam must be used within a TeamProvider. Ensure TeamProvider is above the consuming component in the tree.",
    );
  }
  return context;
};

interface TeamProviderProps {
  children: ReactNode;
}

export const TeamProvider: React.FC<TeamProviderProps> = ({ children }) => {
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { userRegistration } = useUserRegistration();

  const fetchUserTeam = async () => {
    setLoading(true);

    const email = userRegistration?.id;
    const eventIDYearString = userRegistration?.["eventID;year"];

    if (!email || !eventIDYearString) {
      console.warn(
        "User registration data (email or eventID;year) is missing. Cannot fetch team.",
      );
      setLoading(false);
      return;
    }

    const [eventID, year] = eventIDYearString.split(";");

    console.log("Fetching team for user:", email);

    try {
      const userTeam = await fetchBackend({
        endpoint: `/team/getTeamFromUserID`,
        method: "POST",
        data: {
          user_id: email,
          eventID: eventID,
          year: +year,
        },
        authenticatedCall: false,
      });

      if (userTeam && userTeam.response) {
        setTeam(userTeam.response);
        console.log("Successfully fetched team:", userTeam.response);
      }
    } catch (error) {
      console.error("Error fetching user team:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRegistration) {
      fetchUserTeam();
    }
  }, [userRegistration]);

  const contextValue: TeamContextType = { team: team, isLoading: loading };

  if (loading) {
    return <Loading />;
  }

  // if (!team) {
  //   router.push("/companion/team");
  //   return;
  // }

  return (
    <TeamContext.Provider value={contextValue}>{children}</TeamContext.Provider>
  );
};

const pageVariants = {
  initial: {
    opacity: 0,
    x: 50,
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: -50,
  },
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3,
};

const Kickstart2025 = () => {
  const [page, setPage] = useState<KickstartPages>(KickstartPages.OVERVIEW);
  const pageStyle =
    "w-full mx-auto space-y-8 font-bricolage text-[100px] flex flex-col items-center justify-center";

  // route to kickstart dashboard
  return (
    <TeamProvider>
      <KickstartNav page={page} setPage={setPage}>
        <AnimatePresence mode="wait">
          {page === KickstartPages.OVERVIEW && (
            <motion.div
              key={KickstartPages.OVERVIEW}
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
              className={pageStyle}
            >
              <Overview />
            </motion.div>
          )}
          {page === KickstartPages.INVEST && (
            <motion.div
              key={KickstartPages.INVEST}
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
              className={pageStyle}
            >
              Kickstart invest!
              <button
                className="items-center justify-center px-6 py-3 bg-[#DE7D02] hover:bg-[#f29224] text-white text-2xl"
                onClick={() => router.push("/companion/kickstart/invest")}
              >
                Go to Invest Flow
              </button>
            </motion.div>
          )}
          {page === KickstartPages.SETTINGS && (
            <motion.div
              key={KickstartPages.SETTINGS}
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
              className={pageStyle}
            >
              Kickstart settings!
            </motion.div>
          )}
          {page === KickstartPages.PROFILE && (
            <motion.div
              key={KickstartPages.PROFILE}
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
              className={pageStyle}
            >
              Kickstart profile!
            </motion.div>
          )}
        </AnimatePresence>
      </KickstartNav>
    </TeamProvider>
  );
};

export default Kickstart2025;
