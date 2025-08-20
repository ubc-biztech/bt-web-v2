import React from "react";
import { Controller, Control } from "react-hook-form";

interface FormTextareaProps {
  name: string;
  label: string;
  placeholder?: string;
  control: Control<any>; // React Hook Form control
  rows?: number;
  required?: boolean;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  name,
  label,
  placeholder,
  control,
  rows = 5,
  required = false,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <>
            <textarea
              {...field}
              placeholder={placeholder}
              rows={rows}
              className={`w-full p-2 rounded-md bg-bt-blue-300 border ${
                error ? "border-bt-red-500" : "border-bt-blue-100"
              } text-white placeholder-bt-blue-100`}
            />
            {error && (
              <p className="text-red-500 text-xs mt-1">{error.message}</p>
            )}
          </>
        )}
      />
    </div>
  );
};
