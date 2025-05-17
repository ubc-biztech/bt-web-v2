import { z } from "zod";

export const eventFormSchema = z.object({
  // Required fields (marked with * in the UI)
  eventName: z.string().min(1, "Event name is required"),
  eventSlug: z.string().min(1, "Event slug is required"),
  description: z.string().min(1, "Description is required"),
  capacity: z.number().min(1, "Capacity is required"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  location: z.string().min(1, "Location is required"),
  imageUrl: z.string().min(1, "Image URL is required"),
  deadline: z.date({
    required_error: "Registration deadline is required",
  }),
  partnerDescription: z.string().min(1, "Partner description is required"),

  // Optional fields
  price: z.number().default(0),
  nonMemberPrice: z.number().optional(),
  feedbackFormUrl: z.string().optional(),
  isApplicationBased: z.boolean().default(false),
  nonBizTechAllowed: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  isCompleted: z.boolean().default(false),

  // Arrays with defaults
  customQuestions: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum([
          "TEXT",
          "SELECT",
          "CHECKBOX",
          "UPLOAD",
          "WORKSHOP_SELECTION",
          "SKILLS",
        ]),
        question: z.string(),
        required: z.boolean(),
        options: z.array(z.string()),
        charLimit: z.number().optional(),
        questionImageUrl: z.string().optional(),
        participantCap: z.number().optional(),
        isSkillsQuestion: z.boolean().optional(),
      }),
    )
    .default([]),

  partnerCustomQuestions: z
    .array(
      z.object({
        id: z.string(),
        type: z.string(),
        question: z.string(),
        required: z.boolean(),
        options: z.array(z.string()),
      }),
    )
    .default([]),
});

export type EventFormSchema = z.infer<typeof eventFormSchema>;
