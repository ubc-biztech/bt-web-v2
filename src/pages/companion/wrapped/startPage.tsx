"use client";

import { useState, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, animate } from "framer-motion";
import { useWrappedData } from "@/hooks/useWrappedData";

interface StartPageProps {
  isPartner: boolean;
}

const StartPage = ({ isPartner }: StartPageProps) => {
  const [isTapped, setIsTapped] = useState(false);
  const router = useRouter();
  // Force refresh wrapped data on start page
  const { data: wrappedData } = useWrappedData(true);
  const opacity = useMotionValue(1);
  const scale = useMotionValue(1);
  const y = useMotionValue(0);

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
      navigateTo("/companion/wrapped/firstConnection");
    } else {
      navigateTo("/companion/wrapped/companySummary");
    }
  };

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center p-6 overflow-hidden"
      onClick={handleTapNavigation}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ opacity, scale, y }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
    >
      {/* Main Content */}
      <motion.div
        className="flex flex-col items-center text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Question Text */}
        <motion.p
          className="text-white text-lg md:text-xl font-satoshi font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          How did <span className="font-satoshi font-bold">you</span> explore?
        </motion.p>

        {/* Subtext */}
        <motion.p
          className="text-white text-lg md:text-xl font-satoshi font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          Let’s take a look back.
        </motion.p>

        {/* Arrow Icon */}
        <motion.div
          className="mt-4 flex items-center justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            ></path>
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default StartPage;
