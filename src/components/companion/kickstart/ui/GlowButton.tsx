import React from "react";
import { Component } from "lucide-react";

interface GlowButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: typeof Component;
  height?: string;
  width?: string;
  className?: string;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  href,
  onClick,
  children,
  icon: Icon,
  height = "h-12",
  width = "w-48",
  className = "",
}) => {
  const buttonClasses = `
    ${width} ${height}
    ${height === "h-fit" ? "py-3" : ""}
    flex items-center justify-center 
    transition-all duration-300 ease-in-out
    bg-[#1D1D1D] 
    text-white 
    font-bricolage 
    border-[1px] border-white 
    rounded-sm
    shadow-[inset_0_0_5px_rgba(255,255,255,0.5),inset_0_0_30px_rgba(255,255,255,0.25)]
    hover:bg-[#1f1f1f] 
    hover:shadow-[inset_0_0_7px_rgba(255,255,255,0.7),inset_0_0_45px_rgba(255,255,255,0.4)]
    ${className}
  `;

  const content = (
    <>
      {Icon && (
        <span className="mr-2">
          <Icon size={18} />
        </span>
      )}

      <span className="truncate flex flex-row items-center justify-center">
        {children}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={buttonClasses} type="button">
        {content}
      </button>
    );
  }

  return (
    <a href={href} className={buttonClasses} role="button">
      {content}
    </a>
  );
};
