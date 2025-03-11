import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { EventFormSchema, eventFormSchema } from './EventFormSchema';
import { FormCheckbox } from './FormComponents/FormCheckbox';
import { FormInput } from './FormComponents/FormInput';
import { FormTextarea } from './FormComponents/FormTextarea';
import { FormDatePicker } from './FormComponents/FormDatePicker';
import { CustomQuestions } from './CustomQuestions';
import { EventPreview } from './EventPreview';
import Link from 'next/link';
import { useEffect } from 'react';

interface EventFormProps {
    initialData?: Partial<EventFormSchema>;
    onSubmit: (data: EventFormSchema) => void;
    eventId?: string;  // Add this prop for constructing URLs
    eventYear?: string;  // Add this prop for constructing URLs
}

export const EventForm: React.FC<EventFormProps> = ({ initialData, onSubmit, eventId, eventYear }) => {
    // Add state to track if we're intentionally submitting/updating
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const form = useForm<EventFormSchema>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            customQuestions: [],
            isApplicationBased: false,
            nonBizTechAllowed: false,
            startDate: new Date(),
            endDate: new Date(),
            eventName: '',
            eventSlug: '',
            description: '',
            capacity: 0,
            location: '',
            price: 0,
            imageUrl: '',
            deadline: new Date(),
            partnerDescription: '',
            partnerCustomQuestions: [],
            nonMemberPrice: 0,
            isPublished: false,
            isCompleted: false,
            ...initialData
        },
        mode: 'onChange', // Changed from 'onBlur'
    });

    // Track if form is dirty (has unsaved changes)
    const formIsDirty = form.formState.isDirty && form.formState.dirtyFields && Object.keys(form.formState.dirtyFields).length > 0;

    // Add event listener for tab/window closing
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (formIsDirty && !isSubmitting) {
                e.preventDefault();
                e.returnValue = ''; // Required for Chrome
                return ''; // Required for other browsers
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [formIsDirty, isSubmitting]);

    const handleSubmit = async (data: EventFormSchema) => {
        try {
            setIsSubmitting(true);
            await onSubmit(data);
            // Reset form state after successful submission
            form.reset(data);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create event",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePublish = async () => {
        setIsSubmitting(true);
        try {
            const currentValue = form.getValues('isPublished');
            form.setValue('isPublished', !currentValue);
            await handleSubmit(form.getValues());
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleComplete = async () => {
        setIsSubmitting(true);
        try {
            const currentValue = form.getValues('isCompleted');
            form.setValue('isCompleted', !currentValue);
            await handleSubmit(form.getValues());
        } finally {
            setIsSubmitting(false);
        }
    };

    const getEventYear = () => {
        if (eventYear) return eventYear;
        // For new events, use current year
        return new Date().getFullYear().toString();
    };

    const getSlugPreview = () => {
        if (initialData) {
            // For existing events, use the eventId and eventYear from props
            return {
                main: `https://ubcbiztech.com/event/${eventId}/${eventYear}/register`,
                partner: `https://ubcbiztech.com/event/${eventId}/${eventYear}/register/partner`
            };
        } else {
            // For new events, use the form's slug and current year
            const slug = form.watch('eventSlug') || '[slug]';
            const year = new Date().getFullYear().toString();
            return {
                main: `https://ubcbiztech.com/event/${slug}/${year}/register`,
                partner: `https://ubcbiztech.com/event/${slug}/${year}/register/partner`
            };
        }
    };

    return (
        <div className="flex text-white font-satoshi">
            <div className="flex-1">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                        <div className="grid grid-cols-2 gap-8">
                            <EventPreview form={form} />
                            <div className="space-y-6 bg-[#253251] container py-10">
                                {initialData && (
                                    <>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-white">Edit Event - {form.watch('eventName')}</h3>
                                                <div className="flex gap-2">
                                                    <FormCheckbox
                                                        name="isPublished"
                                                        label="Published"
                                                        disabled={true}
                                                    />
                                                    <FormCheckbox
                                                        name="isCompleted"
                                                        label="Completed"
                                                        disabled={true}
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Link 
                                                    href={`/event/${eventId}/${eventYear}/register`}
                                                    className="flex items-center text-biztech-green hover:underline"
                                                    target="_blank"
                                                >
                                                    <span className="mr-2">Open User Event Page in New Tab</span>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </Link>
                                                
                                                <Link 
                                                    href={`/event/${eventId}/${eventYear}/register/partner`}
                                                    className="flex items-center text-biztech-green hover:underline"
                                                    target="_blank"
                                                >
                                                    <span className="mr-2">Open Partner Event Page in New Tab</span>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </Link>
                                            </div>

                                            <div className="flex gap-4">
                                                <Button type="submit" className="bg-biztech-green">
                                                    Save
                                                </Button>
                                                <Button 
                                                    type="button"
                                                    className="bg-biztech-green"
                                                    onClick={handlePublish}
                                                >
                                                    {form.watch('isPublished') ? 'Unpublish' : 'Publish'}
                                                </Button>
                                                <Button 
                                                    type="button"
                                                    className="bg-biztech-green"
                                                    onClick={handleComplete}
                                                >
                                                    {form.watch('isCompleted') ? 'Mark as Incomplete' : 'Mark as Complete'}
                                                </Button>
                                            </div>

                                            {!form.watch('isPublished') && formIsDirty && (
                                                <p className="text-red-400">
                                                    Note: There are changes to this event that are not published yet.
                                                </p>
                                            )}
                                        </div>
                                        <Separator />
                                    </>
                                )}

                                {
                                    !initialData && (
                                        <div className="flex gap-4">
                                                <Button type="submit" className="bg-biztech-green">
                                                    Save
                                                </Button>
                                            </div>
                                    )
                                }
                                
                                <FormCheckbox
                                    name="isApplicationBased"
                                    label="This is an application based event (i.e. you will accept / reject applicants)"
                                />

                                <FormCheckbox
                                    name="nonBizTechAllowed"
                                    label="Non-BizTech members allowed?"
                                />

                                <h4 className="text-baby-blue">Event Cover Photo</h4>
                                <FormInput name="imageUrl" label="Image URL*" placeholder="Image URL*" />

                                <h4 className="text-baby-blue">Event Information</h4>
                                <FormInput name="eventName" label="Event Name*" />
                                <FormInput 
                                    name="eventSlug" 
                                    label="Event Slug (URL)*" 
                                    disabled={!!initialData}  // Disable if editing
                                />
                                <div className="text-sm text-gray-400 mt-1 space-y-1">
                                    <div>Preview:</div>
                                    <div>{getSlugPreview().main}</div>
                                    <div>{getSlugPreview().partner}</div>
                                </div>
                                <FormTextarea name="description" label="Description*" />
                                <FormInput name="capacity" label="Capacity*" type="number" />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormDatePicker name="startDate" label="Start Date &amp; Time*" />
                                    <FormDatePicker name="endDate" label="End Date &amp; Time*" />
                                </div>

                                <FormInput name="location" label="Location*" />
                                <FormInput name="feedbackFormUrl" label="Feedback Form URL" />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormDatePicker name="deadline" label="Registration Deadline*" />
                                </div>

                                <h4 className="text-baby-blue">Pricing</h4>
                                <div className="space-y-4">
                                    <FormInput name="price" label="Member Price" type="number" />
                                    {!form.watch('nonBizTechAllowed') && (
                                        <p className="text-sm text-gray-400">
                                            Enable &quot;Non-BizTech members allowed?&quot; above to set different pricing for non-members
                                        </p>
                                    )}
                                    {form.watch('nonBizTechAllowed') && (
                                        <FormInput name="nonMemberPrice" label="Non-Member Price" type="number" />
                                    )}
                                </div>

                                <h4 className="text-baby-blue">Partner Event Information</h4>
                                <FormTextarea name="partnerDescription" label="Partner Description*" />
                                <CustomQuestions 
                                    control={form.control} 
                                    name="partnerCustomQuestions"
                                    label="Partner Custom Questions"
                                />
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};
