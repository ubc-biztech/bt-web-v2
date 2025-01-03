import React from 'react';
import { cn } from '@/lib/utils';
import styles from './styles/animations.module.css';

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
    <div className={cn(rounded, styles.animatedBorder, `p-[${padding}]`, className)} {...props}>
      {children}
    </div>
  );
}; 