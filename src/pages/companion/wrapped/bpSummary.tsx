"use client";
import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import { useState } from "react";
import { useRouter } from "next/navigation"
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import Image from "next/image"
import NavbarLogo from "../../../assets/2025/blueprint/navbar_logo.png"

interface BlueprintSummaryProps {
  isPartner: boolean;
}

const BlueprintSummary = ({ isPartner }: BlueprintSummaryProps) => {

  const [isTapped, setIsTapped] = useState(false)
  const router = useRouter()
  const opacity = useMotionValue(1)
  const scale = useMotionValue(1)
  const y = useMotionValue(0)

  const handleTap = () => {
    setIsTapped(true)
    animate(opacity, 0, { duration: 0.5 })
    animate(scale, 0.8, { duration: 0.5 })
    animate(y, 20, { duration: 0.5 })
    setTimeout(() => {
      router.push("/companion/wrapped/companySummary")
    }, 800)
  }
  return (
    <NavBarContainer isPartner={isPartner}>
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 flex flex-col items-center bg-gradient-to-b from-[#040C12] to-[#030608] p-6 pt-8"
          onClick={handleTap}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ opacity, scale, y }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
        >
          {/* Main Content */}
          <motion.div
            className="flex flex-col items-center text-center space-y-4 flex-grow justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* BluePrint Logo */}
            <div className="relative w-60 h-20 mb-2"> {/* Adjust width & height as needed */}
              <Image
                src={NavbarLogo}
                alt="BluePrint Logo"
                layout="fill"
                className="object-contain"
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
              Where you, <span className="font-bold font-satoshi text-white">251 attendees</span>
              <br />
              and <span className="font-bold text-white">90 delegates</span>
            </motion.p>

            {/* Final Call-to-Action */}
            <motion.p
              className="text-white text-xl md:text-2xl italic font-satoshi drop-shadow-[0_0_20px_#4488FF]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              <span className="font-bold font-satoshi">Got their</span> <span className="italic">start.</span>
            </motion.p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </NavBarContainer>
  );
};

export default BlueprintSummary;
