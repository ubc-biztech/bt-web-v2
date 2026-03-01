import React from "react";
import type { LucideIcon } from "lucide-react";

interface ButtonProps {
  label: string;
  Icon: LucideIcon | null;
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
    <button
      type="button"
      className={`flex flex-row items-center justify-center gap-2 cursor-pointer transition-colors ${className}`}
      onClick={onClick}
    >
      <span>{label}</span>
      {Icon && <Icon size={20} />}
    </button>
  );
};

export default Button;
