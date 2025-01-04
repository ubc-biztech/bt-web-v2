import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: string;
  rounded?: string;
}

export const AnimatedBorder: React.FC<AnimatedBorderProps> = ({
  children,
  className,
  padding = '1px',
  rounded = 'rounded-2xl',
  ...props
}) => {
  return (
    <div className={cn('relative p-[2px]', rounded, className)} {...props}>
      {/* Animated gradient border */}
      <div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.5))',
          backgroundSize: '200% 100%',
          animation: 'borderAnimation 6s linear infinite',
          opacity: 0.8
        }}
      />
      
      {/* Content */}
      <div className="relative rounded-[inherit] bg-black" style={{ padding }}>
        {children}
      </div>
    </div>
  );
}; 