import React, { useState, useEffect, ReactNode } from "react";
import { motion } from "framer-motion";
import { TopNav } from "@/components/companion/navigation/top-nav";
import { SideNav } from "@/components/companion/navigation/side-nav";
import { PopupMenu } from "@/components/companion/navigation/popup-menu";

interface NavBarContainerProps {
  isPartner?: boolean | undefined;
  children: ReactNode;
  userName: string;
}

const NavBarContainer: React.FC<NavBarContainerProps> = ({ isPartner, children, userName }) => {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [isPopupMenuOpen, setIsPopupMenuOpen] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-[#020319] text-white font-ibm">
      <div className="fixed top-0 left-0 right-0 z-50 px-2 md:px-8 pt-2 md:pt-8 bg-gradient-to-b from-[#040C12] to-transparent pb-4">
        {/* <TopNav onMenuClick={() => setIsSideNavOpen(true)} /> */}
        <TopNav onMenuClick={setIsPopupMenuOpen} isOpen={isPopupMenuOpen} first_last={userName}/>
      </div>
      {/* <SideNav isPartner={isPartner} isOpen={isSideNavOpen} onClose={() => setIsSideNavOpen(false)} /> */}
      <PopupMenu isOpen={isPopupMenuOpen} />

      <motion.div
        className="flex-1 px-2 mt-20 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col px-2 gap-y-3 mt-4 mb-8">{children}</div>
      </motion.div>
    </div>
  );
};

export default NavBarContainer;
