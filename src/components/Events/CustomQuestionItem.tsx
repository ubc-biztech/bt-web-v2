import React from 'react';
import { Control, UseFieldArrayRemove } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { EventFormSchema } from './EventFormSchema';
import { FormSelect } from './FormComponents/FormSelect';
import { FormInput } from './FormComponents/FormInput';
import { FormCheckbox } from './FormComponents/FormCheckbox';
import { FormOptions } from './FormComponents/FormOptions';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

interface CustomQuestionItemProps {
    index: number;
    control: Control<EventFormSchema>;
    remove: UseFieldArrayRemove;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}

export const CustomQuestionItem: React.FC<CustomQuestionItemProps> = ({ 
    index, 
    control, 
    remove, 
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast 
}) => {
    return (
        <div className="p-6 border rounded-lg bg-[#3A4A70] space-y-4">
            <div className="flex items-center justify-between">
                <div className="w-1/2">
                    <FormSelect
                        name={`customQuestions.${index}.type`}
                        label="Question Type"
                        options={[
                            { value: 'TEXT', label: 'Text' },
                            { value: 'CHECKBOX', label: 'Checkbox' },
                            { value: 'SELECT', label: 'Selection' },
                            { value: 'UPLOAD', label: 'Upload' },
                            { value: 'WORKSHOP_SELECTION', label: 'Workshop Selection' },
                            { value: 'SKILLS', label: 'Skills' }
                        ]}
                    />
                </div>
                <div className="flex items-center gap-4">
                    <FormCheckbox
                        name={`customQuestions.${index}.required`}
                        label="Required?"
                    />
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={onMoveUp}
                                disabled={isFirst}
                            >
                                <ChevronUp className={`h-4 w-4 ${isFirst ? 'text-gray-500' : 'text-white'}`} />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={onMoveDown}
                                disabled={isLast}
                            >
                                <ChevronDown className={`h-4 w-4 ${isLast ? 'text-gray-500' : 'text-white'}`} />
                            </Button>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-16 w-8"
                            onClick={() => remove(index)}
                        >
                            <Trash2 className="h-4 w-4 text-white" />
                        </Button>
                    </div>
                </div>
            </div>

            <FormInput
                name={`customQuestions.${index}.question`}
                label="Question"
            />
            
            <FormOptions
                control={control}
                index={index}
            />
        </div>
    );
};
