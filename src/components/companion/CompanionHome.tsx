import React from 'react';
import { motion } from 'framer-motion';
import { Users2, Trophy } from 'lucide-react';
import { GradientText } from '@/components/ui/gradient-text';
import { BadgesList } from './badges/badges-list';
import { Connection, ConnectionsList } from './connections/connections-list';
import { Badge } from '@/pages/companion/badges';
import NavBarContainer from './navigation/NavBarContainer';

interface CompanionHomeProps {
  isPartner: boolean | undefined,
  userName: string;
  connectionCount: number;
  badgeCount: number;
  badges: Badge[] | null;
  connections: Connection[];
}

const CompanionHome: React.FC<CompanionHomeProps> = ({
  isPartner,
  userName,
  connectionCount,
  badgeCount,
  badges,
  connections,
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
    <NavBarContainer isPartner={isPartner}>
      {/* Welcome Section */}
      <motion.div className="font-[500] p-5 rounded-3xl" variants={itemVariants}>
        <div className="text-[28px] font-medium mb-3 text-white">
          Welcome, <GradientText>{userName}</GradientText>
        </div>
        <div className="text-[#808080] text-[18px] font-satoshi flex flex-col gap-2">
          <div className="flex gap-2 max-[344px]:flex-col">
            You&apos;ve made
            <span className="text-white font-medium font-satoshi inline-flex items-center gap-2">
              <Users2 className="w-6 h-6" strokeWidth={1.5} />
              {connectionCount} connections
            </span>
            {
              isPartner ? 'so far.'
              : 'and'
            }
          </div>
          {
            !isPartner &&
            <div className="flex gap-2 max-[344px]:flex-col">
              collected{' '}
              <span className="text-white font-medium font-satoshi inline-flex items-center gap-2">
                <Trophy className="w-6 h-6" strokeWidth={1.5} />
                {badgeCount} badges
              </span>
              so far.
            </div>
          }
        </div>
      </motion.div>


      {/* Badges Section – rendered only if not partner */}
      {badges && 
        <motion.div variants={itemVariants}>
          <BadgesList badges={badges} />
        </motion.div>
      }

      {/* Connections Section */}
      {
        isPartner ? 
        <motion.div variants={itemVariants}>
          <ConnectionsList
            connections={connections}
            totalCount={connectionCount}
          />
        </motion.div> 
        :
        <motion.div variants={itemVariants}>
          <ConnectionsList
            connections={connections.slice(0,3)}
            totalCount={connectionCount}
          />
        </motion.div> 
      }
    </NavBarContainer>
  );
};

export default CompanionHome; 