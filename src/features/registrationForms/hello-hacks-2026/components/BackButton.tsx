type BackButtonProps = {
  onClick?: () => void;
  label?: string;
  disabled?: boolean;
  className?: string;
};

/** Unstyled placeholder — see the HelloHacks design system ticket. */
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
      className={`text-2xl leading-none disabled:opacity-50 ${className}`}
    >
      <span aria-hidden="true">&larr;</span>
    </button>
  );
}
