import React, { useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
  const [otherCheckedStates, setOtherCheckedStates] = useState<{
    [key: string]: boolean;
  }>({});

  // Parse the current value into an array of selected choices
  const selectedChoices = value ? value.split(", ") : [];

  const handleCheckboxChange = (
    choice: string,
    checked: boolean,
    customValue?: string,
  ) => {
    if (preview || disabled) return;

    let newValue;
    const isOther = choice.toLowerCase() === "other";

    if (isOther) {
      // Handle "Other" option specially
      setOtherCheckedStates((prev) => ({
        ...prev,
        [name]: checked as boolean,
      }));

      if (!checked) {
        // Remove 'Other' and any custom input from the field value
        newValue = selectedChoices
          .filter((v: string) => v !== "Other" && !v.startsWith("Other:"))
          .join(", ");
      } else {
        // Add 'Other' to the field value
        newValue = [...selectedChoices, "Other"].join(", ");
      }
    } else {
      // Handle regular options
      if (checked) {
        newValue = selectedChoices.length ? `${value}, ${choice}` : choice;
      } else {
        newValue = selectedChoices
          .filter((v: string) => v !== choice)
          .join(", ");
      }
    }

    if (onChange) {
      onChange(newValue);
    }
  };

  const handleOtherInputChange = (choice: string, customValue: string) => {
    if (preview || disabled) return;

    const newValue = selectedChoices
      .filter((v: string) => v !== "Other" && !v.startsWith("Other:"))
      .concat(`Other:${customValue}`)
      .join(", ");

    if (onChange) {
      onChange(newValue);
    }
  };

  const isOtherChecked =
    otherCheckedStates[name] || selectedChoices.includes("Other");
  const otherCustomValue =
    selectedChoices.find((v: string) => v.startsWith("Other:"))?.substring(6) ||
    "";

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
                const isOther = choice.toLowerCase() === "other";

                return (
                  <FormItem
                    key={choiceIndex}
                    className="flex items-center space-x-2"
                  >
                    <FormControl>
                      {isOther ? (
                        <>
                          <Checkbox
                            checked={isOtherChecked}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(choice, checked as boolean)
                            }
                            disabled={disabled || preview}
                          />
                          {isOtherChecked && !preview && (
                            <Input
                              placeholder="Enter other option"
                              value={otherCustomValue}
                              onChange={(e) =>
                                handleOtherInputChange(choice, e.target.value)
                              }
                              className="mt-2 ml-6"
                              disabled={disabled}
                            />
                          )}
                          {isOtherChecked && preview && otherCustomValue && (
                            <div className="mt-2 ml-6 text-sm text-gray-600">
                              {otherCustomValue}
                            </div>
                          )}
                        </>
                      ) : (
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(choice, checked as boolean)
                          }
                          disabled={disabled || preview}
                        />
                      )}
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
