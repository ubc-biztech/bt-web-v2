"use client";
import {
  motion,
  useMotionValue,
  animate,
  AnimatePresence,
} from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, MouseEvent } from "react";

interface TutorialPageProps {
  isPartner: boolean;
}

const TutorialPage = ({ isPartner }: TutorialPageProps) => {
  const router = useRouter();
  const [isTapped, setIsTapped] = useState(false);

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
      </motion.div>
    </AnimatePresence>
  );
};

export default TutorialPage;

