"use client";
import { PartnerEventRegistrationForm } from "@/components/Events/PartnerEventRegistrationForm";
import { getPartnerRegistrationForm } from "@/features/registrationForms/partnerRegistry";
import { QuestionTypes } from "@/constants/questionTypes";
import { fetchBackend } from "@/lib/db";
import { BiztechEvent } from "@/types";
import { REGISTERED_STATUS } from "@/lib/registrationStatus";
import { cleanOtherQuestions } from "@/util/registrationQuestionHelpers";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function PartnerFormRegister() {
  const router = useRouter();
  const { eventId, year } = router.query;
  const [event, setEvent] = useState<BiztechEvent | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [userRegistered, setUserRegistered] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    setEvent(null);
    setLoadError(false);
    setUserRegistered(false);
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
      if (!cancelled) setEvent(eventData);
    };
    fetchEvent().catch(() => {
      if (!cancelled) setLoadError(true);
    });
    return () => {
      cancelled = true;
    };
  }, [eventId, year]);

  const checkRegistered = async (email: string): Promise<Boolean> => {
    if (!event) return false;
    const registrations = await fetchBackend({
      endpoint: `/registrations?email=${encodeURIComponent(email.toLowerCase())}`,
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
    if (!event?.partnerRegistrationQuestions) return;
    for (let question of event?.partnerRegistrationQuestions) {
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
      registrationStatus: REGISTERED_STATUS,
      isPartner: true,
      basicInformation: {
        fname: data["firstName"],
        lname: data["lastName"],
        gender: data["preferredPronouns"],
        companyName: data["companyName"],
        role: data["roleAtCompany"],
        diet: data["dietaryRestrictions"] || "None",
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
          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative flex items-center justify-center">
            {event?.imageUrl ? (
              <Image
                src={event.imageUrl}
                alt="Event Cover"
                fill
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

  if (loadError)
    return (
      <p role="alert" className="p-6 text-white">
        Unable to load this event. Please refresh and try again.
      </p>
    );
  if (!event || event.id !== eventId || String(event.year) !== year)
    return (
      <p role="status" className="p-6 text-white">
        Loading registration...
      </p>
    );
  const definition = getPartnerRegistrationForm(
    event.partnerRegistrationFormKey,
  );
  if (!definition) {
    return renderErrorText(
      <p role="alert">
        This event&apos;s partner registration form is not available. Please
        contact an organizer.
      </p>,
    );
  }
  const CustomPartnerForm = definition.Component;
  if (CustomPartnerForm) {
    return (
      <CustomPartnerForm
        key={`${event.id};${event.year}`}
        mode="live"
        event={event}
      />
    );
  }

  if (userRegistered) {
    return renderErrorText(
      <div className="text-center">
        <p className="text-l mb-4">You&apos;ve already registered!</p>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md"
          onClick={() => (window.location.href = "/events")}
        >
          Upcoming Events
        </button>
      </div>,
    );
  }

  return (
    <main className="bg-bt-blue-600 min-h-screen">
      <div className="mx-auto flex flex-col">
        {event && event.partnerRegistrationQuestions && (
          <PartnerEventRegistrationForm onSubmit={handleSubmit} event={event} />
        )}
      </div>
    </main>
  );
}
