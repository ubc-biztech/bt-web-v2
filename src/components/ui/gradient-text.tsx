import React from 'react';
import { cn } from '@/lib/utils';

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  gradient?: string;
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  className,
  gradient = 'linear-gradient(-60deg, #87CEEB, #0055b3, #87CEEB, #003d80)',
  ...props
}) => {
  const gradientStyle: React.CSSProperties = {
    background: gradient,
    backgroundSize: '400% 400%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'nameGradient 6s ease infinite',
    display: 'inline-block',
    fontWeight: 700
  };

  return (
    <span 
      style={gradientStyle}
      className={cn(className)} 
      {...props}
    >
      {children}
    </span>
  );
}; 