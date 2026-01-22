"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  animate,
} from "framer-motion";

interface TopCompaniesProps {
  isPartner: boolean;
}

// Combined stats between amazon and aws, as well as google and google cloud
const topCompanies = [
  {
    rank: 1,
    name: "Amazon",
    taps: 107,
    logo: "https://biztech-pfp.s3.us-west-2.amazonaws.com/companies/amazon.png",
  },
  {
    rank: 2,
    name: "Electronic Arts",
    taps: 64,
    logo: "https://biztech-pfp.s3.us-west-2.amazonaws.com/companies/ea.png",
  },
  {
    rank: 3,
    name: "Google",
    taps: 59,
    logo: "https://biztech-pfp.s3.us-west-2.amazonaws.com/companies/google.png",
  },
  {
    rank: 4,
    name: "Meta",
    taps: 57,
    logo: "https://biztech-pfp.s3.us-west-2.amazonaws.com/companies/meta.png",
  },
  {
    rank: 5,
    name: "SAP",
    taps: 44,
    logo: "https://biztech-pfp.s3.us-west-2.amazonaws.com/companies/sap.png",
  },
];

const TopCompanies = ({ isPartner }: TopCompaniesProps) => {
  const [isTapped, setIsTapped] = useState(false);
  const router = useRouter();
  const opacity = useMotionValue(1);
  const scale = useMotionValue(1);
  const y = useMotionValue(0);

  const handleTap = () => {
    setIsTapped(true);
    animate(opacity, 0, { duration: 0.5 });
    animate(scale, 0.8, { duration: 0.5 });
    animate(y, 20, { duration: 0.5 });
    setTimeout(() => {
      router.push("/companion/wrapped/startPage");
    }, 800);
  };
  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center p-6 pt-12 overflow-y-auto overflow-x-hidden"
      onClick={handleTap}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ opacity, scale, y }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
    >
        <motion.h1
          className="text-white text-sm md:text-lg font-satoshi font-medium px-4 max-w-lg text-center mb-6 
                        drop-shadow-[0_0_10px_rgba(68,136,255,0.6)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          People connected with many different companies, big and small.
          <br />
          Here are the{" "}
          <span className="font-satoshi font-bold">overall top 5.</span>
        </motion.h1>

        {/* Company Rankings */}
        <div className="w-full max-w-lg mt-8 space-y-6">
          <div className="h-px bg-gradient-to-r from-[#88baff]/0 via-[#ffffff] to-[#88baff]/0"></div>
          {topCompanies.map((company) => (
            <motion.div
              key={company.rank}
              className="flex flex-wrap items-center bg-transparent rounded-lg p-4 gap-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * company.rank }}
            >
              {/* Rank Number */}
              <p className="text-white text-3xl font-bold w-8 text-center">
                {company.rank}
              </p>

              {/* Logo inside white circular background */}
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-md flex-shrink-0 overflow-hidden aspect-square">
                <Image
                  src={company.logo}
                  alt={company.name}
                  width={60}
                  height={60}
                  className="object-contain w-full h-full"
                />
              </div>

              {/* Company Name & NFC Tap Count */}
              <div className="flex flex-col flex-1">
                <p className="text-white text-lg font-satoshi font-bold">
                  {company.name}
                </p>
                <p className="text-gray-400 text-sm font-satoshi">
                  {company.taps} NFC taps
                </p>
              </div>
            </motion.div>
          ))}
      </div>
    </motion.div>
  );
};

export default TopCompanies;
