import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { motion, useAnimation, PanInfo, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import NavbarLogo from "@/assets/2025/blueprint/navbar_logo.png";

import homeIcon from "@/assets/2025/productx/home.svg";
import rubricIcon from "@/assets/2025/productx/rubric.svg";
import signOutIcon from "@/assets/2025/productx/signOut.svg";

interface PopupMenuProps {
    isOpen: boolean;
}

const navLinks = [
    { href: "/companion", label: "Home", icon: homeIcon },
    { href: "/companion/rubric", label: "Rubric", icon: rubricIcon },
    { href: "/companion", label: "Sign out", icon: signOutIcon },
];

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
    const triggerSignOut = () => {
        console.log("Signing out...");
        localStorage.removeItem("companionEmail");
        window.location.reload(); // force a rerender
    };

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.nav
                    className="flex flex-col justify-evenly absolute top-0 right-0 bg-[#2f3438] w-64 h-40 mr-5 mt-32 z-50 py-4"
                    variants={menuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    {navLinks.map(({ href, label, icon }) => (
                        <Link
                            key={label}
                            href={href}
                            className="flex flex-row items-center text-md text-white font-ibm ml-6 tracking-wider"
                            onClick={() => {
                                if (label === "Sign out") {
                                    triggerSignOut();
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
                </motion.nav>
            )}
        </AnimatePresence>
    );
};
