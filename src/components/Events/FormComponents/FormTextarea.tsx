import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface FormTextareaProps {
  name: string;
  label: string;
  charLimit?: number;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  name,
  label,
  charLimit,
}) => {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              {...field}
              maxLength={charLimit}
              className="resize-none"
            />
          </FormControl>
          <FormMessage />
          {charLimit && (
            <div className="text-sm text-gray-500">
              {field.value?.length || 0}/{charLimit} characters
            </div>
          )}
        </FormItem>
      )}
    />
  );
};
