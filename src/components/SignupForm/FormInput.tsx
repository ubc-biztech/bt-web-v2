import * as React from "react";

import { cn } from "@/lib/utils";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from '../ui/input'

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
        title: string;
}

type EnumType = { [key: string]: string };

interface Option<T extends EnumType> {
    value: T[keyof T];
    label: string;
}

interface FormRadioProps<T extends EnumType> {
    options: Option<T>[];
    title: string;
    onChange: (value: T[keyof T]) => void;
    value: T[keyof T] | undefined;
    enumType: T;
}


const FormInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, title, ...props }, ref) => {

        return (
            <FormItem>
                <FormLabel>
                    {title}
                </FormLabel>
                <FormControl>
                    <Input
                        type={type}
                        className={cn(
                            "bg-signup-input-bg border-2 border-signup-input-border mt-2",
                        )}
                        ref={ref}
                        {...props}
                    />
                </FormControl>
            </FormItem>
        );
    }
);
FormInput.displayName = "FormInput";


function FormRadio<T extends EnumType>({
    options,
    title,
    onChange,
    value,
    enumType,
}: FormRadioProps<T>) {
    return (
        <FormItem className="space-y-3">
            <FormLabel className="text-baby-blue font-poppins">{title}</FormLabel>
            <FormControl>
                <RadioGroup
                    onValueChange={onChange}
                    value={value}
                    className="flex flex-col space-y-2"
                >
                    {options.map((option) => (
                        <FormItem key={option.value} className="font-poppins flex items-center space-x-3 space-y-0">
                            <FormControl>
                                <RadioGroupItem value={option.value} />
                            </FormControl>
                            <FormLabel className=" font-500 font-poppins text-white-blue cursor-pointer">
                                {option.label}
                            </FormLabel>
                        </FormItem>
                    ))}
                </RadioGroup>
            </FormControl>
        </FormItem>
    );
}

FormRadio.displayName = "FormRadio";


export { FormInput, FormRadio};



