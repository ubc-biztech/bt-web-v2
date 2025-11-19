import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import NavbarLogo from "@/assets/2025/kickstart/logo.png";
import Triangle from "@/assets/2025/productx/custom-arrow.svg";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { COMPANION_EMAIL_KEY, TEAM_NAME } from "@/constants/companion";
import { PopupMenu } from "./popup-menu";
interface TopNavProps {
  onMenuClick: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
  first_last: string | undefined;
  status: "Participant" | "Audience" | "Judge" | "Exec";
}

export const TopNav: React.FC<TopNavProps> = ({
  onMenuClick,
  isOpen,
  first_last,
  status,
}) => {
  return (
    <motion.div
      className="flex justify-between items-start font-bricolage pt-0"
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
            alt="Kickstart Logo"
            fill
            className="object-contain"
            priority
          />
        </Link>
      </div>
      <div className="flex flex-col">
        {" "}
        <div
          className="flex flex-row cursor-pointer select-none items-center gap-4 mb-2"
          onClick={() => {
            onMenuClick(!isOpen);
          }}
        >
          <div
            className={`
              w-10 h-10 
              relative overflow-hidden 
              rounded-full 
              bg-white/10
              flex items-center justify-center 
              text-white/80
              text-sm
              font-light
              leading-none
            `}
            title={`Profile Picture`}
          >
            <span className="select-none text-[20px]">
              {first_last ? first_last[0] : "?"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold mr-2 text-md text-center">
              {first_last}
            </span>

            <span className="-mt-1 text-[12px] text-white/80">{status}</span>
          </div>
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
            <ChevronDown className="w-6 h-6 text-white" />
          </motion.div>
        </div>
        <PopupMenu isOpen={isOpen} />
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
