"use client";
import { AttendeeEventRegistrationForm } from "@/components/Events/AttendeeEventRegistrationForm";
import { BiztechEvent } from "@/types";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { fetchBackend } from "@/lib/db";
import {
    Alert,
    AlertDescription,
    AlertTitle,
  } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { getCurrentUser } from "@aws-amplify/auth";

export default function AttendeeFormRegister() {
    const router = useRouter();
    const { eventId, year } = router.query;
    const [event, setEvent] = useState<BiztechEvent>({} as BiztechEvent);
    const [isEventFull, setIsEventFull] = useState<boolean>(false);
    const [regAlert, setRegAlert] = useState<JSX.Element | null>(null);

    // const { username, userId, signInDetails } =

    const samePricing = () => {
        return event.pricing?.members === event.pricing?.nonMembers;
    };

    useEffect(() => {
        const fetchEvent = async() => {
            if (!eventId || !year) {
                return;
            }
            const eventData = await fetchBackend({
                endpoint: `/events/${eventId}/${year}`,
                method: "GET",
                data: undefined,
                authenticatedCall: false
            });
            
            const params = new URLSearchParams({
                count: String(true)
            });
            
            const regData = await fetchBackend({
                endpoint: `/events/${eventId}/${year}?${params}`,
                method: "GET",
                data: undefined,
                authenticatedCall: false
            })
            eventData.counts = regData;
            setEvent(eventData)
        }
        fetchEvent();
    }, [eventId, year]);

    useEffect(() => {
        const remaining = event.capac -
                    (event.counts?.registeredCount + event.counts?.checkedInCount);
            if (remaining > 0 && remaining <= 20) {
                setRegAlert(
                    <Alert className="mx-4 my-5 w-auto">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Warning</AlertTitle>
                        <AlertDescription>
                            {event.ename || "This event"} only has {remaining} spot
                            {remaining > 1 ? "s" : ""} left!
                        </AlertDescription>
                    </Alert>
                );
            } else if (remaining <= 0) {
            // } else if (remaining <= 0 && !user) {
                setRegAlert(
                    <Alert className="mx-4 my-5 w-auto">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Warning</AlertTitle>
                        <AlertDescription>
                            {event.ename || "This event"} is full!
                        </AlertDescription>
                    </Alert>
                );
            } else {
                setRegAlert(null);
            }
    }, [event])

    // TODO: implement dynamic workshop counts

    // TODO: registration, deadline passed, already registered; cancellation, event full, event almost full



    const handleSubmit = async (data: any) => {
        // TODO: implement API call here
        console.log(data);
    };

    return (
        <main className="bg-primary-color min-h-screen">
            <div className="mx-auto flex flex-col">
                {regAlert}
                {
                    event && event.registrationQuestions &&
                    <AttendeeEventRegistrationForm onSubmit={handleSubmit} event={event} />
                }
            </div>
        </main>
    );
}
