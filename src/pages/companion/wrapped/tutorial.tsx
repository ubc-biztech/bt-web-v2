"use client";
import {
  motion,
  useMotionValue,
  animate,
  AnimatePresence,
} from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, MouseEvent } from "react";
import { useWrappedData } from "@/hooks/useWrappedData";

interface TutorialPageProps {
  isPartner: boolean;
}

const TutorialPage = ({ isPartner }: TutorialPageProps) => {
  const router = useRouter();
  // Wrapped data available but unused for now
  const { data: wrappedData } = useWrappedData();
  const [isTapped, setIsTapped] = useState(false);

  const opacity = useMotionValue(1);
  const scale = useMotionValue(1);
  const y = useMotionValue(0);
  const overlayOpacity = useMotionValue(0);

  // Fade in the overlay on mount
  useEffect(() => {
    animate(overlayOpacity, 1, { duration: 0.5 });
  }, [overlayOpacity]);

  const navigateTo = (path: string) => {
    setIsTapped(true);
    animate(overlayOpacity, 0, { duration: 0.3 });
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
      navigateTo("/companion/wrapped/bpSummary");
    } else {
      navigateTo("/companion/wrapped");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex flex-col items-center justify-center p-6 cursor-pointer overflow-hidden"
        onClick={handleTapNavigation}
        style={{ opacity, scale, y }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
      >
        {/* Main Content - Centered */}
        <div className="flex flex-col items-center justify-center text-center space-y-4 w-full">
          {/* Welcome Text */}
          <p
            className="text-center"
            style={{
              color: "#FFF",
              fontFamily: "Manrope, sans-serif",
              fontSize: "16px",
              fontWeight: 500,
            }}
          >
            Welcome to your
          </p>

          {/* BluePrint Logo - Metallic */}
          <div className="relative w-[90vw] max-w-[500px]">
            <Image
              src="/assets/blueprint/blueprint-logo.png"
              alt="BluePrint"
              width={1200}
              height={400}
              className="object-contain w-full h-auto"
              priority
            />
          </div>

          {/* Wrapped Text - Gradient */}
          <p
            className="text-center"
            style={{
              fontFamily: "Manrope, sans-serif",
              fontSize: "24px",
              fontWeight: 400,
              background:
                "linear-gradient(329deg, #EAE5D4 31.61%, #97BBFF 67.05%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Wrapped
          </p>
        </div>

        {/* Tutorial - Bottom */}
        <p
          className="absolute bottom-8 left-0 right-0 text-center"
          style={{
            color: "#FFF",
            fontFamily: "Manrope, sans-serif",
            fontSize: "16px",
            fontWeight: 500,
          }}
        >
          tutorial
        </p>

        {/* Blur overlay - on top of everything */}
        <motion.div
          className="absolute inset-0 backdrop-blur-[10px] pointer-events-none z-20 flex p-[10px] gap-[10px]"
          style={{ opacity: overlayOpacity }}
        >
          {/* add dashed border to the divs */}
          <div className="w-[50%] h-full rounded-lg flex flex-col gap-4 items-center justify-center border-dashed border-2 border-white">
            Tap here to go back
            <Image
              src="/assets/blueprint/tap-icon.svg"
              alt="Tap"
              width={40}
              height={40}
            />
          </div>
          <div className="w-[50%] h-full rounded-lg flex flex-col gap-4 items-center justify-center border-dashed border-2 border-white">
            Tap here to go forward
            <Image
              src="/assets/blueprint/tap-icon.svg"
              alt="Tap"
              width={40}
              height={40}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TutorialPage;
