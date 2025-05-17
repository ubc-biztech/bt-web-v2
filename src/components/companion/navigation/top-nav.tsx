import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Menu } from "lucide-react";
import NavbarLogo from "@/assets/2025/productx/navbar_logo.png";
import Triangle from "@/assets/2025/productx/custom-arrow.svg";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { COMPANION_EMAIL_KEY, TEAM_NAME } from "@/constants/companion";
interface TopNavProps {
  onMenuClick: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
  first_last: string | undefined;
}

export const TopNav: React.FC<TopNavProps> = ({
  onMenuClick,
  isOpen,
  first_last,
}) => {
  return (
    <motion.div
      className="flex justify-between items-center p-6"
      initial={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
        delay: 0.1,
      }}
    >
      <div className="relative w-32 h-8">
        <Link href="/companion">
          <Image
            src={NavbarLogo}
            alt="ProductX Logo"
            fill
            className="object-contain"
            priority
          />
        </Link>
      </div>
      <div className="font-ibm flex flex-col mr-10">
        <span>Logged in as:</span>
        <div
          className="flex flex-row cursor-pointer select-none"
          onClick={() => {
            onMenuClick(!isOpen);
          }}
        >
          <span className="text-[#898BC3] font-bold mr-2">{first_last}</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transformOrigin: "center",
            }}
          >
            <Image src={Triangle} width={15} height={15} alt="toggle menu" />
          </motion.div>
        </div>
      </div>
      {/* <button 
        onClick={onMenuClick}
        className="p-2 hover:bg-[#1C1C1C] rounded-lg transition-colors"
      >
        <Menu className="w-6 h-6 text-white" />
      </button> */}
    </motion.div>
  );
};
