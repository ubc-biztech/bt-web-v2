import React, { useMemo, useState } from 'react';
import {useForm, SubmitHandler} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast"
import { BiztechEvent } from '@/types';
import { QuestionTypes } from '@/constants/questionTypes';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const partnerEventRegistrationFormSchema = z.object({
    emailAddress: z.string().email({
      message: "Please enter a valid email address",
    }),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    preferredPronouns: z.enum([
      "He/Him/His",
      "She/Her/Hers",
      "They/Them/Their",
      "Other/Prefer not to say"
    ]),
    dietaryRestrictions: z.string().optional(),
    companyName: z.string().min(1, "Please specify your company"),
    roleAtCompany: z.string().min(1, "Please specify your role/occupation"),
  });

interface PartnerEventRegistrationFormProps {
    event: BiztechEvent;
    initialData?: Partial<z.infer<ReturnType<typeof createDynamicSchema>>>;
    onSubmit: (data: z.infer<ReturnType<typeof createDynamicSchema>>) => void;
}

const createDynamicSchema = (event: BiztechEvent) => {
  const dynamicSchema = event.partnerRegistrationQuestions.reduce((acc, question) => {
    acc[question.questionId] = question.required 
      ? z.string().min(1, "This field is required")
      : z.string().optional();
    return acc;
  }, {} as Record<string, z.ZodTypeAny>);

  return partnerEventRegistrationFormSchema.extend({
    customQuestions: z.object(dynamicSchema),
  });
};

export const PartnerEventRegistrationForm: React.FC<PartnerEventRegistrationFormProps> = ({ event, initialData, onSubmit }) => {
    const [otherCheckedStates, setOtherCheckedStates] = useState({});
    const schema = useMemo(() => createDynamicSchema(event), [event]);
    type FormValues = z.infer<ReturnType<typeof createDynamicSchema>>;

    const form = useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: initialData || {
        emailAddress: "",
        firstName: "",
        lastName: "",
        companyName: "",
        roleAtCompany: "",
        preferredPronouns: "He/Him/His",
        dietaryRestrictions: "",
        customQuestions: {},
      },
    });

    const handleSubmit: SubmitHandler<FormValues> = (data) => {
        onSubmit(data);
        toast({
          title: "Registration Submitted",
          description: "Your registration has been successfully submitted.",
        });
        console.log(data);
    };

    return (
        <div className="flex text-white">
            {/* Main content */}
            <div className="flex-1">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        {/* Preview column */}
                        <div className="container py-10">
                            <div className="space-y-4 p-4 max-w-lg mx-auto">
                                {/* Event Image */}
                                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                    {event?.imageUrl ? 
                                        <img src={event.imageUrl} alt="Event Cover" className="w-full h-full object-cover" />  :
                                        <span className="text-gray-400">Event Cover Photo</span>
                                    }
                                </div>

                                {/* Event Name */}
                                <h3 className="text-white font-bold mt-4">{event?.ename}</h3>

                                {/* Event Description */}
                                <p className="text-gray-300 whitespace-pre-line">{event?.description}</p>

                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name*</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter your first name" {...field}/>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name*</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter your last name" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="emailAddress"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email*</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="Enter your email" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                control={form.control}
                                name="preferredPronouns"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Preferred Pronouns*</FormLabel>
                                    <RadioGroup
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        className="space-y-2"
                                    >
                                        {['He/Him/His', 'She/Her/Hers', 'They/Them/Their', 'Other/Prefer not to say'].map((pronoun) => (
                                        <FormItem key={pronoun} className="flex items-center space-x-2">
                                            <FormControl>
                                            <RadioGroupItem value={pronoun} />
                                            </FormControl>
                                            <FormLabel className="font-normal">{pronoun}</FormLabel>
                                        </FormItem>
                                        ))}
                                    </RadioGroup>
                                    </FormItem>
                                )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dietaryRestrictions"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Do you have any dietary restrictions?*</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="text-white">
                                                        <SelectValue placeholder="Select dietary restrictions" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                                                    <SelectItem value="vegan">Vegan</SelectItem>
                                                    <SelectItem value="glutenFree">Gluten-free</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="companyName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company Name*</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Company" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="roleAtCompany"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Role/Occupation at Company*</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Role/Occupation at company" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                {/* Custom Questions */}
                                {event?.partnerRegistrationQuestions.map((question) => (
                                        <FormField
                                        key={question.questionId}
                                        control={form.control}
                                        name={`customQuestions.${question.questionId}`} // Use question.id instead of index
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>{question.label}{question.required && '*'}</FormLabel>
                                            {question.type === QuestionTypes.TEXT && (
                                                <FormControl>
                                                <Input 
                                                    placeholder={`Enter your answer`} 
                                                    {...field}
                                                />
                                                </FormControl>
                                            )}
                                            {question.type === QuestionTypes.CHECKBOX && (
                                                <FormControl>
                                                    <div className="space-y-2">
                                                        {question?.choices?.split(',').map((choice) => (
                                                            <FormField
                                                                key={choice}
                                                                name={`customQuestions.${question.questionId}`}
                                                                render={({ field }) => {
                                                                    // Ensure that the field.value is an array of selected choices
                                                                    const selectedChoices = field.value ? field.value.split(', ') : [];
                                                                    const isChecked = selectedChoices.includes(choice);

                                                                    return (
                                                                        <FormItem className="flex items-center space-x-2">
                                                                            <FormControl>
                                                                                <Checkbox
                                                                                    checked={isChecked}
                                                                                    onCheckedChange={(checked) => {
                                                                                        let newValue;
                                                                                        if (checked) {
                                                                                            // Add the choice to the comma-separated string
                                                                                            newValue = selectedChoices.length
                                                                                                ? `${field.value}, ${choice}`
                                                                                                : choice;
                                                                                        } else {
                                                                                            // Remove the choice from the comma-separated string
                                                                                            newValue = selectedChoices
                                                                                                .filter(v => v !== choice)
                                                                                                .join(', ');
                                                                                        }
                                                                                        field.onChange(newValue);
                                                                                    }}
                                                                                />
                                                                            </FormControl>
                                                                            <FormLabel className="font-normal">{choice}</FormLabel>
                                                                        </FormItem>
                                                                    );
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                </FormControl>
                                            )}
                                            {question.type === QuestionTypes.SELECT && (
                                                <FormControl>   
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                    <SelectTrigger className="text-white">
                                                        <SelectValue placeholder="Select an option" />
                                                    </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                    {question.choices?.split(",").map((choice, choiceIndex) => (
                                                        <SelectItem key={choiceIndex} value={choice}>
                                                        {choice}
                                                        </SelectItem>
                                                    ))}
                                                    </SelectContent>
                                                </Select>
                                                </FormControl>
                                            )}
                                            {question.type === QuestionTypes.UPLOAD && (
                                                <FormControl>
                                                <Input {...field} placeholder="File URL" />
                                                </FormControl>
                                            )}
                                            {question.type === QuestionTypes.WORKSHOP_SELECTION && (
                                                <FormControl>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                    <SelectTrigger className="text-white">
                                                        <SelectValue placeholder="Select a workshop" />
                                                    </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                    {question.choices?.split(",").map((choice, choiceIndex) => (
                                                        <SelectItem key={choiceIndex} value={choice}>
                                                        {choice}
                                                        </SelectItem>
                                                    ))}
                                                    </SelectContent>
                                                </Select>
                                                </FormControl>
                                            )}
                                            {question.type === QuestionTypes.SKILLS && (
                                            <FormControl>
                                                <div className="space-y-2">
                                                {question?.choices?.split(',').map((choice) => (
                                                    <FormField
                                                    key={choice}
                                                    name={`customQuestions.${question.questionId}`}
                                                    render={({ field }) => {
                                                        const selectedChoices = field.value ? field.value.split(', ') : [];
                                                        const isChecked = selectedChoices.includes(choice);
                                                        const isOtherChecked = otherCheckedStates[question.questionId] || false;

                                                        return (
                                                        <FormItem className="flex items-center space-x-2">
                                                            <FormControl>
                                                            {choice.toLowerCase() === 'other' ? (
                                                                <>
                                                                <Checkbox
                                                                    checked={isOtherChecked}
                                                                    onCheckedChange={(checked) => {
                                                                    setOtherCheckedStates(prev => ({
                                                                        ...prev,
                                                                        [question.questionId]: checked
                                                                    }));
                                                                    if (!checked) {
                                                                        // Remove 'Other' and any custom skills from the field value
                                                                        const newValue = selectedChoices
                                                                        .filter(v => v !== 'Other' && !v.startsWith('Other:'))
                                                                        .join(', ');
                                                                        field.onChange(newValue);
                                                                    }
                                                                    }}
                                                                />
                                                                {isOtherChecked && (
                                                                    <Input
                                                                    placeholder="Enter custom skills (comma-separated)"
                                                                    value={selectedChoices.find(v => v.startsWith('Other:'))?.substring(6) || ''}
                                                                    onChange={(e) => {
                                                                        const customSkills = e.target.value;
                                                                        let newValue = selectedChoices
                                                                        .filter(v => v !== 'Other' && !v.startsWith('Other:'))
                                                                        .concat(`Other:${customSkills}`)
                                                                        .join(', ');
                                                                        field.onChange(newValue);
                                                                    }}
                                                                    className="mt-2"
                                                                    />
                                                                )}
                                                                </>
                                                            ) : (
                                                                <Checkbox
                                                                checked={isChecked}
                                                                onCheckedChange={(checked) => {
                                                                    let newValue;
                                                                    if (checked) {
                                                                    newValue = selectedChoices.length
                                                                        ? `${field.value}, ${choice}`
                                                                        : choice;
                                                                    } else {
                                                                    newValue = selectedChoices
                                                                        .filter(v => v !== choice)
                                                                        .join(', ');
                                                                    }
                                                                    field.onChange(newValue);
                                                                }}
                                                                />
                                                            )}
                                                            </FormControl>
                                                            <FormLabel className="font-normal">{choice}</FormLabel>
                                                        </FormItem>
                                                        );
                                                    }}
                                                    />
                                                ))}
                                                </div>
                                            </FormControl>
                                            )}
                                            </FormItem>
                                        )}
                                        />

                                ))}
                                <div className="h-px my-8"/>
                                <Button type="submit" className="">Submit</Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};
