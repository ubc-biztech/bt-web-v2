"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import homeIcon from "@/assets/2025/productx/home.svg";
import rubricIcon from "@/assets/2025/productx/rubric.svg";
import signOutIcon from "@/assets/2025/productx/signOut.svg";
import { COMPANION_EMAIL_KEY, TEAM_NAME } from "@/constants/companion";
import SimpleBox from "../productX/ui/Box";

interface PopupMenuProps {
  isOpen: boolean;
}

const navLinks = [{ href: "/companion", label: "Sign out", icon: signOutIcon }];

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
          className="fixed top-0 right-0 mr-14 mt-32 z-50 w-56 h-16"
          variants={menuVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <SimpleBox
            innerShadow={40}
            className="flex flex-col justify-center"
            hoverEffects={true}
          >
            {navLinks.map(({ href, label, icon }) => (
              <Link
                key={label}
                href={href}
                className="flex flex-row items-center text-sm text-white font-ibm ml-8 tracking-wider py-2"
                onClick={(e) => {
                  if (label === "Sign out") {
                    e.preventDefault(); // Prevent default link behavior
                    handleSignOut();
                  }
                }}
              >
                <Image
                  src={icon}
                  width={20}
                  height={20}
                  alt="icon"
                  className="mr-3"
                />
                {label}
              </Link>
            ))}
          </SimpleBox>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};
