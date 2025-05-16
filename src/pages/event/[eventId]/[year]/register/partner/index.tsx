"use client";
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
    const fetchEvent = async () => {
      if (!eventId || !year) {
        return;
      }
      const eventData = await fetchBackend({
        endpoint: `/events/${eventId}/${year}`,
        method: "GET",
        data: undefined,
        authenticatedCall: false,
      });
      setEvent(eventData);
    };
    fetchEvent();
  }, [eventId, year]);

  const checkRegistered = async (email: string): Promise<Boolean> => {
    const registrations = await fetchBackend({
      endpoint: `/registrations?email=${email}`,
      method: "GET",
      authenticatedCall: false,
    });
    const exists: boolean = registrations.data.some(
      (reg: any) => reg["eventID;year"] === event.id + ";" + event.year,
    );
    setUserRegistered(exists);
    return exists;
  };

  const cleanFormData = (data: any) => {
    if (!event?.registrationQuestions) return;
    for (let question of event?.registrationQuestions) {
      if (question.type === QuestionTypes.CHECKBOX && data.customQuestions) {
        data.customQuestions[question.questionId] = cleanOtherQuestions(
          data?.customQuestions[question.questionId],
        );
      }
    }
  };

  const handleSubmit = async (data: any) => {
    cleanFormData(data);

    // check if email is already associated with a registration
    if (await checkRegistered(data["emailAddress"])) return false;

    const registrationData = {
      email: data["emailAddress"],
      fname: data["firstName"],
      eventID: eventId,
      year: parseInt(year as string),
      registrationStatus: DBRegistrationStatus.REGISTERED,
      isPartner: true,
      basicInformation: {
        fname: data["firstName"],
        lname: data["lastName"],
        gender: data["preferredPronouns"],
        companyName: data["companyName"],
        role: data["roleAtCompany"],
      },
      dynamicResponses: data["customQuestions"],
    };

    try {
      await fetchBackend({
        endpoint: "/registrations",
        method: "POST",
        data: registrationData,
        authenticatedCall: false,
      });
      router.push(`/event/${eventId}/${year}/register/success`);
      return true;
    } catch (error) {
      alert(
        `An error has occured: ${error} Please contact an exec for support. 4`,
      );
      return false;
    }
  };

  const renderErrorText = (children: JSX.Element) => {
    return (
      <div className="flex text-white">
        <div className="space-y-4 p-4 max-w-lg mx-auto py-10">
          <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
            {event?.imageUrl ? (
              <img
                src={event.imageUrl}
                alt="Event Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400">Event Cover Photo</span>
            )}
          </div>
          {children}
        </div>
      </div>
    );
  };

  if (userRegistered) {
    return renderErrorText(
      <div className="text-center">
        <p className="text-l mb-4">You&apos;ve already registered!</p>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md"
          onClick={() => (window.location.href = "/")}
        >
          Upcoming Events
        </button>
      </div>,
    );
  }

  return (
    <main className="bg-primary-color min-h-screen">
      <div className="mx-auto flex flex-col">
        {event && event.partnerRegistrationQuestions && (
          <PartnerEventRegistrationForm onSubmit={handleSubmit} event={event} />
        )}
      </div>
    </main>
  );
}
