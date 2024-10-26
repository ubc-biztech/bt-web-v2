import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormSelectProps {
    name: string;
    label: string;
    options: { value: string; label: string }[];
}

export const FormSelect: React.FC<FormSelectProps> = ({ name, label, options }) => {
    const { control } = useFormContext();

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Select 
                            onValueChange={field.onChange} 
                            value={field.value?.toString() || ''} // Convert value to string and provide fallback
                        >
                            <SelectTrigger className="text-white">
                                <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {options.map((option) => (
                                    <SelectItem 
                                        key={option.value} 
                                        value={option.value.toString()} // Ensure value is string
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
