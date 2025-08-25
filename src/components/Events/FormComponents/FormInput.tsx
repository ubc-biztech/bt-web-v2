import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface FormInputProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  name,
  label,
  placeholder,
  type = "text",
  disabled = false,
}) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder || label}
              type={type}
              disabled={disabled}
              {...field}
              onChange={(e) => {
                const value =
                  type === "number"
                    ? parseFloat(e.target.value)
                    : e.target.value;
                field.onChange(value);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
