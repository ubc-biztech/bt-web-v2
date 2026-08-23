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
        group flex size-10 items-center justify-center
        rounded-full bg-[#1E1E1E]
        transition-all duration-200
        hover:bg-[#282828]
        active:scale-95
        focus-visible:outline-none
        focus-visible:ring-4 focus-visible:ring-[#98F3FF]/30
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}
      `}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className="h-[45%] w-[45%] transition-transform duration-200 group-hover:-translate-x-0.5"
      >
        <path
          d="M15 4L7 12L15 20"
          stroke="#98F3FF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
