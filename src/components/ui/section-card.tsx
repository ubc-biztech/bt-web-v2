import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedBorder } from './animated-border';
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
    <AnimatedBorder>
      <Card className={cn("bg-black rounded-2xl p-8", className)}>
        <div className="flex justify-between items-center mb-4">
          <p className="text-[22px] font-satoshi font-bold text-white">{title}</p>
          {viewAllLink && (
            <Link href={viewAllLink}>
              <AnimatedBorder rounded="rounded-full" padding="1px">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative text-white hover:bg-[#2A2A2A] transition-all rounded-full py-2.5 px-4 font-redhat tracking-wider text-xs font-[300] backdrop-blur-sm flex items-center gap-1.5 border border-white/40"
                >
                  <span className="translate-y-[1px]">VIEW ALL</span>
                  <span className="text-base translate-y-[1px]">↗</span>
                </Button>
              </AnimatedBorder>
            </Link>
          )}
        </div>
        {children}
      </Card>
    </AnimatedBorder>
  );
}; 