import type { UseFormRegisterReturn } from "react-hook-form";
import styles from "./CharacterCountField.module.css";

type CharacterCountFieldProps = {
  label: string;
  charLimit: number;
  value: string;
  error?: string;
  field: UseFormRegisterReturn;
};

/**
 * One short-answer question on the application step: label, textarea, and the
 * live character counter. `maxLength` caps typing at the limit, so the counter
 * is a progress readout rather than an error state.
 */
export function CharacterCountField({
  label,
  charLimit,
  value,
  error,
  field,
}: CharacterCountFieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <textarea
        {...field}
        maxLength={charLimit}
        placeholder="Short answer"
        rows={1}
        className={styles.input}
      />
      <span aria-hidden="true" className={styles.count}>
        {value.length} / {charLimit}
      </span>
      {error ? (
        <span role="alert" className={styles.error}>
          {error}
        </span>
      ) : null}
    </label>
  );
}
