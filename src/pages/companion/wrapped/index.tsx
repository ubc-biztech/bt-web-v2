"use client";
import {
  motion,
  useMotionValue,
  animate,
  AnimatePresence,
} from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import { WRAPPED_BACKDROP_STYLE } from "@/constants/wrapped";

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
          className="min-h-screen flex flex-col items-center justify-center p-6 cursor-pointer"
          onClick={handleTap}
          style={{ ...WRAPPED_BACKDROP_STYLE, opacity, scale, y }}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          {/* Main Content - Centered */}
          <motion.div
            className="flex flex-col items-center justify-center text-center space-y-4 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Welcome Text */}
            <motion.p
              className="text-center"
              style={{
                color: "#FFF",
                fontFamily: "Manrope, sans-serif",
                fontSize: "16px",
                fontWeight: 500,
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Welcome to your
            </motion.p>

            {/* BluePrint Logo - Metallic */}
            <motion.div
              className="relative w-[90vw] max-w-[500px]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Image
                src="/assets/blueprint/blueprint-logo.png"
                alt="BluePrint"
                width={1200}
                height={400}
                className="object-contain w-full h-auto"
                priority
              />
            </motion.div>

            {/* Wrapped Text - Gradient */}
            <motion.p
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Wrapped
            </motion.p>
          </motion.div>

          {/* Tap to start - Bottom */}
          <motion.p
            className="absolute bottom-12 text-center"
            style={{
              color: "#FFF",
              fontFamily: "Manrope, sans-serif",
              fontSize: "16px",
              fontWeight: 500,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            Tap to start.
          </motion.p>
        </motion.div>
      </AnimatePresence>
    </NavBarContainer>
  );
};

export default WrappedPage;
