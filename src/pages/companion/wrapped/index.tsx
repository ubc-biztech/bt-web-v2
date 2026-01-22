"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MouseEvent } from "react";
import { useWrappedData } from "@/hooks/useWrappedData";

interface WrappedPageProps {
  isPartner: boolean;
}

const WrappedPage = ({ isPartner }: WrappedPageProps) => {
  const router = useRouter();
  // Wrapped data available but unused for now
  const { data: wrappedData } = useWrappedData();

  const handleTapNavigation = (e: MouseEvent<HTMLDivElement>) => {
    const screenWidth = window.innerWidth;
    const clickX = e.clientX;
    const isRightSide = clickX > screenWidth * 0.3;

    // First page - only forward navigation (right side tap)
    if (isRightSide) {
      router.push("/companion/wrapped/tutorial");
    }
    // Left side tap does nothing on first page
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center p-6 cursor-pointer overflow-hidden"
      onClick={handleTapNavigation}
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
          className="absolute bottom-8 left-0 right-0 text-center"
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
      </div>
  );
};

export default WrappedPage;
