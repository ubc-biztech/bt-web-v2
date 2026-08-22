type BackButtonProps = {
  onClick?: () => void;
  label?: string;
  disabled?: boolean;
  className?: string;
};

export function BackButton({
  onClick,
  label = "Go back",
  disabled = false,
  className = "",
}: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`
        group flex size-24 items-center justify-center
        rounded-full border-[3px] border-[#2A2A2A]
        bg-[#1C1C1C]
        transition-all duration-200
        hover:border-[#3A3A3A] hover:bg-[#252525]
        active:scale-95
        focus-visible:outline-none
        focus-visible:ring-4 focus-visible:ring-[#98F3FF]/30
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}
      `}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 36"
        fill="none"
        className="h-10 w-7 transition-transform duration-200 group-hover:-translate-x-0.5"
      >
        <path
          d="M19 4L7 18L19 32"
          stroke="#98F3FF"
          strokeWidth="7"
          strokeLinecap="butt"
          strokeLinejoin="miter"
        />
      </svg>
    </button>
  );
}
