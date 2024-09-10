import * as React from "react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// Interfaces
interface RadioOption {
  value: string;
  label: string;
}
interface FormRadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  items: RadioOption[];
  title: string;
  field: any;
}
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  title: string;
  field: any;
}
interface MultiSelectOption {
  value: string;
  label: string;
}
interface FormMultiSelectProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  items: MultiSelectOption[];
  title: string;
  field: any;
}
interface SelectOption {
  value: string;
  label: string;
}
interface FormSelectProps {
  items: SelectOption[];
  title: string;
  field: any;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, type, title, field, ...props }, ref) => (
    <FormItem className="w-full font-poppins">
      <FormLabel className="text-baby-blue">{title}</FormLabel>
      <FormControl>
        <Input
          type={type}
          className={cn(
            "bg-signup-input-bg border-2 border-signup-input-border mt-2",
            "focus:ring-0 focus:ring-offset-0 focus:outline-none focus:shadow-none",
            "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus-visible:shadow-none",
            "focus:border-biztech-green focus:border-opacity-50",
            "transition-colors duration-200",
            className
          )}
          ref={ref}
          {...field}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )
);

FormInput.displayName = "FormInput";

export const FormRadio = React.forwardRef<HTMLDivElement, FormRadioProps>(
  ({ items, title, field }, ref) => {
    return (
      <FormItem className="space-y-3 mr-auto" ref={ref}>
        <FormLabel className="text-baby-blue font-poppins mr-auto">
          {title}
        </FormLabel>
        <FormControl>
          <RadioGroup
            onValueChange={field.onChange}
            value={field.value}
            className="flex flex-col space-y-2"
          >
            {items.map((item) => (
              <FormItem
                key={item.value}
                className="flex items-center space-x-3 space-y-0"
              >
                <FormControl>
                  <RadioGroupItem
                    value={item.value}
                    className="h-5 w-5 rounded-full border-2 border-white bg-transparent
                                                flex items-center justify-center"
                  >
                    <div className="h-2.5 w-2.5 rounded-full bg-white transform scale-0 transition-transform duration-200 ease-in-out data-[state=checked]:scale-100" />
                  </RadioGroupItem>
                </FormControl>
                <FormLabel className="font-poppins font-medium text-white-blue cursor-pointer">
                  {item.label}
                </FormLabel>
              </FormItem>
            ))}
          </RadioGroup>
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  }
);
FormRadio.displayName = "FormRadio";

export const FormMultiSelect = React.forwardRef<
  HTMLDivElement,
  FormMultiSelectProps
>(({ title, items, field }, ref) => {
  return (
    <div className="mr-auto" ref={ref}>
      <FormLabel className="text-baby-blue font-poppins">{title}</FormLabel>
      {items.map((item) => (
        <FormItem
          key={item.value}
          className="flex items-center space-x-3 space-y-0 mt-5"
        >
          <FormControl>
            <Checkbox
              checked={field.value?.includes(item.value)}
              onCheckedChange={(checked) => {
                if (checked) {
                  field.onChange([...(field.value || []), item.value]);
                } else {
                  field.onChange(
                    field.value?.filter((value: string) => value !== item.value)
                  );
                }
              }}
              className="border-2 mr-1"
            />
          </FormControl>
          <FormLabel className="font-poppins font-medium text-white-blue cursor-pointer">
            {item.label}
          </FormLabel>
        </FormItem>
      ))}
      <FormMessage />
    </div>
  );
});

FormMultiSelect.displayName = "FormMultiSelect";

export const FormSelect = React.forwardRef<HTMLDivElement, FormSelectProps>(
  ({ title, items, field }, ref) => {
    return (
      <FormItem className="w-full">
        <Select onValueChange={field.onChange} defaultValue={field.value}>
          <FormLabel className="text-baby-blue font-poppins">{title}</FormLabel>
          <FormControl
            className={cn(
              "bg-signup-input-bg border-2 border-signup-input-border mt-2",
              "text-white-blue",
              "transition-colors duration-200",
              "focus:border-biztech-green focus:border-opacity-50",
              "focus:ring-0 focus:ring-offset-0 focus:outline-none focus:shadow-none"
            )}
          >
            <SelectTrigger ref={ref} {...field}>
              <SelectValue placeholder="-Select-" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    );
  }
);

FormSelect.displayName = "FormSelect";
