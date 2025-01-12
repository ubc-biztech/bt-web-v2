import React from 'react';
import { SectionCard } from '@/components/ui/section-card';
import { Badge } from '@/pages/companion/badges';
interface BadgesListProps {
  badges: Badge[];
}

export const BadgesList: React.FC<BadgesListProps> = ({ badges }) => {
  return (
    <SectionCard title="Badges" viewAllLink="/companion/badges">
      <div className="space-y-3">
        {badges.filter((badge) => badge.isComplete).length === 0 ? (
          <p className="font-redhat font-thin text-[14px] flex justify-center text-center">
            NO BADGES COLLECTED YET
          </p>
        ) : (
          badges
            .filter((badge) => badge.isComplete)
            .slice(0, 3)
            .map((badge, index) => (
              <div key={index} className="flex items-start space-x-3">
                <span className="text-base mt-1 text-white">✦</span>
                <div className="flex flex-col sm:flex-row sm:items-center w-full sm:justify-between gap-1">
                  <p className="text-sm font-medium text-white">
                    {badge.badgeName}
                  </p>
                  <p className="text-[#808080] text-xs">{badge.description}</p>
                </div>
              </div>
            ))
        )}
      </div>
    </SectionCard>
  );
}; 