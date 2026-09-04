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
      <span
        aria-hidden="true"
        className="
          block text-center text-[24px] font-normal leading-none
          tracking-normal text-[#98F3FF]
          transition-transform duration-200
          group-hover:-translate-x-0.5
        "
      >
        &#8249;
      </span>
    </button>
  );
}
