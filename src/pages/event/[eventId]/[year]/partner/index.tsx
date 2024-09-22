"use client"
import { PartnerEventRegistrationForm } from "@/components/Events/PartnerEventRegistrationForm";
import { QuestionTypes } from "@/constants/questionTypes";
import { fetchBackend } from "@/lib/db";
import { ApplicationStatus, BiztechEvent, DBRegistrationStatus } from "@/types";
import { cleanOtherQuestions } from "@/util/registrationQuestionHelpers";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function PartnerFormRegister() {
    const router = useRouter();
    const { eventId, year } = router.query;
    const [event, setEvent] = useState<BiztechEvent>({} as BiztechEvent);
    const [userRegistered, setUserRegistered] = useState<boolean>(false);

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
            setEvent(eventData)
        }
        fetchEvent();
    }, [eventId, year]);

    const checkRegistered = async (email: string) => {
        const registrations = await fetchBackend({
            endpoint: `/registrations?email=${email}`,
            method: "GET",
        })
        return registrations.data.some((reg: any) => reg["eventID;year"] === (event.id + ";" +event.year));
    }

    const cleanFormData = (data: any) => {
        for (let question of event?.registrationQuestions) {
            if (question.type === QuestionTypes.CHECKBOX && data.customQuestions) {
                data.customQuestions[question.questionId] = cleanOtherQuestions(data?.customQuestions[question.questionId])
            }
        }
    }

    const handleSubmit = async (data: any) => {
        cleanFormData(data);

        // check if email is already associated with a registration

        if (await checkRegistered(data["emailAddress"])) {

        }
        const registrationData = {
            email: responseData[0],
            fname: responseData[1],
            eventID: currEvent.id,
            year: currEvent.year,
            registrationStatus: "registered",
            isPartner: true,
            basicInformation: {
              fname: responseData[1],
              lname: responseData[2],
              gender: responseData[3],
              companyName: responseData[4],
              role: responseData[5],
            },
            dynamicResponses,
          };

        try {
            await fetchBackend({
                endpoint: "/registrations",
                method: "POST",
                data: registrationData,
                authenticatedCall: false
            });
            router.push(`/event/${eventId}/${year}/register/success`);
        } catch (error) {
            alert(
                `An error has occured: ${error} Please contact an exec for support. 4`
            );
        }
    };

    if (userRegistered) {
        return renderErrorText(
            <div className="text-center">
                <p className="text-l mb-4">You've already registered!</p>
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md" onClick={() => window.location.href="/"}>
                    Upcoming Events
                </button>
            </div>
        )
    }

    return (
        <main className="bg-primary-color min-h-screen">
            <div className="mx-auto flex flex-col">
                <PartnerEventRegistrationForm onSubmit={handleSubmit} event={event}/>
            </div>
        </main>
    );
}