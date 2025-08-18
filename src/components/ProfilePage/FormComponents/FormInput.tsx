import React from "react";
import { Controller, Control } from "react-hook-form";

interface FormInputProps {
  name: string;
  label: string;
  placeholder?: string;
  control: Control<any>; // React Hook Form control
  type?: string;
  required?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  name,
  label,
  placeholder,
  control,
  type = "text",
  required = false,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-pale-blue">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <>
            <input
              {...field}
              type={type}
              placeholder={placeholder}
              className={`w-full p-2 rounded-md bg-biztech-navy border ${
                error ? "border-red-500" : "border-border-blue"
              } text-white placeholder-pale-blue/40`}
            />
            {error && (
              <p className="text-light-red text-xs mt-1">{error.message}</p>
            )}
          </>
        )}
      />
    </div>
  );
};