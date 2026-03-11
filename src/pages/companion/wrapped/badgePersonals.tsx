"use client";

import { useEffect, useState } from "react";
import { m, useMotionValue, animate } from "framer-motion";
import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import { useRouter } from "next/navigation";
import { COMPANION_EMAIL_KEY } from "@/constants/companion";
import { fetchBackend } from "@/lib/db";
import { blueprintBadgeIcons } from "../../../constants/blueprint-badgeIcons";
import Image from "next/image";
import { Badge } from "../badges";

interface BadgeSummaryProps {
  isPartner: boolean;
}

const BadgeSummary = ({ isPartner }: BadgeSummaryProps) => {
  const router = useRouter();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [completedBadges, setCompletedBadges] = useState<Badge[]>([]);
  const [pageError, setPageError] = useState("");
  const [isTapped, setIsTapped] = useState(false);
  const opacity = useMotionValue(1);
  const scale = useMotionValue(1);
  const y = useMotionValue(0);

  const totalBadges = 13; // Fixed number of attainable badges

  const handleTap = () => {
    setIsTapped(true);
    animate(opacity, 0, { duration: 0.5 });
    animate(scale, 0.8, { duration: 0.5 });
    animate(y, 20, { duration: 0.5 });
    setTimeout(() => {
      router.push("/companion/wrapped/wrapUp");
    }, 800);
  };

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const profileId = localStorage.getItem(COMPANION_EMAIL_KEY);
        if (!profileId) {
          setPageError("Please log in to view your badges");
          return;
        }

        const response = await fetchBackend({
          endpoint: `/interactions/quests/${profileId}`,
          method: "GET",
          authenticatedCall: false,
        });

        if (!response || !response.data) {
          throw new Error("Invalid badge data received.");
        }

        const processedBadges = response.data.map(
          (badge: Omit<Badge, "isComplete">) => ({
            ...badge,
            isComplete: badge.progress >= badge.threshold,
          }),
        );

        // Filter only completed badges
        const completed = processedBadges.filter(
          (badge: Badge) => badge.isComplete,
        );

        setBadges(processedBadges);
        setCompletedBadges(completed);
      } catch (err) {
        console.error("Error fetching badges:", err);
        setPageError(
          err instanceof Error ? err.message : "Failed to load badges.",
        );
      }
    };

    fetchBadges();
  }, []);

  return (
    <NavBarContainer isPartner={isPartner}>
      <m.div
        className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#040C12] to-[#030608] p-6 space-y-6 cursor-pointer"
        onClick={handleTap}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ opacity, scale, y }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
      >
        {/* Title */}
        <m.p className="text-white text-lg font-satoshi font-medium text-center">
          You collected
        </m.p>

        {/* Badge Count */}
        <m.h1 className="text-white text-6xl font-satoshi font-bold drop-shadow-[0_0_20px_#4488FF]">
          {completedBadges.length}
        </m.h1>

        {/* Subtext */}
        <m.p className="text-white text-lg font-satoshi font-medium text-center">
          <span className="underline">
            {completedBadges.length === 1 ? "badge" : "badges"}
          </span>{" "}
          out of {totalBadges}.
        </m.p>

        {/* Badge Collection Box */}
        {completedBadges.length > 0 ? (
          <m.div
            className="bg-[#111827] rounded-lg p-6 shadow-lg w-[85%] max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-white text-sm font-satoshi font-bold mb-2">
              Badges Collected
            </p>
            <div className="grid grid-cols-5 gap-3 justify-center">
              {completedBadges.map((badge) => (
                <m.div
                  key={badge.questID}
                  className="w-14 h-14 flex items-center justify-center rounded-full shadow-lg transition-all hover:scale-110"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.15 }}
                  transition={{
                    delay: 0.05 * completedBadges.indexOf(badge),
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                >
                  {blueprintBadgeIcons[badge.questID] ? (
                    <Image
                      src={blueprintBadgeIcons[badge.questID]}
                      alt="Test Badge"
                      width={40}
                      height={40}
                    />
                  ) : (
                    <span className="text-black font-satoshi font-semibold">
                      {badge.questID.charAt(0)}
                    </span> // Fallback text
                  )}
                </m.div>
              ))}
            </div>
          </m.div>
        ) : (
          <m.p className="text-white text-md italic text-center">
            You haven&apos;t collected any badges yet.
          </m.p>
        )}

        {/* Completion Percentage */}
        {(completedBadges.length / totalBadges) * 100 > 20 && (
          <m.p className="text-white text-lg font-satoshi font-medium text-center">
            That&apos;s{" "}
            <span className="font-satoshi font-bold">
              {((completedBadges.length / totalBadges) * 100).toFixed(0)}%
            </span>{" "}
            of all attainable badges!
          </m.p>
        )}
      </m.div>
    </NavBarContainer>
  );
};

export default BadgeSummary;
