import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

interface FormCheckboxProps {
  name: string;
  label: string;
  disabled?: boolean;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  name,
  label,
  disabled,
}) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start gap-2">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              className="mt-[12px]"
              disabled={disabled}
            />
          </FormControl>
          <FormLabel
            className={`font-normal cursor-pointer leading-normal ${disabled ? "opacity-50" : ""}`}
          >
            {label}
          </FormLabel>
        </FormItem>
      )}
    />
  );
};
