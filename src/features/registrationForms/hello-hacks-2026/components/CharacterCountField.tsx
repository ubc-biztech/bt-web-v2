import { useId } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { countWords } from "../Definition";
import styles from "../pages/ApplicationPage.module.css";

type CharacterCountFieldProps = {
  label: string;
  limit: number;
  value: string;
  error?: string;
  field: UseFormRegisterReturn;
  as?: "input" | "textarea";
  countMode?: "chars" | "words";
  helperText?: string;
  placeholder?: string;
};

/**
 * Short-answer inputs on the application step with live counters.
 */
export function CharacterCountField({
  label,
  limit,
  value,
  error,
  field,
  as = "textarea",
  countMode = "chars",
  helperText,
  placeholder = "Short answer",
}: CharacterCountFieldProps) {
  const fieldId = useId();
  const helperId = `${fieldId}-helper`;
  const counterId = `${fieldId}-counter`;

  const currentCount = countMode === "words" ? countWords(value) : value.length;
  const overLimit = currentCount > limit;
  const countLabel =
    countMode === "words"
      ? `${currentCount} / ${limit} words`
      : `${currentCount} / ${limit}`;

  const sharedProps = {
    ...field,
    placeholder,
    className: as === "input" ? styles.fieldInput : styles.fieldTextarea,
    "aria-invalid": error || overLimit ? true : undefined,
    "aria-describedby": helperText ? `${helperId} ${counterId}` : counterId,
    // Word limits can't be enforced by maxLength, so they are validated on submit.
    ...(countMode === "chars" ? { maxLength: limit } : {}),
  };

  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel}>
        <span className={styles.questionText}>{label}</span>
        {helperText ? (
          <span id={helperId} className={styles.helperText}>
            {helperText}
          </span>
        ) : null}
        {as === "input" ? (
          <input type="text" {...sharedProps} />
        ) : (
          <textarea rows={4} {...sharedProps} />
        )}
      </label>
      <div className={styles.counterRow}>
        <span
          id={counterId}
          className={`${styles.counter} ${overLimit ? styles.counterOver : ""}`}
        >
          {countLabel}
        </span>
      </div>
      {error ? (
        <span role="alert" className={styles.fieldError}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
