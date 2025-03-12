import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";
import NavbarLogo from "@/assets/2025/blueprint/navbar_logo.png";

interface PopupMenuProps {
    isOpen: boolean;
}

const navLinks = [
    { href: "/companion", label: "Home" },
    { href: "/companion/profile", label: "Rubric" },
    { href: "/companion", label: "Sign out" },
];

export const PopupMenu: React.FC<PopupMenuProps> = ({ isOpen }) => {
    return (
        <>
            {isOpen && (
                <nav className="space-y-6 absolute top-0 right-0 bg-[#040C12] w-64 p-8 mt-32 z-50">
                    {navLinks.map(({ href, label }) => {
                        return (
                            <Link
                                key={href}
                                href={href}
                                className="flex flex-row-reverse items-center gap-3 text-[22px] py-2 text-white hover:text-gray-300 transition-colors"
                            >
                                <span className="text-lg text-white">↗</span>
                                {label}
                            </Link>
                        );
                    })}
                </nav>
            )}
        </>
    );
};
