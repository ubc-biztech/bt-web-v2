"use client"
import { AttendeeEventRegistrationForm } from "@/components/Events/AttendeeEventRegistrationForm";
import { BiztechEvent } from "@/types";
import { useState } from "react";

export default function AttendeeFormRegister() {
    const [event, setEvent] = useState<BiztechEvent>({} as BiztechEvent);
    const handleSubmit = async (data: any) => {
        // TODO: implement API call here
        console.log(data)
    }

    return (
        <main className="bg-primary-color min-h-screen">
            <div className="mx-auto flex flex-col">
                <AttendeeEventRegistrationForm onSubmit={handleSubmit} event={event}/>
            </div>
        </main>
    );
}