"use client";

import { motion } from "framer-motion";
import NavBarContainer from "@/components/companion/navigation/NavBarContainer";

interface BlueprintSummaryProps {
  isPartner: boolean;
}

const BlueprintSummary = ({ isPartner }: BlueprintSummaryProps) => {
  return (
    <NavBarContainer isPartner={isPartner}>
      <motion.div
        className="min-h-screen bg-gradient-to-b from-[#040C12] to-[#030608] flex flex-col items-center justify-between p-6"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
    
        {/* Main Content */}
        <motion.div
          className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Glowing Title */}
          <motion.h1
            className="text-white text-5xl md:text-6xl font-bold tracking-tight drop-shadow-[0_0_20px_#4488FF]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <span style={{ color: "#4488FF" }}>Blue</span>
            <span className="text-white">Print</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-white text-lg md:text-xl font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            was <span className="font-bold">big</span> this year.
          </motion.p>

          {/* Divider Line */}
          <motion.div
            className="w-3/4 h-[1px] bg-gray-400 opacity-40"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          />

          {/* Stats Section */}
          <motion.p
            className="text-white text-lg md:text-xl font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            Where you, <span className="font-bold text-white">251 attendees</span>
            <br />
            and <span className="font-bold text-white">91 delegates</span>
          </motion.p>

          {/* Final Call-to-Action */}
          <motion.p
            className="text-white text-xl md:text-2xl italic font-serif drop-shadow-[0_0_20px_#4488FF]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <span className="font-bold">Got their</span> <span className="italic">start.</span>
          </motion.p>
        </motion.div>
      </motion.div>
    </NavBarContainer>
  );
}

export default BlueprintSummary