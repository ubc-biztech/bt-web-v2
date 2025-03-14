import React from 'react';
import { Card } from '@/components/ui/card';
import { AnimatedBorder } from './animated-border';
import { CompanionButton } from './companion-button';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  title: string;
  viewAllLink?: string;
  className?: string;
  children: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  viewAllLink,
  className,
  children
}) => {
  return (
    <AnimatedBorder className="w-full">
      <div className={cn("w-full", className)}>
        <div className="p-8 bg-[#030B13] rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[22px] font-satoshi font-bold text-white">{title}</p>
            {viewAllLink && (
              <CompanionButton href={viewAllLink}>
                <span className="text-[12px] translate-y-[1px]">VIEW ALL</span>
                <span className="text-lg translate-y-[-3px]">↗</span>
              </CompanionButton>
            )}
          </div>
          <div className="h-[1px] bg-white/10 mb-4" />
          {children}
        </div>
      </div>
    </AnimatedBorder>
  );
}; 