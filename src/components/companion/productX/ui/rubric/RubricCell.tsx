import React, { useEffect, useState } from "react";

interface BoxProps {
    innerShadow: number;
    className: string;
    children: React.ReactNode;
    selected?: boolean;
    handleClick?: () => void;
}

const RubricCell: React.FC<BoxProps> = ({
    innerShadow,
    className,
    children,
    selected = false,
    handleClick = () => {},
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isSelected, setIsSelected] = useState(false);
    const shadowSize = 2 * innerShadow;

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
        selected: {
            boxShadow: `inset 0 0 ${shadowSize}px rgba(
                  ${isSelected ? 76 : isHovered ? 203 : 39}, 
                  ${isSelected ? 200 : isHovered ? 204 : 40}, 
                  ${isSelected ? 189 : isHovered ? 233 : 76}, 
                  ${isSelected ? 0.5 : isHovered ? 0.5 : 1})`,
            transition:
                "filter 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease-in-out",
        },
    };

    useEffect(() => {
        setIsSelected(selected);
    }, [selected]);

    return (
        <div
            className={`
        w-full
        h-full
        ${className}
border-2 ${
                isSelected
                    ? "border-[#23655F] text-[#4CC8BD]"
                    : "border-[#1B1C39]"
            } bg-[#020319]
            `}
            style={isSelected ? styles.selected : isHovered ? styles.hover : styles.default}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => {
                handleClick();
            }}
        >
            {children}
        </div>
    );
};

export default RubricCell;
