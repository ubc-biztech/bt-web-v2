"use client";
import { AttendeeEventRegistrationForm } from "@/components/Events/AttendeeEventRegistrationForm";
import { BiztechEvent } from "@/types";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { fetchBackend } from "@/lib/db";

export default function AttendeeFormRegister() {
    const router = useRouter();
    const { eventId, year } = router.query;
    const [event, setEvent] = useState<BiztechEvent>({} as BiztechEvent);

    useEffect(() => {
        const fetchEvent = async() => {
            if (eventId && year) {
                const eventData = await fetchBackend({
                    endpoint: `/events/${eventId}/${year}`,
                    method: "GET",
                    data: undefined,
                    authenticatedCall: false
                });
                setEvent(eventData)
            }
        }

        fetchEvent();
    }, [eventId, year]);

    const handleSubmit = async (data: any) => {
        // TODO: implement API call here
        console.log(data);
    };

    return (
        <main className="bg-primary-color min-h-screen">
            <div className="mx-auto flex flex-col">
                {
                    event && event.registrationQuestions &&
                    <AttendeeEventRegistrationForm onSubmit={handleSubmit} event={event} />
                }
            </div>
        </main>
    );
}
