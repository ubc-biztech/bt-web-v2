import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { EventForm } from '@/components/Events/EventForm';

const EditEventPage: NextPage = () => {
    const router = useRouter();
    const { eventId, year } = router.query;
    const [eventData, setEventData] = useState(null);

    useEffect(() => {
        const fetchEventData = async () => {
            if (eventId && year) {
                // TODO: Implement API call to fetch event data
                // For now, we'll use mock data
                const mockData = {
                    eventName: 'Sample Event',
                    eventSlug: 'sample-event',
                    description: 'This is a sample event description.',
                    capacity: 100,
                    startDate: '2023-07-01T10:00',
                    endDate: '2023-07-01T18:00',
                    location: 'UBC Campus',
                    price: 0,
                    feedbackFormUrl: 'https://example.com/feedback',
                    isApplicationBased: false,
                    nonBizTechAllowed: true,
                    customQuestions: [
                        {
                            type: 'text',
                            question: 'What is your major?',
                            required: true,
                        },
                        {
                            type: 'select',
                            question: 'Which workshop are you interested in?',
                            required: true,
                            options: ['Workshop A', 'Workshop B', 'Workshop C'],
                        },
                    ],
                };
                setEventData(mockData);
            }
        };

        fetchEventData();
    }, [eventId, year]);

    const handleSubmit = async (data: any) => {
        // TODO: Implement API call to update the event
        console.log('Updating event:', data);
    };

    if (!eventData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Edit Event: {eventData.eventName}</h1>
            <EventForm initialData={eventData} onSubmit={handleSubmit} />
        </div>
    );
};

export default EditEventPage;
