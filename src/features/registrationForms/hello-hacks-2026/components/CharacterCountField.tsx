import type { UseFormRegisterReturn } from "react-hook-form";

type CharacterCountFieldProps = {
  label: string;
  charLimit: number;
  value: string;
  error?: string;
  field: UseFormRegisterReturn;
};

/**
 * Unstyled placeholder for the short-answer inputs on the application step.
 * Owns the character counter so the styled version only replaces markup.
 */
export function CharacterCountField({
  label,
  charLimit,
  value,
  error,
  field,
}: CharacterCountFieldProps) {
  return (
    <label>
      <span>{label}</span>
      <textarea {...field} maxLength={charLimit} placeholder="Short answer" />
      <span aria-hidden="true">
        {value.length} / {charLimit}
      </span>
      {error ? <span role="alert">{error}</span> : null}
    </label>
  );
}
