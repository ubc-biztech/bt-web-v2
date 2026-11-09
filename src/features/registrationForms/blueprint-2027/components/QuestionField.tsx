import type { ReactNode } from "react";
import styles from "./RegistrationFields.module.css";

export type QuestionControlProps = {
  id: string;
  labelledBy: string;
  describedBy: string;
  invalid: boolean;
  required: boolean;
};

type QuestionFieldProps = {
  id: string;
  field: string;
  label: string;
  required: boolean;
  description?: string;
  hint?: string;
  error?: string;
  children: (props: QuestionControlProps) => ReactNode;
};

export function QuestionField({
  id,
  field,
  label,
  required,
  description,
  hint,
  error,
  children,
}: QuestionFieldProps) {
  const describedBy = [
    `${id}-requirement`,
    description && `${id}-description`,
    hint && `${id}-hint`,
    error && `${id}-error`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.questionField} data-question-field={field}>
      <h3 className={styles.questionLabel}>
        <label id={`${id}-label`} htmlFor={id}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
          {!required && <span className={styles.optional}>Optional</span>}
        </label>
      </h3>
      <span id={`${id}-requirement`} className={styles.srOnly}>
        {required ? "Required." : "Optional."}
      </span>
      {description && (
        <p id={`${id}-description`} className={styles.description}>
          {description}
        </p>
      )}
      {children({
        id,
        labelledBy: `${id}-label`,
        describedBy,
        invalid: !!error,
        required,
      })}
      {hint && (
        <p id={`${id}-hint`} className={styles.description}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
