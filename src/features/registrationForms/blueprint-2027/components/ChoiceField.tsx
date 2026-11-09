import styles from "./RegistrationFields.module.css";

type ChoiceFieldProps<Option extends string> = {
  id: string;
  labelledBy: string;
  describedBy?: string;
  invalid?: boolean;
  required?: boolean;
  form?: string;
  options: readonly Option[];
  columns?: 1 | 2;
  other?: { value: string; onChange: (value: string) => void };
} & (
  | { multiple: true; value: Option[]; onChange: (value: Option[]) => void }
  | {
      multiple?: false;
      value: Option | undefined;
      onChange: (value: Option) => void;
    }
);

export function ChoiceField<Option extends string>(
  props: ChoiceFieldProps<Option>,
) {
  const selected = (option: Option) =>
    props.multiple ? props.value.includes(option) : props.value === option;
  function choose(option: Option) {
    if (props.multiple) {
      props.onChange(
        selected(option)
          ? props.value.filter((value) => value !== option)
          : [...props.value, option],
      );
    } else props.onChange(option);
  }
  return (
    <fieldset
      id={props.id}
      aria-labelledby={props.labelledBy}
      aria-describedby={props.describedBy}
      aria-invalid={props.invalid}
      role={props.multiple ? "group" : "radiogroup"}
      aria-required={props.multiple ? undefined : props.required}
      className={styles.choices}
      data-multiple={!!props.multiple}
      data-columns={
        (props.columns ?? (props.options.length > 5 ? 2 : 1)) === 2
          ? "multiple"
          : "single"
      }
    >
      {props.options.map((option) => (
        <div key={option} className={styles.choiceRow}>
          <label className={styles.choice}>
            <input
              className={styles.nativeControl}
              aria-label={option}
              type={props.multiple ? "checkbox" : "radio"}
              name={props.id}
              form={props.form}
              required={!props.multiple && props.required}
              value={option}
              checked={selected(option)}
              onChange={() => choose(option)}
              aria-describedby={props.describedBy}
              aria-invalid={props.invalid}
            />
            <span className={styles.indicator} aria-hidden="true" />
            {!(option === "Other" && props.other) && <span>{option}</span>}
          </label>
          {option === "Other" && props.other && (
            <input
              className={styles.other}
              form={props.form}
              aria-label="Other details"
              aria-describedby={props.describedBy}
              aria-invalid={props.invalid}
              placeholder="Other"
              value={props.other.value}
              onFocus={() => {
                if (!selected(option)) choose(option);
              }}
              onChange={(event) => {
                if (!selected(option)) choose(option);
                props.other?.onChange(event.target.value);
              }}
            />
          )}
        </div>
      ))}
    </fieldset>
  );
}
