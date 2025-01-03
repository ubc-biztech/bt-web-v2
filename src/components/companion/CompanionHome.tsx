import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users2, Trophy } from 'lucide-react';
import { GradientText } from '@/components/ui/gradient-text';
import { TopNav } from './navigation/top-nav';
import { SideNav } from './navigation/side-nav';
import { BottomNav } from './navigation/bottom-nav';
import { BadgesList } from './badges/badges-list';
import { ConnectionsList } from './connections/connections-list';

interface CompanionHomeProps {
  userName: string;
  connectionCount: number;
  badgeCount: number;
  badges: Array<{
    name: string;
    description: string;
  }>;
  recentConnections: Array<{
    id: string;
    name: string;
    role: string;
    avatarInitials: string;
    avatarColor?: string;
  }>;
}

const CompanionHome: React.FC<CompanionHomeProps> = ({
  userName,
  connectionCount,
  badgeCount,
  badges,
  recentConnections,
}) => {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white font-satoshi md:p-8">
      <TopNav onMenuClick={() => setIsSideNavOpen(true)} />
      <SideNav isOpen={isSideNavOpen} onClose={() => setIsSideNavOpen(false)} />

      <motion.div 
        className="flex-1 px-2 pb-24 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Section */}
        <motion.div className="p-5 rounded-3xl" variants={itemVariants}>
          <div className="text-[28px] font-medium mb-3 text-white">
            Welcome, <GradientText>{userName}</GradientText>
          </div>
          <div className="text-[#808080] text-[28px] font-satoshi flex items-center flex-wrap gap-x-2">
            You&apos;ve made 
            <span className="text-white font-medium font-satoshi inline-flex items-center gap-2">
              <Users2 className="w-6 h-6" strokeWidth={1.5} />
              {connectionCount} connections
            </span> 
            and collected{' '}
            <span className="text-white font-medium font-satoshi inline-flex items-center gap-2">
              <Trophy className="w-6 h-6" strokeWidth={1.5} />
              {badgeCount} badges
            </span> 
            so far.
          </div>
        </motion.div>

        {/* Badges Section */}
        <motion.div variants={itemVariants}>
          <BadgesList badges={badges} />
        </motion.div>

        {/* Recent Connections Section */}
        <motion.div variants={itemVariants}>
          <ConnectionsList 
            connections={recentConnections} 
            totalCount={connectionCount} 
          />
        </motion.div>
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default CompanionHome; 