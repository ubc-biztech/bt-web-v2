"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { COMPANION_EMAIL_KEY, TEAM_NAME } from "@/constants/companion";
import SimpleBox from "../productX/ui/Box";
import { LogOut } from "lucide-react";

interface PopupMenuProps {
  isOpen: boolean;
}

const navLinks = [{ href: "/companion", label: "Sign out", icon: LogOut }];

const menuVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.3,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.3,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
};

export const PopupMenu: React.FC<PopupMenuProps> = ({ isOpen }) => {
  const handleSignOut = () => {
    console.log("Signing out...");
    localStorage.removeItem(COMPANION_EMAIL_KEY);
    localStorage.removeItem(TEAM_NAME);
    window.location.reload(); // force a rerender
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.nav
          className="relative"
          variants={menuVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="absolute right-0 mt-2 w-48 bg-[#1A1A1A] border border-white/10 rounded-md shadow-lg z-50 hover:bg-[#222222] transition-colors duration-200 ease-out">
            {navLinks.map(({ href, label, icon: NavIcon }) => (
              <Link
                key={label}
                href={href}
                className="flex flex-row gap-2 items-center text-sm text-white font-ibm tracking-wider p-2 px-4"
                onClick={(e) => {
                  if (label === "Sign out") {
                    e.preventDefault(); // Prevent default link behavior
                    handleSignOut();
                  }
                }}
              >
                <NavIcon width={20} height={20} />
                {label}
              </Link>
            ))}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};
