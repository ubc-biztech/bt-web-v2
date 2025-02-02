"use client";

import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import { CompanionConnectionRow } from "@/components/companion/connections/connection-row";
import Filter from "@/components/companion/Filter";
import { useEffect, useState } from "react";
import { fetchBackend } from "@/lib/db";
import { Connection } from "@/components/companion/connections/connections-list";
import { SearchBar } from "@/components/companion/SearchBar";
import Loading from "@/components/Loading";
import { COMPANION_EMAIL_KEY } from "@/constants/companion";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';

interface FirstConnectionProps {
  isPartner: boolean;
}

const FirstConnection = ({ isPartner }: FirstConnectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTapped, setIsTapped] = useState(false)
  const router = useRouter()
  const opacity = useMotionValue(1)
  const scale = useMotionValue(1)
  const y = useMotionValue(0)

  const handleTap = () => {
    if (connections.length > 0) {
      localStorage.setItem("connections", JSON.stringify(connections));
    }
    setIsTapped(true)
    animate(opacity, 0, { duration: 0.5 })
    animate(scale, 0.8, { duration: 0.5 })
    animate(y, 20, { duration: 0.5 })
    setTimeout(() => {
      router.push("/companion/wrapped/taps")
    }, 800)
  }


  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setIsLoading(true);
        const profileId = localStorage.getItem(COMPANION_EMAIL_KEY);
        if (!profileId) {
          setError("Please log in to view your connections");
          setIsLoading(false);
          return;
        }

        // Fetch connections using the profileID
        const data = await fetchBackend({
          endpoint: `/interactions/journal/${profileId}`,
          method: "GET",
          authenticatedCall: false
        });
        setConnections(data.data);
      } catch (error) {
        console.error("Error fetching connections:", error);
        setError("Error fetching your connections");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnections();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const firstConnection: Connection | null = connections.length > 0 ? connections[0] : null;

  const firstCompanyConnection: Connection | null =
    connections.find((conn) => conn.company) || null;

  const firstCompanyName = firstCompanyConnection ? firstCompanyConnection.company : "No company found";

  return (
    <NavBarContainer isPartner={isPartner}>
      <motion.div
        className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#040C12] to-[#030608] p-6 space-y-6"
        onClick={handleTap}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ opacity, scale, y }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
      >
        {firstConnection ? (
          <div onClick={(e) => e.stopPropagation()} className="cursor-default">
            <CompanionConnectionRow connection={firstConnection} />
          </div>
        ) : (
          <motion.div
            className="bg-[#111827] rounded-lg px-6 py-4 flex items-center space-x-4 w-80 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-white text-center">No connections found</p>
          </motion.div>
        )}
        {/* Connection Text */}
        <motion.p
          className="text-white text-lg font-medium text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {firstConnection ? (
            <>
              <span className="font-bold">{firstConnection.fname}</span> was your first connection
            </>
          ) : (
            "You have no recorded connections."
          )}
        </motion.p>

        {/* Google Logo */}
        <motion.div
          className="w-20 h-20 flex items-center justify-center bg-white rounded-full shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >

        </motion.div>

        {/* Company Tap Text */}
        <motion.p className="text-white text-lg font-medium text-center">
          {firstCompanyConnection ? (
            <>
              <span className="font-bold">{firstCompanyName}</span> was the first company you tapped
            </>
          ) : (
            "No company recorded."
          )}
        </motion.p>
      </motion.div>
    </NavBarContainer>
  );
};

export default FirstConnection;