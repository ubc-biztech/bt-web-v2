import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface SideNavProps {
  isPartner: boolean | undefined;
}

const navLinks = [
  { href: "/events/blueprint/2026/companion", label: "Home" },
  { href: "/events/blueprint/2026/companion/profile", label: "User Profile" },
  {
    href: "/events/blueprint/2026/companion/connections",
    label: "Connections",
  },
  { href: "/events/blueprint/2026/companion/quests", label: "Quests" },
  {
    href: "/events/blueprint/2026/companion/partner-database",
    label: "Partner Database",
  },
  { href: "/events/blueprint/2026/companion/companies", label: "Companies" },
];

export const BluePrintNav: React.FC<SideNavProps> = ({ isPartner }) => {
  const controls = useAnimation();

  const [isOpen, setIsOpen] = useState(false);

  React.useEffect(() => {
    controls.start({
      x: isOpen ? 0 : "100%",
      transition: { duration: 0.2, ease: "easeOut" },
    });
  }, [isOpen, controls]);

  const handleDragEnd = async (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      setIsOpen((state) => !state);
    } else {
      controls.start({ x: 0 });
    }
  };

  return (
    <>
      <div>
        <div className="flex flex-row justify-between mx-4 mt-4">
          <Link href="/events/blueprint/2026/companion">
            <Image
              src={"/assets/blueprint/blueprint-logo.png"}
              height={72}
              width={96}
              alt="BluePrint"
            />
          </Link>
          <button onClick={() => setIsOpen((state) => !state)}>
            <Menu />
          </button>
        </div>
        <div className="h-[0.5px] mt-4 w-full bg-gradient-to-r from-transparent via-white to-transparent" />
      </div>
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-[40] transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setIsOpen((state) => !state)}
      />

      <motion.div
        className={cn(
          "fixed top-0 right-0 w-80 h-full bg-[#050C19]/30 backdrop-blur-xl border-l border-white/10 z-50 touch-pan-y",
          !isOpen && "pointer-events-none",
        )}
        initial={{ x: "100%" }}
        animate={controls}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        dragDirectionLock
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col h-full p-8">
          <div className="flex justify-end mb-8">
            <button
              onClick={() => setIsOpen((state) => !state)}
              className="p-2 text-white hover:text-gray-300"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-col space-y-8 h-full">
            <Link href="/events/blueprint/2026/companion">
              <Image
                src={"/assets/blueprint/blueprint-logo.png"}
                height={108}
                width={164}
                alt="BluePrint"
                className="mb-8"
              />
            </Link>
            {navLinks.map(({ href, label }) => {
              if (label === "Badges" && isPartner) return null;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen((state) => !state)}
                  className="flex items-center gap-3 text-md text-white hover:text-gray-300"
                >
                  {label}
                  <ArrowUpRight size={24} />
                </Link>
              );
            })}
          </nav>
        </div>
      </motion.div>
    </>
  );
};
