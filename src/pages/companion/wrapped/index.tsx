"use client";
import {
  motion,
  useMotionValue,
  animate,
  AnimatePresence,
} from "framer-motion";
import { Users2 } from "lucide-react";
import { GradientText } from "@/components/ui/gradient-text";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import Events from "../../../constants/companion-events";
import NavbarLogo from "../../../assets/2025/blueprint/navbar_logo.png";

interface WrappedPageProps {
  isPartner: boolean;
}

const WrappedPage = ({ isPartner }: WrappedPageProps) => {
  const router = useRouter();
  const [isTapped, setIsTapped] = useState(false);

  const opacity = useMotionValue(1);
  const scale = useMotionValue(1);
  const y = useMotionValue(0);

  const handleTap = () => {
    setIsTapped(true);
    animate(opacity, 0, { duration: 0.5 });
    animate(scale, 0.8, { duration: 0.5 });
    animate(y, 20, { duration: 0.5 });
    setTimeout(() => {
      router.push("/companion/wrapped/bpSummary");
    }, 800);
  };

  return (
    <NavBarContainer isPartner={isPartner}>
      <AnimatePresence>
        <motion.div
          className=" min-h-screen bg-gradient-to-b from-[#040C12] to-[#030608] flex flex-col items-center justify-between p-6 cursor-pointer"
          onClick={handleTap}
          style={{ opacity, scale, y }}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          {/* Main Content */}
          <motion.div
            className="flex-1 flex flex-col items-center justify-center -mt-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="relative w-[200px] h-[200px] flex items-center justify-center mb-4">
              {/* Glow effect behind the logo */}
              <motion.div
                className="absolute inset-0 rounded-full bg-[#4488FF] blur-[60px] opacity-20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />

              {/* Logo container with rotation */}
              <motion.div
                className="relative -top-16 w-full h-full flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 20,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                {/* Circle behind logo */}
                <div className="absolute inset-0 border-2 border-[#4488FF] rounded-full shadow-[0_0_20px_#4488FF]" />

                {/* Logo */}
                <Image
                  src={Events[0].options.BiztechLogo || "/placeholder.svg"}
                  alt={`${Events[0].options.title} Logo`}
                  width={1000}
                  height={400}
                  quality={100}
                  className="w-3/5 relative drop-shadow-[0_0_15px_#4488FF]"
                  priority
                />
              </motion.div>
            </div>

            <motion.div className="text-center space-y-0 flex flex-col items-center -mt-6">
              {/* BluePrint Logo */}
              <div className="relative w-80 min-h-20 flex items-center justify-center mb-2">
                <Image
                  src={NavbarLogo}
                  alt="BluePrint Logo"
                  className="object-contain"
                  priority
                />
              </div>

              {/* Wrapped Text */}
              <motion.p
                className="text-white text-xl italic font-satoshi drop-shadow-[0_0_20px_#4488FF] mt-[-12px] whitespace-nowrap px-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                Wrapped
              </motion.p>
            </motion.div>

            {/* Footer */}
            <motion.div className="flex flex-col items-center gap-0 mt-[-2px] min-h-[50px]">
              <svg
                width="64"
                height="80"
                viewBox="0 0 124 148"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full block"
              >
                <g>
                  <path
                    d="M41.952 50.1082C41.818 46.4282 43.956 39.1402 50.18 36.0962C52.748 34.5362 59.792 32.1202 66.528 36.4242C73.168 40.6642 73.616 46.9122 74.032 50.0642"
                    stroke="white"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M82.6644 114.004C82.4804 107.46 82.8924 106.812 83.3724 105.356C83.8524 103.9 87.1964 98.6524 88.3804 94.9004C92.2124 82.7644 88.6404 80.1804 83.8804 76.7404C78.6004 72.9244 69.1044 71.0284 64.1644 71.4484V52.0924C64.1644 48.8004 61.0084 46.1044 57.6364 46.1044C54.2644 46.1044 51.1684 48.8004 51.1684 52.0924V85.3404L44.2884 79.3804C42.0524 77.0044 38.4564 76.7644 36.0004 78.9204C34.8808 79.892 34.1758 81.2554 34.0304 82.7304C33.8842 84.2055 34.3088 85.6805 35.2164 86.8524L39.7404 92.7084"
                    stroke="white"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              </svg>
            </motion.div>

            <p className="text-white text-mt font-light font-satoshi mt-0">
              {" "}
              {/* Reduced margin here */}
              Tap to start.
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </NavBarContainer>
  );
};

export default WrappedPage;
