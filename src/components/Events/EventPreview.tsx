import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventFormSchema } from './EventFormSchema';
import { PreviewForm } from './PreviewForm';

interface EventPreviewProps {
    form: UseFormReturn<EventFormSchema>;
}

export const EventPreview: React.FC<EventPreviewProps> = ({ form }) => {
    return (
        <div className="container py-10">
            <Tabs defaultValue="member">
                <TabsList>
                    <TabsTrigger value="member">Member Form</TabsTrigger>
                    <TabsTrigger value="partner">Partner Form</TabsTrigger>
                </TabsList>
                <TabsContent value="member">
                    <div className="space-y-4 p-4">
                        <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {form.watch('imageUrl') ? (
                                <img src={form.watch('imageUrl')} alt="Event Cover" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-gray-400">Event Cover Photo</span>
                            )}
                        </div>
                        <h3 className="text-white font-bold mt-4">{form.watch('eventName') || 'Event Name'}</h3>
                        <p className="text-gray-300 whitespace-pre-line">{form.watch('description') || 'Event description will appear here.'}</p>
                        <PreviewForm form={form} />
                    </div>
                </TabsContent>
                <TabsContent value="partner">
                    <div className="bg-[#1E293B] p-4 rounded-lg">
                        <span>TBD, Partner form content goes here</span>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
