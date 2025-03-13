import React from 'react';
import { useFormContext, useWatch, Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { EventFormSchema } from '../EventFormSchema';
import { FormCheckbox } from './FormCheckbox';

interface FormOptionsProps {
    control: Control<EventFormSchema>;
    index: number;
}

export const FormOptions: React.FC<FormOptionsProps> = ({ control, index }) => {
    const { register, setValue } = useFormContext();
    const questionType = useWatch({
        control,
        name: `customQuestions.${index}.type`,
    });

    const options = useWatch({
        control,
        name: `customQuestions.${index}.options`,
    }) as string[] || [];

    const handleRemoveOption = (optionIndex: number) => {
        const currentOptions = [...options];
        currentOptions.splice(optionIndex, 1);
        setValue(`customQuestions.${index}.options`, currentOptions);
    };

    const renderOptions = () => {
        switch (questionType) {
            case 'CHECKBOX':
                return (
                    <div className="space-y-4">
                        <FormLabel>Options</FormLabel>
                        <div className="space-y-3">
                            {(options as string[]).map((option: string, optionIndex: number) => (
                                <div key={optionIndex} className="flex items-center justify-between">
                                    <div className="flex-1 p-2 border rounded-md bg-muted text-black">
                                        {option}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveOption(optionIndex)}
                                        className="h-8 w-8 p-0 ml-2"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'SELECT':
            case 'WORKSHOP_SELECTION':
                return (
                    <div className="space-y-4">
                        <FormLabel>{questionType === 'WORKSHOP_SELECTION' ? 'Workshop Options' : 'Options'}</FormLabel>
                        <div className="space-y-3">
                            {(options as string[]).map((option: string, optionIndex: number) => (
                                <div key={optionIndex} className="flex items-center space-x-3">
                                    <div className="flex-1 p-2 border rounded-md bg-muted text-black">
                                        {option}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveOption(optionIndex)}
                                        className="h-8 w-8 p-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'UPLOAD':
                return (
                    <div className="space-y-4">
                        <FormLabel>File URL</FormLabel>
                        <FormControl>
                            <Input 
                                type="file" 
                                className="block w-full h-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4 file:rounded-md
                                file:border-0 file:text-sm file:font-semibold
                                cursor-pointer"
                                {...register(`customQuestions.${index}.imageUrl`)} />
                        </FormControl>
                    </div>
                );
            case 'TEXT':
                return (
                    <div className="space-y-4">
                        <FormLabel>Character Limit</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                {...register(`customQuestions.${index}.characterLimit`, {
                                    valueAsNumber: true,
                                })}
                            />
                        </FormControl>
                    </div>
                );
            default:
                return null;
        }
    };

    const handleAddOption = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newOption = e.currentTarget.value.trim();
            if (newOption) {
                const currentOptions = [...options];
                // Just add the string directly, regardless of question type
                setValue(`customQuestions.${index}.options`, [...currentOptions, newOption]);
                e.currentTarget.value = '';
            }
        }
    };

    return (
        <FormItem className="space-y-6">
            {renderOptions()}
            {['CHECKBOX', 'SELECT', 'WORKSHOP_SELECTION'].includes(questionType) && (
                <div className="space-y-2">
                    <FormControl>
                        <Input
                            placeholder={`Add ${questionType === 'WORKSHOP_SELECTION' ? 'workshop ' : ''}option`}
                            onKeyPress={handleAddOption}
                        />
                    </FormControl>
                    <FormDescription>Press Enter to add an option. {questionType === 'CHECKBOX' ? "To use other option, type 'other'." : ""}</FormDescription>
                </div>
            )}
            <FormMessage />
        </FormItem>
    );
};
