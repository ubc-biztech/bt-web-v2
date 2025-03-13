import React from "react";
import type { LucideIcon } from "lucide-react";

interface ButtonProps {
    label: string;
    Icon: LucideIcon;
    className: string;
    onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({
    label,
    Icon,
    className = "",
    onClick,
}) => {
    return (
        <div
            className={ 
                `flex flex-row items-center pl-10 gap-2 cursor-pointer transition-colors ${className}`
            }
            onClick={() => onClick}
        >
            <Icon size={20} />
            {label}
        </div>
    );
};

export default Button;
