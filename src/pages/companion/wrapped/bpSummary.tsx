"use client";
import { useState, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  animate,
  AnimatePresence,
} from "framer-motion";
import Image from "next/image";
import { useWrappedData } from "@/hooks/useWrappedData";

interface BlueprintSummaryProps {
  isPartner: boolean;
}

const BlueprintSummary = ({ isPartner }: BlueprintSummaryProps) => {
  const [isTapped, setIsTapped] = useState(false);
  const router = useRouter();
  // Wrapped data available but unused for now
  const { data: wrappedData, isLoading } = useWrappedData();
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
      navigateTo("/companion/wrapped/MBTIsummary");
    } else {
      navigateTo("/companion/wrapped/tutorial");
    }
  };

  return (
    <AnimatePresence>
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
          {/* BluePrint Logo */}
          <div className="relative w-[72vw] max-w-[400px] mb-2">
            <Image
              src="/assets/blueprint/blueprint-logo.png"
              alt="BluePrint Logo"
              width={1200}
              height={400}
              className="object-contain w-full h-auto"
              priority
            />
          </div>

          {/* Subtitle */}
          <motion.p
            className="text-white text-lg md:text-xl font-satoshi"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            was <span className="font-bold font-satoshi">big</span> this year.
          </motion.p>

          {/* Gradient Divider Line */}
          <motion.div
            className="h-px w-3/4 bg-gradient-to-r from-[#88baff]/0 via-[#ffffff] to-[#88baff]/0"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          />

          {/* Stats Section */}
          <motion.p
            className="text-white text-lg md:text-xl font-satoshi"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            Where you,{" "}
            <span className="font-bold font-satoshi text-white">
              {isLoading ? "..." : wrappedData?.totalAttendees || 0} attendees
            </span>
            <br />
            and{" "}
            <span className="font-bold text-white">
              {wrappedData?.totalDelegates || 0} delegates
            </span>
          </motion.p>

          {/* Final Call-to-Action */}
          <motion.p
            className="text-white text-xl md:text-2xl italic font-satoshi drop-shadow-[0_0_20px_#4488FF]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            Explored their place in tech.
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BlueprintSummary;
