import React, { useEffect, useState } from "react";

interface BoxProps {
    width: number;
    height: number;
    className: string;
    children: React.ReactNode;
    hoverEffects?: boolean;
    selectableEffects?: boolean;
    selected?: boolean;
    fitToParent?: boolean;
    handleClick?: () => void;
}

const Box: React.FC<BoxProps> = ({
    width,
    height,
    className,
    children,
    hoverEffects = false,
    selectableEffects = false,
    selected = false,
    fitToParent = false,
    handleClick = () => {},
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isSelected, setIsSelected] = useState(false);
    const defaultEffects = !(hoverEffects || selectableEffects);
    const shadowSize = 2 * Math.min(width, height);
    let baseStyles;
    if (fitToParent) {
        baseStyles = `
        w-full
        h-full
        ${className}
    `;
    } else {
        baseStyles = `
            w-${width}
            h-${height}
            ${className}
        `;
    }

    const defaultBoxStyles = defaultEffects
        ? "border-2 border-[#1B1C39] bg-[#020319]"
        : "";

    const hoverBoxStyles =
        hoverEffects && !selectableEffects
            ? "border-2 border-[#1B1C39] bg-[#020319]"
            : "";

    const selectableBoxStyles = selectableEffects
        ? `border-2 ${
              isSelected
                  ? "border-[#23655F] text-[#4CC8BD]"
                  : "border-[#1B1C39]"
          } bg-[#020319]`
        : "";

    const boxShadowStyle = () => {
        if (defaultEffects) {
            return {
                boxShadow: `inset 0 0 ${shadowSize}px rgba(39, 40, 76, 1)`,
            };
        } else if (hoverEffects && !selectableEffects) {
            return {
                boxShadow: `inset 0 0 ${shadowSize}px rgba(${
                    isHovered ? 203 : 39
                }, ${isHovered ? 204 : 40}, ${isHovered ? 233 : 76}, ${
                    isHovered ? 0.5 : 1
                })`,
                transition:
                    "filter 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease-in-out",
            };
        } else if (selectableEffects) {
            return {
                boxShadow: `inset 0 0 ${shadowSize}px rgba(
                    ${isSelected ? 76 : isHovered ? 203 : 39}, 
                    ${isSelected ? 200 : isHovered ? 204 : 40}, 
                    ${isSelected ? 189 : isHovered ? 233 : 76}, 
                    ${isSelected ? 0.5 : isHovered ? 0.5 : 1})`,
                transition:
                    "filter 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease-in-out",
            };
        }
        return {};
    };

    useEffect(() => {
        setIsSelected(selected);
    }, [selected]);

    return (
        <div
            className={`
                ${baseStyles}
                ${defaultBoxStyles}
                ${hoverBoxStyles}
                ${selectableBoxStyles}
            `}
            style={boxShadowStyle()}
            onMouseEnter={() => hoverEffects && setIsHovered(true)}
            onMouseLeave={() => hoverEffects && setIsHovered(false)}
            onClick={() => {
                setIsSelected(!isSelected);
                handleClick();
            }}
        >
            {children}
        </div>
    );
};

export default Box;
