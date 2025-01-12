import React from 'react';
import { motion } from 'framer-motion';
import { Users2, Trophy } from 'lucide-react';
import { GradientText } from '@/components/ui/gradient-text';
import { BadgesList } from './badges/badges-list';
import { Connection, ConnectionsList } from './connections/connections-list';
import NavBarContainer from './navigation/NavBarContainer';

interface CompanionHomeProps {
  userName: string;
  connectionCount: number;
  badgeCount: number;
  badges: Array<{
    name: string;
    description: string;
  }>;
  recentConnections: Connection[];
}

const CompanionHome: React.FC<CompanionHomeProps> = ({
  userName,
  connectionCount,
  badgeCount,
  badges,
  recentConnections,
}) => {

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
    <NavBarContainer>
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
      </NavBarContainer>
  );
};

export default CompanionHome; 