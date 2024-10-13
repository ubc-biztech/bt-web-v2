import React from 'react';
import { NextPage } from 'next';
import { EventForm } from '@/components/Events/EventForm';

const CreateEventPage: NextPage = () => {
    const handleSubmit = async (data: any) => {
        // TODO: Implement API call to create a new event
        console.log('Creating new event:', data);
    };

    return (
        <div className="bg-primary-color min-h-screen">
            <div className="mx-auto flex flex-col">
                <EventForm onSubmit={handleSubmit} />
            </div>
        </div>
    );
};

export default CreateEventPage;
