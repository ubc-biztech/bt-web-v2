import React from 'react';
import {useForm, useFieldArray, useWatch} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast"
import { BiztechEvent } from '@/types';
import { QuestionTypes } from '@/constants/questionTypes';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const customQuestionSchema = z.record(z.string(), z.string().min(1, "This field is required"))

const eventRegistrationFormSchema = z.object({
    emailAddress: z.string().email({
      message: "Please enter a valid email address",
    }),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    yearLevel: z.string().min(1, "Year level is required"),
    faculty: z.string().min(1, "Faculty is required"),
    majorSpecialization: z.string().min(1, "Major/Specialization is required"),
    preferredPronouns: z.enum([
      "He/Him/His",
      "She/Her/Hers",
      "They/Them/Their",
      "Other/Prefer not to say"
    ]),
    dietaryRestrictions: z.string().optional(),
    howDidYouHear: z.string().min(1, "Please specify how you heard about this event"),
    customQuestions: z.array(customQuestionSchema)
  });
 
type EventRegistrationFormSchema = z.infer<typeof eventRegistrationFormSchema>;

interface EventRegistrationFormProps {
    event: BiztechEvent;
    initialData?: Partial<EventRegistrationFormSchema>;
    onSubmit: (data: EventRegistrationFormSchema) => void;
}

export const EventRegistrationForm: React.FC<EventRegistrationFormProps> = ({ event, initialData, onSubmit }) => {
    const form = useForm({
        resolver: zodResolver(eventRegistrationFormSchema),
        defaultValues: initialData || {
            emailAddress: "", 
            firstName: "",
            lastName: "",
            yearLevel: "",
            faculty: "",
            majorSpecialization: "",
            preferredPronouns: "He/Him/His",
            dietaryRestrictions: "",
            howDidYouHear: "",
            customQuestions: [],
        },
    });

    const { append, remove } = useFieldArray({
        control: form.control,
        name: "customQuestions",
    });

    const customQuestions = useWatch({
        control: form.control,
        name: "customQuestions",
    });

    const handleSubmit = (data: Partial<EventRegistrationFormSchema>) => {
        // Type assertion to EventFormSchema
        onSubmit(data as EventRegistrationFormSchema);
        toast({
            title: "Event Created",
            description: "Your event has been successfully created.",
        });
        console.log(data)
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
                                    name="yearLevel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Year Level*</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="text-white">
                                                        <SelectValue placeholder="Select year level" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="year1">Year 1</SelectItem>
                                                    <SelectItem value="year2">Year 2</SelectItem>
                                                    <SelectItem value="year3">Year 3</SelectItem>
                                                    <SelectItem value="year4">Year 4</SelectItem>
                                                    <SelectItem value="year5+">Year 5+</SelectItem>
                                                    <SelectItem value="notApplicable">Not Applicable</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="faculty"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Faculty*</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="text-white">
                                                        <SelectValue placeholder="Select faculty" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="arts">Arts</SelectItem>
                                                    <SelectItem value="science">Science</SelectItem>
                                                    <SelectItem value="commerce">Commerce</SelectItem>
                                                    <SelectItem value="landFoodSystems">Land and Food Systems</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="majorSpecialization"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Major / Specialization*</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter your major" {...field} />
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
                                    name="howDidYouHear"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>How did you hear about this event?*</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="text-white">
                                                        <SelectValue placeholder="Select how you heard about the event" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="friends">Friends / Word of mouth</SelectItem>
                                                    <SelectItem value="social">Social media</SelectItem>
                                                    <SelectItem value="email">Email</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                {/* Custom Questions */}
                                {event?.registrationQuestions.map((question, index) => (
                                        <FormField
                                        control={form.control}
                                        name={`customQuestions.${index}.${question.questionId}`} // Use question.id instead of index
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
                                                                name={`customQuestions.${index}.${question.questionId}`}
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
