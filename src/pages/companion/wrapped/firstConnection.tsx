"use client";

import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import { CompanionConnectionRow } from "@/components/companion/connections/connection-row";
import { useEffect, useState } from "react";
import { fetchBackend } from "@/lib/db";
import { Connection } from "@/components/companion/connections/connections-list";
import { COMPANION_EMAIL_KEY } from "@/constants/companion";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, animate } from "framer-motion";
import Image from "next/image";
import { WRAPPED_BACKDROP_STYLE } from "@/constants/wrapped";

interface FirstConnectionProps {
  isPartner: boolean;
}

const FirstConnection = ({ isPartner }: FirstConnectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [error, setError] = useState("");
  const [companyProfilePicture, setCompanyProfilePicture] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTapped, setIsTapped] = useState(false);
  const router = useRouter();
  const opacity = useMotionValue(1);
  const scale = useMotionValue(1);
  const y = useMotionValue(0);

  const handleTap = () => {
    if (connections.length > 0) {
      localStorage.setItem("connections", JSON.stringify(connections));
    }
    setIsTapped(true);
    animate(opacity, 0, { duration: 0.5 });
    animate(scale, 0.8, { duration: 0.5 });
    animate(y, 20, { duration: 0.5 });
    setTimeout(() => {
      router.push("/companion/wrapped/taps");
    }, 800);
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
    <NavBarContainer isPartner={isPartner}>
      <motion.div
        className="fixed inset-0 flex flex-col items-center justify-center p-6 space-y-6"
        onClick={handleTap}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ ...WRAPPED_BACKDROP_STYLE, opacity, scale, y }}
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
          className="text-white text-lg font-satoshi font-medium text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {firstConnection ? (
            <>
              <span className="font-satoshi font-bold">
                {firstConnection.fname}
              </span>{" "}
              was your first connection
            </>
          ) : (
            "You have no recorded connections."
          )}
        </motion.p>

        {/* Show company logo only if profile picture exists */}
        {companyProfilePicture && (
          <>
            {/* Company Logo */}
            <motion.div
              className="w-20 h-20 flex items-center justify-center bg-white rounded-full shadow-lg overflow-hidden relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <Image
                src={companyProfilePicture}
                alt="Company Logo"
                layout="fill"
                objectFit="contain" // Keeps the image within the bounds without cropping
                className="scale-90" // Makes the image slightly smaller
              />
            </motion.div>

            {/* Company Tap Text */}
            <motion.p className="text-white text-lg font-satoshi font-medium text-center">
              <span className="font-satoshi font-bold">{firstCompanyName}</span>{" "}
              was the first company you tapped
            </motion.p>
          </>
        )}
      </motion.div>
    </NavBarContainer>
  );
};

export default FirstConnection;
