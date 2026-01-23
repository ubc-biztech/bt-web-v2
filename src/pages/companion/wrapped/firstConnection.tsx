"use client";

import { CompanionConnectionRow } from "@/components/companion/connections/connection-row";
import { useEffect, useState, MouseEvent } from "react";
import { fetchBackend } from "@/lib/db";
import { Connection } from "@/components/companion/connections/connections-list";
import { COMPANION_EMAIL_KEY } from "@/constants/companion";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, animate } from "framer-motion";
import Image from "next/image";
import { useWrappedData } from "@/hooks/useWrappedData";
import ThreeDcard from "@/components/companion/blueprint2026/components/ThreeDcard";

interface FirstConnectionProps {
  isPartner: boolean;
}

const FirstConnection = ({ isPartner }: FirstConnectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  // Wrapped data available but unused for now
  const { data: wrappedData } = useWrappedData();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [error, setError] = useState("");
  const [companyProfilePicture, setCompanyProfilePicture] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTapped, setIsTapped] = useState(false);
  const router = useRouter();
  const opacity = useMotionValue(1);
  const scale = useMotionValue(1);
  const y = useMotionValue(0);

  const navigateTo = (path: string, saveConnections: boolean = false) => {
    if (saveConnections && connections.length > 0) {
      localStorage.setItem("connections", JSON.stringify(connections));
    }
    setIsTapped(true);
    animate(opacity, 0, { duration: 0.5 });
    animate(scale, 0.8, { duration: 0.5 });
    animate(y, 20, { duration: 0.5 });
    setTimeout(() => {
      router.push(path);
    }, 800);
  };

  const handleTapNavigation = (e: MouseEvent<HTMLDivElement>) => {
    const screenWidth = window.innerWidth;
    const clickX = e.clientX;
    const isRightSide = clickX > screenWidth * 0.3;

    if (isRightSide) {
      navigateTo("/companion/wrapped/taps", true);
    } else {
      navigateTo("/companion/wrapped/startPage");
    }
  };

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
          authenticatedCall: false,
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

  const fetchCompanyProfilePicture = async (company: string | undefined) => {
    if (!company || company === "No company found") return; // Prevent fetching if no company is found

    try {
      const data = await fetchBackend({
        endpoint: `/profiles/${company.toLowerCase().replace(/[^a-zA-Z]/g, "")}`,
        method: "GET",
        authenticatedCall: false,
      });

      if (data && data.profilePictureURL) {
        setCompanyProfilePicture(data.profilePictureURL);
      }
    } catch (error) {
      console.error(`Error fetching profile picture for ${company}:`, error);
    }
  };

  // Get first company name from connections
  const firstConnection: Connection | null =
    connections.length > 0 ? connections[connections.length - 1] : null;
  const firstCompanyConnection: Connection | null =
    connections.find((conn) => conn.company) || null;
  const firstCompanyName = firstCompanyConnection
    ? firstCompanyConnection.company
    : "No company found";

  // Fetch company profile pictures when firstCompanyName changes
  useEffect(() => {
    fetchCompanyProfilePicture(firstCompanyName);
  }, [firstCompanyName]); // Runs whenever firstCompanyName updates

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center p-6 space-y-6 overflow-hidden"
      onClick={handleTapNavigation}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ opacity, scale, y }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
    >
      <ThreeDcard
        fname={wrappedData?.firstConnection?.fname || ""}
        lname={wrappedData?.firstConnection?.lname || ""}
        pfp={wrappedData?.firstConnection?.pfp || ""}
        major={wrappedData?.firstConnection?.major || ""}
        year={wrappedData?.firstConnection?.year || ""}
        company={wrappedData?.firstCompanyVisited?.name || ""}
        logo={wrappedData?.firstCompanyVisited?.logo || ""}
      />
    </motion.div>
  );
};

export default FirstConnection;
