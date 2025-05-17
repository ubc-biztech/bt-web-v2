import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConnectedButtonProps {
  href?: string;
  children: React.ReactNode;
  className?: string;
}

export const ConnectedButton: React.FC<ConnectedButtonProps> = ({
  children,
  className,
}) => {
  const ButtonContent = (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "relative bg-black text-neon-green hover:text-white hover:bg-neon-green/10 transition-all rounded-full py-5 px-5",
        "font-redhat tracking-wider text-xs font-[300] backdrop-blur-sm flex items-center gap-1.5",
        "before:absolute before:inset-0 before:rounded-full",
        "before:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.10),rgba(255,255,255,0.25)_98%)]",
        "before:pointer-events-none",
        "border border-neon-green/80",
        className,
      )}
    >
      {children}
    </Button>
  );

  return ButtonContent;
};
