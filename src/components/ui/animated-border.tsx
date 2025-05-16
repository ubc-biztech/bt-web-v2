import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  innerClassName?: string;
  padding?: string;
  rounded?: string;
}

export const AnimatedBorder: React.FC<AnimatedBorderProps> = ({
  children,
  className,
  innerClassName,
  padding = "1px",
  rounded = "rounded-[12px]",
  ...props
}) => {
  return (
    <div className={cn("relative p-[2px]", rounded, className)} {...props}>
      {/* Animated gradient border */}
      <div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          background:
            "linear-gradient(90deg, #BCC5E3, rgba(188, 197, 227, 0.1), #BCC5E3)",
          backgroundSize: "200% 100%",
          animation: "borderAnimation 6s linear infinite",
          opacity: 0.8,
        }}
      />

      {/* Content */}
      <div
        className={cn("relative rounded-[11px] bg-black", innerClassName)}
        style={{ padding }}
      >
        {children}
      </div>
    </div>
  );
};
