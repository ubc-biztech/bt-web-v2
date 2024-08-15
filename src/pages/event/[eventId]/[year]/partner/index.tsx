"use client"
import { PartnerEventRegistrationForm } from "@/components/Events/PartnerEventRegistrationForm";
import { BiztechEvent } from "@/types";
import { useState } from "react";

export default function PartnerFormRegister() {
    const [event, setEvent] = useState<BiztechEvent>({} as BiztechEvent);
    const handleSubmit = async (data: any) => {
        // TODO: implement API call here
        console.log(data)
    }

    return (
        <main className="bg-primary-color min-h-screen">
            <div className="mx-auto flex flex-col">
                <PartnerEventRegistrationForm onSubmit={handleSubmit} event={event}/>
            </div>
        </main>
    );
}