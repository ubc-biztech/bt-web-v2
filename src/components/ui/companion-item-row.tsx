import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
  onClick,
}) => {
  const rowClassName = cn(
    "relative flex items-center justify-between my-4 p-2.5 py-3 rounded-xl transition-colors",
    "border border-white/30 hover:bg-white/10 cursor-pointer",
    "before:absolute before:inset-0 before:rounded-xl",
    "before:absolute before:inset-0 before:rounded-xl before:[box-shadow:inset_0px_-4px_16px_0px_rgba(255,255,255,0.2)]",
    "before:pointer-events-none",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={rowClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(rowClassName, "w-full text-left")}
    >
      {children}
    </button>
  );
};
