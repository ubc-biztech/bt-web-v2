import { useRouter } from "next/router";
import Loading from "@/components/Loading";
import { fetchBackend } from "@/lib/db";
import { useUserRegistration } from "@/pages/companion/index";
import { KickstartNav } from "@/components/companion/kickstart/ui/KickstartNav";
import { AnimatePresence, motion } from "framer-motion";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";

// pages
import Overview from "../kickstart/overview/Overview";
import Invest from "../kickstart/invest/Invest";
import Settings from "../kickstart/settings/Settings";

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
  memberNames?: string[];
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
  const router = useRouter();

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

  if (!team) {
    router.push("/companion/team");
    return;
  }

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

const PageWrapper = ({
  children,
  key,
}: {
  children: ReactNode;
  key: KickstartPages;
}) => {
  return (
    <motion.div
      key={key}
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={pageTransition}
      className={
        "w-full mx-auto space-y-8 font-bricolage text-[100px] flex flex-col items-center justify-center"
      }
    >
      {children}
    </motion.div>
  );
};

const Kickstart2025 = () => {
  const router = useRouter();
  const [sharedTeamId, setSharedTeamId] = useState<string | null>(null);
  const [pendingSharedTeam, setPendingSharedTeam] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!router.isReady) return;
    const { sharedTeam } = router.query;
    if (sharedTeam && typeof sharedTeam === "string") {
      setSharedTeamId(sharedTeam);
    } else {
      setSharedTeamId(null);
    }
  }, [router.isReady, router.query.sharedTeam]);

  // If there's a sharedTeamId in the URL, navigate to INVEST page
  useEffect(() => {
    if (!sharedTeamId) return;

    setPage(KickstartPages.INVEST);
    setPendingSharedTeam(sharedTeamId);
  }, [sharedTeamId]);

  const [page, setPage] = useState<KickstartPages>(KickstartPages.OVERVIEW);

  // route to kickstart dashboard
  return (
    <TeamProvider>
      <KickstartNav page={page} setPage={setPage}>
        <AnimatePresence mode="wait">
          {page === KickstartPages.OVERVIEW && (
            <PageWrapper key={KickstartPages.OVERVIEW}>
              <Overview setPage={setPage} />
            </PageWrapper>
          )}
          {page === KickstartPages.INVEST && (
            <PageWrapper key={KickstartPages.INVEST}>
              <Invest
                setPage={setPage}
                sharedTeamId={pendingSharedTeam}
                setPendingSharedTeam={setPendingSharedTeam}
              />
            </PageWrapper>
          )}
          {page === KickstartPages.SETTINGS && (
            <PageWrapper key={KickstartPages.SETTINGS}>
              <Settings />
            </PageWrapper>
          )}
          {page === KickstartPages.PROFILE && (
            <PageWrapper key={KickstartPages.PROFILE}>
              {"Kickstart Profile!"}
            </PageWrapper>
          )}
        </AnimatePresence>
      </KickstartNav>
    </TeamProvider>
  );
};

export default Kickstart2025;
