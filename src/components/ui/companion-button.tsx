import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CompanionButtonProps {
  href?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const CompanionButton: React.FC<CompanionButtonProps> = ({
  href,
  children,
  className,
  onClick,
}) => {
  const ButtonContent = (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "relative bg-black text-white hover:text-white hover:bg-white/10 transition-all rounded-full py-5 px-5",
        "font-redhat tracking-wider text-xs font-[300] backdrop-blur-sm flex items-center gap-1.5",
        "before:absolute before:inset-0 before:rounded-full",
        "before:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.14),rgba(255,255,255,0.30)_98%)]",
        "before:pointer-events-none",
        "border border-white/80",
        className,
      )}
    >
      {children}
    </Button>
  );

  if (href) {
    return <Link href={href}>{ButtonContent}</Link>;
  }

  return ButtonContent;
};
