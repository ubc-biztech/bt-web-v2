import type { ReactNode } from "react";

type ActionButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
};

/** Unstyled placeholder — see the HelloHacks design system ticket. */
export function ActionButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: ActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full bg-blue-500 px-8 py-3 font-semibold text-white disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
