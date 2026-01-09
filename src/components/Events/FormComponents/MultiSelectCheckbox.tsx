import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

interface MultiSelectCheckboxProps {
  name: string;
  label: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  preview?: boolean; // When true, shows as preview (non-interactive but visual)
  required?: boolean;
}

export const MultiSelectCheckbox: React.FC<MultiSelectCheckboxProps> = ({
  name,
  label,
  options,
  value,
  onChange,
  disabled = false,
  preview = false,
  required = false,
}) => {
  // Parse the current value into an array of selected choices
  const selectedChoices = value ? value.split(", ") : [];

  const handleCheckboxChange = (choice: string, checked: boolean) => {
    if (preview || disabled) return;

    let newValue: string[];
    if (checked) {
      newValue = [...selectedChoices, choice];
    } else {
      newValue = selectedChoices.filter((v: string) => v !== choice);
    }

    if (onChange) {
      onChange(newValue.join(", "));
    }
  };

  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex flex-row gap-4 items-center">
            <FormLabel>
              {label}
              {required && "*"}
            </FormLabel>
            <FormMessage />
          </div>
          <FormControl>
            <div className="space-y-2">
              {options.map((choice, choiceIndex) => {
                const isChecked = selectedChoices.includes(choice);

                return (
                  <FormItem
                    key={choiceIndex}
                    className="flex items-center space-x-2"
                  >
                    <FormControl>
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(choice, checked as boolean)
                        }
                        disabled={disabled || preview}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">{choice}</FormLabel>
                  </FormItem>
                );
              })}
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
};
