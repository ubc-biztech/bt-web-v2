import type React from "react";

type ActionButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
};

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
      className={`
        inline-flex min-h-[69px] w-[422px] items-center justify-center gap-3
        rounded-full bg-[#947FFE] px-8 py-4
        text-2xl font-[800] leading-none text-white
        transition-all duration-200
        hover:bg-[#B2A3FF]
        active:scale-[0.98]
        focus-visible:outline-none focus-visible:ring-4
        focus-visible:ring-[#B2A3FF]/50
        disabled:cursor-not-allowed disabled:opacity-50
        group
        ${className}
      `}
    >
      <span>{children}</span>

      <span
        aria-hidden="true"
        className="text-[1.35em] font-normal transition-transform duration-200 group-hover:translate-x-1"
      >
        →
      </span>
    </button>
  );
}
