import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { EventForm } from "@/components/Events/EventForm";
import { EventFormSchema } from "@/components/Events/EventFormSchema";
import { useToast } from "@/components/ui/use-toast";
import { fetchBackend } from "@/lib/db";
import { DEFAULT_REGISTRATION_FORM_KEY } from "@/features/registrationForms/registry";
import {
  getRegistrationQuestions,
  transformEventFormQuestions,
} from "@/features/registrationForms/questions";
import { normalizeEventPageConfig } from "@/lib/eventPageConfig";

const EditEventPage: NextPage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const { eventId, year } = router.query;
  const [initialData, setInitialData] = useState<Partial<EventFormSchema>>();
  const [isLoading, setIsLoading] = useState(true);

  // Transform backend question format to frontend format
  const transformBackendQuestion = (q: any) => ({
    id: q.questionId || crypto.randomUUID(),
    type: q.type,
    question: q.label, // Convert back to v2 format
    required: q.required,
    options: q.choices ? q.choices.split(",") : [], // Convert string back to array
    charLimit: q.charLimit,
    questionImageUrl: q.questionImageUrl || "",
    participantCap: q.participantCap,
    isSkillsQuestion: q.isSkillsQuestion,
  });

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId || !year) return;

      setIsLoading(true);
      try {
        const data = await fetchBackend({
          endpoint: `/events/${eventId}/${year}`,
          method: "GET",
        });

        console.log("Received data:", data);

        // Add null checks and default values
        if (!data) {
          throw new Error("No data received from the server");
        }

        // Transform the data to match our form schema
        const transformedData = {
          eventName: data.ename ?? "",
          eventSlug: data.id ?? "",
          description: data.description ?? "",
          partnerDescription: data.partnerDescription ?? "",
          capacity: data.capac ?? 0,
          location: data.elocation ?? "",
          imageUrl: data.imageUrl ?? "",
          startDate: data.startDate ? new Date(data.startDate) : new Date(),
          endDate: data.endDate ? new Date(data.endDate) : new Date(),
          deadline: data.deadline ? new Date(data.deadline) : new Date(),
          price: data.pricing?.members ?? 0,
          nonMemberPrice: data.pricing?.nonMembers ?? 0,
          isApplicationBased: !!data.isApplicationBased,
          nonBizTechAllowed: !!data.nonBizTechAllowed,
          isPublished: !!data.isPublished,
          isCompleted: !!data.isCompleted,
          registrationFormKey:
            data.registrationFormKey ?? DEFAULT_REGISTRATION_FORM_KEY,
          eventPage: normalizeEventPageConfig(data.eventPage),
          customQuestions: Array.isArray(data.registrationQuestions)
            ? data.registrationQuestions.map(transformBackendQuestion)
            : [],
          partnerCustomQuestions: Array.isArray(
            data.partnerRegistrationQuestions,
          )
            ? data.partnerRegistrationQuestions.map(transformBackendQuestion)
            : [],
        };

        console.log("Transformed data:", transformedData);
        setInitialData(transformedData);
      } catch (error: any) {
        console.error("Error fetching event data:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to fetch event data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [eventId, year, toast]);

  const handleSubmit = async (data: EventFormSchema) => {
    if (!eventId || !year) return;

    // Validation checks
    if (data.endDate < data.startDate) {
      toast({
        title: "Validation Error",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    if (data.deadline > data.startDate) {
      toast({
        title: "Validation Error",
        description: "Registration deadline must be before event start date",
        variant: "destructive",
      });
      return;
    }

    const defaultRegistrationQuestions = transformEventFormQuestions(
      data.customQuestions,
    );

    const body = {
      ename: data.eventName,
      description: data.description,
      partnerDescription: data.partnerDescription,
      capac: data.capacity,
      elocation: data.location,
      imageUrl: data.imageUrl,
      startDate: data.startDate,
      endDate: data.endDate,
      deadline: data.deadline,
      pricing: {
        members: Number(data.price) || 0,
        ...(data.nonBizTechAllowed && {
          nonMembers:
            data.nonMemberPrice != null
              ? Number(data.nonMemberPrice)
              : Number(data.price) || 0,
        }),
      },
      registrationFormKey: data.registrationFormKey,
      registrationQuestions: getRegistrationQuestions(
        data.registrationFormKey,
        defaultRegistrationQuestions,
      ),
      partnerRegistrationQuestions: transformEventFormQuestions(
        data.partnerCustomQuestions,
      ),
      isApplicationBased: data.isApplicationBased,
      nonBizTechAllowed: data.nonBizTechAllowed,
      isPublished: data.isPublished,
      isCompleted: data.isCompleted,
      eventPage: data.eventPage,
    };

    try {
      const result = await fetchBackend({
        endpoint: `/events/${eventId}/${year}`,
        method: "PATCH",
        data: body,
      });

      toast({
        title: "Success",
        description: result.message,
      });

      // Instead of reloading, update the initialData state
      setInitialData(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
      throw error; // Rethrow to handle in the form component
    }
  };

  return (
    <div className="bg-bt-blue-600 min-h-screen">
      <div className="mx-auto flex flex-col">
        {isLoading ? (
          <div>Loading...</div>
        ) : initialData ? (
          <EventForm
            initialData={initialData}
            onSubmit={handleSubmit}
            eventId={eventId as string}
            eventYear={year as string}
          />
        ) : null}
      </div>
    </div>
  );
};

export default EditEventPage;
