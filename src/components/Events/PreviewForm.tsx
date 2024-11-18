import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { EventFormSchema } from './EventFormSchema';
import {FormCheckbox} from "@/components/Events/FormComponents/FormCheckbox";
import { FormInput } from './FormComponents/FormInput';
import { FormSelect } from './FormComponents/FormSelect';

interface PreviewFormProps {
    form: UseFormReturn<EventFormSchema>;
    isPartnerForm?: boolean;
}

const YEAR_LEVEL_OPTIONS = [
    { value: "1st Year", label: "1st Year" },
    { value: "2nd Year", label: "2nd Year" },
    { value: "3rd Year", label: "3rd Year" },
    { value: "4th Year", label: "4th Year" },
    { value: "5+ Year", label: "5+ Year" },
    { value: "Other", label: "Other" }
];

const FACULTY_OPTIONS = [
    { value: "Arts", label: "Arts" },
    { value: "Commerce", label: "Commerce" },
    { value: "Science", label: "Science" },
    { value: "Applied Science", label: "Applied Science" },
    { value: "Kinesiology", label: "Kinesiology" },
    { value: "Land and Food Systems", label: "Land and Food Systems" },
    { value: "Forestry", label: "Forestry" },
    { value: "Education", label: "Education" },
    { value: "Other", label: "Other" }
];

const PRONOUN_OPTIONS = [
    'He/Him',
    'She/Her',
    'They/Them',
    'Other/Prefer not to say'
] as const;

const DIETARY_OPTIONS = [
    { value: "None", label: "None" },
    { value: "Vegetarian", label: "Vegetarian" },
    { value: "Vegan", label: "Vegan" },
    { value: "Gluten-Free", label: "Gluten-Free" },
    { value: "Halal", label: "Halal" },
    { value: "Kosher", label: "Kosher" },
    { value: "Other", label: "Other (Please specify in notes)" }
];

const HEAR_ABOUT_OPTIONS = [
    { value: "Instagram", label: "Instagram" },
    { value: "LinkedIn", label: "LinkedIn" },
    { value: "Discord", label: "Discord" },
    { value: "Word of Mouth", label: "Word of Mouth" },
    { value: "BizTech Newsletter", label: "BizTech Newsletter" },
    { value: "Faculty Newsletter", label: "Faculty Newsletter" },
    { value: "Other", label: "Other" }
];

export const PreviewForm: React.FC<PreviewFormProps> = ({ form, isPartnerForm = false }) => {
    const questions = isPartnerForm ? form.watch('partnerCustomQuestions') : form.watch('customQuestions');
    const description = isPartnerForm ? form.watch('partnerDescription') : form.watch('description');

    const renderCustomQuestions = () => {
        return questions?.map((question, index) => {
            // For SELECT and WORKSHOP_SELECTION, we'll use FormSelect which already includes the label
            if (question.type === 'SELECT' || question.type === 'WORKSHOP_SELECTION') {
                return (
                    <FormSelect
                        key={index}
                        name={`previewCustom${index}`}
                        label={`${question.question}${question.required ? '*' : ''}`}
                        options={question.options?.map(option => ({
                            value: option,
                            label: option
                        })) || []}
                    />
                );
            }

            // For other types, we'll use FormField with explicit label control
            return (
                <FormField
                    key={index}
                    name={`previewCustom${index}`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{question.question}{question.required && '*'}</FormLabel>
                            {question.type === 'TEXT' && (
                                <FormControl>
                                    <Input placeholder={`Enter your answer`} {...field} />
                                </FormControl>
                            )}
                            {question.type === 'CHECKBOX' && (
                                <div className="space-y-2">
                                    {question.options?.map((option, optionIndex) => (
                                        <FormCheckbox
                                            key={optionIndex}
                                            name={`previewCustom${index}.${option}`}
                                            label={option}
                                        />
                                    ))}
                                </div>
                            )}
                            {question.type === 'UPLOAD' && (
                                <FormControl>
                                    <Input {...field} placeholder="File URL" />
                                </FormControl>
                            )}
                        </FormItem>
                    )}
                />
            );
        });
    };

    return (
        <>
            <FormInput
                name="previewFirstName"
                label="First Name*"
                placeholder="Enter your first name"
            />
            <FormInput
                name="previewLastName"
                label="Last Name*"
                placeholder="Enter your last name"
            />
            <FormInput
                name="previewEmail"
                label="Email*"
                type="email"
                placeholder="Enter your email"
            />
            <FormSelect
                name="previewYearLevel"
                label="Year Level*"
                options={YEAR_LEVEL_OPTIONS}
            />
            <FormSelect
                name="previewFaculty"
                label="Faculty*"
                options={FACULTY_OPTIONS}
            />

            <FormInput
                name="previewMajor"
                label="Major / Specialization*"
                placeholder="Enter your major"
            />

            <FormField
                name="previewPronouns"
                render={() => (
                    <FormItem>
                        <FormLabel>Preferred Pronouns*</FormLabel>
                        <div className="space-y-2">
                            {PRONOUN_OPTIONS.map((pronoun) => (
                                <FormCheckbox
                                    key={pronoun}
                                    name={`previewPronouns.${pronoun}`}
                                    label={pronoun}
                                />
                            ))}
                        </div>
                    </FormItem>
                )}
            />

            <FormSelect
                name="previewDietaryRestrictions"
                label="Dietary Restrictions*"
                options={DIETARY_OPTIONS}
            />

            <FormSelect
                name="previewHearAboutEvent"
                label="How did you hear about this event?*"
                options={HEAR_ABOUT_OPTIONS}
            />

            {renderCustomQuestions()}
        </>
    );
};
