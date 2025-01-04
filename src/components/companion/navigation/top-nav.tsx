import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import NavbarLogo from '@/assets/2025/blueprint/navbar_logo.png';

interface TopNavProps {
  onMenuClick: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onMenuClick }) => {
  return (
    <motion.div 
      className="flex justify-between items-center p-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
        delay: 0.1
      }}
    >
      <div className="relative w-32 h-8">
        <Image
          src={NavbarLogo}
          alt="BluePrint Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      <button 
        onClick={onMenuClick}
        className="p-2 hover:bg-[#1C1C1C] rounded-lg transition-colors"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>
    </motion.div>
  );
}; 