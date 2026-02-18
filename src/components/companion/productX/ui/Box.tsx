import React, { useState } from "react";

interface BoxProps {
  innerShadow: number;
  className: string;
  children: React.ReactNode;
  hoverEffects?: boolean;
  handleClick?: () => void;
}

const Box: React.FC<BoxProps> = ({
  innerShadow,
  className,
  children,
  hoverEffects = false,
  handleClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isClickable = Boolean(handleClick);
  const shadowSize = 2 * innerShadow;
  const baseStyles = `
        w-full
        h-full
        ${className}
    `;

  const styles = {
    default: { boxShadow: `inset 0 0 ${shadowSize}px rgba(39, 40, 76, 1)` },
    hover: {
      boxShadow: `inset 0 0 ${shadowSize}px rgba(${
        isHovered ? 203 : 39
      }, ${isHovered ? 204 : 40}, ${isHovered ? 233 : 76}, ${
        isHovered ? 0.5 : 1
      })`,
      transition:
        "filter 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease-in-out",
    },
  };

  if (isClickable) {
    return (
      <div
        className={`
                  ${baseStyles}
  border-2 border-[#1B1C39] bg-[#020319] cursor-pointer
              `}
        style={isHovered ? styles.hover : styles.default}
        onMouseEnter={() => hoverEffects && setIsHovered(true)}
        onMouseLeave={() => hoverEffects && setIsHovered(false)}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick?.();
          }
        }}
        role="button"
        tabIndex={0}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`
                ${baseStyles}
border-2 border-[#1B1C39] bg-[#020319]
            `}
      style={isHovered ? styles.hover : styles.default}
      onMouseEnter={() => hoverEffects && setIsHovered(true)}
      onMouseLeave={() => hoverEffects && setIsHovered(false)}
    >
      {children}
    </div>
  );
};

export default Box;
