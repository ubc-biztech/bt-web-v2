import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CompanionItemRowProps {
  href?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const CompanionItemRow: React.FC<CompanionItemRowProps> = ({
  href,
  children,
  className,
  onClick
}) => {
  const RowContent = (
    <div
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-between my-4 p-2.5 py-3 rounded-xl transition-colors",
        "border border-white/30 hover:bg-white/10 cursor-pointer",
        "before:absolute before:inset-0 before:rounded-xl",
        "before:bg-[linear-gradient(to_top,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0.05)_25%,transparent_50%)]",
        "before:pointer-events-none",
        className
      )}
    >
      {children}
    </div>
  );

  if (href) {
    return <Link href={href}>{RowContent}</Link>;
  }

  return RowContent;
}; 