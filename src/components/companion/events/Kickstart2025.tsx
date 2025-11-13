import { useState, useEffect, useCallback } from "react";
import { fetchBackend } from "@/lib/db";
import { useUserRegistration } from "@/pages/companion/index";
import { KickstartNav } from "@/components/companion/kickstart/ui/KickstartNav";
import router from "next/router";
import Loading from "@/components/Loading";
import { AnimatePresence, motion } from "framer-motion";
import ManageTeam from "@/components/companion/team/manageTeam";

export enum KickstartPages {
  OVERVIEW = "OVERVIEW",
  INVEST = "INVEST",
  SETTINGS = "SETTINGS",
  MY_TEAM = "MY_TEAM",
  PROFILE = "PROFILE",
}

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
  const [team, setTeam] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<KickstartPages>(KickstartPages.OVERVIEW);

  const { userRegistration } = useUserRegistration();

  const fetchUserTeam = useCallback(async () => {
    if (!userRegistration?.["eventID;year"] || !userRegistration?.id) {
      setLoading(false);
      return;
    }

    const [eventID, year] = userRegistration["eventID;year"].split(";");
    try {
      const userTeam = await fetchBackend({
        endpoint: `/team/getTeamFromUserID`,
        method: "POST",
        data: {
          user_id: userRegistration.id,
          eventID: eventID,
          year: +year,
        },
        authenticatedCall: false,
      });

      if (userTeam) {
        setTeam(userTeam.response);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }, [userRegistration?.id, userRegistration?.["eventID;year"]]);

  useEffect(() => {
    if (userRegistration?.id && userRegistration?.["eventID;year"]) {
      fetchUserTeam();
    }
  }, [userRegistration?.id, userRegistration?.["eventID;year"], fetchUserTeam]);

  if (loading) {
    return <Loading />;
  }

  if (!team) {
    router.push("/companion/team");
    return;
  }

  return (
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
            className="w-full max-w-4xl mx-auto p-4 space-y-8 font-bricolage text-[100px]"
          >
            Kickstart overview!
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
            className="w-full max-w-4xl mx-auto p-4 space-y-8 font-bricolage text-[100px]"
          >
            Kickstart invest!
          </motion.div>
        )}
        {page === KickstartPages.MY_TEAM && (
          <motion.div
            key={KickstartPages.MY_TEAM}
            variants={pageVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={pageTransition}
            className="w-full max-w-4xl mx-auto p-4 space-y-8 font-bricolage"
          >
            <ManageTeam />
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
            className="w-full max-w-4xl mx-auto p-4 space-y-8 font-bricolage text-[100px]"
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
            className="w-full max-w-4xl mx-auto p-4 space-y-8 font-bricolage text-[100px]"
          >
            Kickstart profile!
          </motion.div>
        )}
      </AnimatePresence>
    </KickstartNav>
  );
};

export default Kickstart2025;
