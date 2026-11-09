import { Upload } from "lucide-react";
import styles from "./RegistrationFields.module.css";

type FileUploadFieldProps = {
  id: string;
  labelledBy: string;
  accept: string;
  hint?: string;
  value?: File;
  invalid?: boolean;
  describedBy?: string;
  required?: boolean;
  form?: string;
  onChange: (file: File) => void;
};

export function FileUploadField({
  id,
  labelledBy,
  accept,
  hint,
  value,
  invalid,
  describedBy,
  required,
  form,
  onChange,
}: FileUploadFieldProps) {
  return (
    <div className={styles.upload}>
      {hint && (
        <p id={`${id}-hint`} className={styles.uploadHint}>
          {hint}
        </p>
      )}
      <label className={styles.uploadButton}>
        <input
          className={styles.fileInput}
          id={id}
          form={form}
          required={required}
          aria-required={required}
          type="file"
          accept={accept}
          aria-labelledby={labelledBy}
          aria-invalid={invalid}
          aria-describedby={[hint && `${id}-hint`, describedBy]
            .filter(Boolean)
            .join(" ")}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onChange(file);
            event.target.value = "";
          }}
        />
        <Upload size={18} aria-hidden="true" />
        <span>
          {value ? "Choose a different file" : "Choose a file to upload"}
        </span>
      </label>
      <span className={styles.fileName}>
        {value?.name ?? "No file selected"}
      </span>
    </div>
  );
}
