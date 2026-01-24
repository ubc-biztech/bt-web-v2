"use client";

import { useState, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, animate } from "framer-motion";
import { useQuizReport, useWrappedStats } from "@/queries/quiz";

interface MBTISummaryProps {
  isPartner: boolean;
}

const MBTISummary = ({ isPartner }: MBTISummaryProps) => {
  const [isTapped, setIsTapped] = useState(false);
  const router = useRouter();
  const opacity = useMotionValue(1);
  const scale = useMotionValue(1);
  const y = useMotionValue(0);

  const { data: quizReport, isLoading: reportLoading } = useQuizReport();
  const mbti = quizReport?.mbti?.toUpperCase() ?? "";
  const {
    data: wrappedStats,
    isLoading: statsLoading,
    isError: statsError,
  } = useWrappedStats(mbti || undefined);

  const totalResponses = wrappedStats?.totalResponses ?? 0;
  const totalWithMbtiCount = wrappedStats?.totalWithMbtiCount ?? 0;
  const otherCount = Math.max(totalWithMbtiCount - 1, 0);
  const otherLabel = otherCount === 1 ? "other attendee" : "other attendees";
  const percent =
    totalResponses > 0
      ? ((totalWithMbtiCount / totalResponses) * 100).toFixed(1)
      : null;
  const isLoading = reportLoading || (!!mbti && statsLoading);

  const navigateTo = (path: string) => {
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
      navigateTo("/companion/wrapped/companySummary");
    } else {
      navigateTo("/companion/wrapped/bpSummary");
    }
  };

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center px-4 py-6 space-y-4 cursor-pointer overflow-hidden"
      onClick={handleTapNavigation}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ opacity, scale, y }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
    >
      {/* Title */}
      <motion.p className="text-white text-lg font-satoshi font-medium text-center">
        Your MBTI was
      </motion.p>

      {/* MBTI Type */}
      {mbti ? (
        <motion.h1 className="text-white text-6xl font-satoshi font-bold tracking-[0.2em] drop-shadow-[0_0_20px_#4488FF]">
          {mbti}
        </motion.h1>
      ) : (
        <motion.div
          className="h-px w-3/4 max-w-md bg-white/80"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        />
      )}

      {/* Subtext */}
      <motion.p className="text-white text-lg font-satoshi font-medium text-center">
        {mbti
          ? "Here is how your type stacked up."
          : "Take the career quiz to see your type."}
      </motion.p>

      {/* Stats Card */}
      {mbti ? (
        <motion.div
          className="bg-[#111827] rounded-lg p-6 shadow-lg w-[85%] max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-white text-sm font-satoshi font-bold mb-2">
            MBTI Stats
          </p>
          {isLoading ? (
            <p className="text-white/70 text-sm font-satoshi">
              Loading stats...
            </p>
          ) : statsError ? (
            <p className="text-white/70 text-sm font-satoshi">
              Stats are unavailable right now.
            </p>
          ) : (
            <>
              <p className="text-white text-lg font-satoshi font-medium">
                {otherCount} {otherLabel} share your type.
              </p>
              {totalResponses > 0 && (
                <p className="text-white/70 text-sm font-satoshi">
                  {totalWithMbtiCount} of {totalResponses} total responses.
                  {percent ? ` (${percent}%)` : ""}
                </p>
              )}
            </>
          )}
        </motion.div>
      ) : (
        <motion.p className="text-white text-md italic text-center">
          No quiz results found yet.
        </motion.p>
      )}
    </motion.div>
  );
};

export default MBTISummary;
