import React from 'react';
import { Component } from 'lucide-react';

interface GlowButtonProps {
  href: string;
  children: React.ReactNode;
  icon?: typeof Component;
  height?: string;
  width?: string;
  className?: string;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  href,
  children,
  icon: Icon,
  height = "h-12",
  width = "w-48",
  className = "",
}) => {
  return (
    <a
      href={href}
      className={`
        ${width} ${height}
        ${height === "h-fit" ? "py-3" : ""}
        flex items-center justify-center 
        transition-all duration-300 ease-in-out
        bg-[#1D1D1D] 
        text-white 
        font-bricolage 
        border-[1px] border-white 
        rounded-lg
        shadow-[inset_0_0_5px_rgba(255,255,255,0.5),inset_0_0_30px_rgba(255,255,255,0.25)]
        hover:bg-[#1f1f1f] 
        hover:shadow-[inset_0_0_7px_rgba(255,255,255,0.7),inset_0_0_45px_rgba(255,255,255,0.4)]
        ${className}
      `}
      role="button"
    >
      {Icon && (
        <span className="mr-2">
          <Icon size={18} />
        </span>
      )}

      <span className="truncate">{children}</span>
    </a>
  )
}