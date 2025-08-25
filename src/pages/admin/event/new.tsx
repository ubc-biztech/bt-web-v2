import React from "react";
import { NextPage } from "next";
import { EventForm } from "@/components/Events/EventForm";
import { EventFormSchema } from "@/components/Events/EventFormSchema";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/router";
import { fetchBackend } from "@/lib/db";

const CreateEventPage: NextPage = () => {
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (data: EventFormSchema) => {
    // Add these validations
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

    // Validate workshop participant caps match number of workshops
    data.customQuestions.forEach((q) => {
      if (
        q.type === "WORKSHOP_SELECTION" &&
        q.options.length !== q.participantCap
      ) {
        toast({
          title: "Validation Error",
          description:
            "Workshop participant caps must match number of workshops",
          variant: "destructive",
        });
        return;
      }
    });

    // Transform custom questions to match v1 format
    const transformCustomQuestion = (q: any) => ({
      type: q.type,
      label: q.question, // Note: v2 uses 'question', v1 uses 'label'
      choices: q.options.join(","), // v1 expects comma-separated string
      required: q.required,
      charLimit: q.charLimit || undefined,
      questionImageUrl: q.questionImageUrl || "",
      participantCap:
        q.type === "WORKSHOP_SELECTION" ? q.participantCap : undefined,
      isSkillsQuestion: q.type === "SKILLS" ? true : undefined,
    });

    const body = {
      id: data.eventSlug,
      year: data.startDate.getFullYear(),
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
          nonMembers: data.nonMemberPrice
            ? Number(data.nonMemberPrice)
            : Number(data.price) || 0,
        }),
      },
      isPublished: false,
      isCompleted: false,
      registrationQuestions: data.customQuestions.map(transformCustomQuestion),
      partnerRegistrationQuestions: data.partnerCustomQuestions.map(
        transformCustomQuestion,
      ),
      feedback: data.feedbackFormUrl,
      isApplicationBased: data.isApplicationBased,
    };

    try {
      const result = await fetchBackend({
        endpoint: "/events",
        method: "POST",
        data: body,
      });

      toast({
        title: "Success",
        description: result.message,
      });

      router.push(
        `/admin/event/${data.eventSlug}/${data.startDate.getFullYear()}/edit`,
      );
    } catch (error: any) {
      console.log(error);
      if (error.status === 409) {
        toast({
          title: "Error",
          description: "Event with that slug/id and year already exists",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create event",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="bg-bt-blue-600 min-h-screen">
      <div className="mx-auto flex flex-col">
        <EventForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default CreateEventPage;
