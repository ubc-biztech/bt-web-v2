import React from 'react';
import { SectionCard } from '@/components/ui/section-card';

interface Badge {
  name: string;
  description: string;
}

interface BadgesListProps {
  badges: Badge[];
}

export const BadgesList: React.FC<BadgesListProps> = ({ badges }) => {
  return (
    <SectionCard title="Badges" viewAllLink="/companion/badges">
      <div className="space-y-3">
        {badges.map((badge, index) => (
          <div key={index} className="flex items-start space-x-3">
            <span className="text-base mt-1 text-white">✦</span>
            <div className="flex flex-col sm:flex-row sm:items-center w-full sm:justify-between gap-1">
              <p className="text-sm font-medium text-white">{badge.name}</p>
              <p className="text-[#808080] text-xs">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}; 