import React from "react";

interface BoxProps {
    width: number;
    height: number;
    className: string;
    children: React.ReactNode;
    hoverEffects?: boolean;
    selectableEffects?: boolean;
}

const Box: React.FC<BoxProps> = ({
    width,
    height,
    className,
    children,
    hoverEffects = false,
    selectableEffects = false,
}) => {
    const defaultEffects = !(hoverEffects || selectableEffects);

    return (
        <div
            className={`
                ${defaultEffects && "border-2 border-[#1B1C39] bg-[#020319] "} 
                ${hoverEffects && ""} 
                ${selectableEffects && ""} 
                ${className}
                w-${width}
                h-${height}
            `}
            style={defaultEffects ? { boxShadow: `inset 0 0 ${2 * Math.min(width, height)}px rgba(39, 40, 76, 1)` } : {}}
        >
            {children}
        </div>
    );
};

export default Box;
