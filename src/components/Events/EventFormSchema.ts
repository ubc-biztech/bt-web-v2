import { z } from "zod";
import {
  DEFAULT_REGISTRATION_FORM_KEY,
  isRegistrationFormKey,
  type RegistrationFormKey,
} from "@/features/registrationForms/registry";
import {
  EVENT_PAGE_MODULE_TYPES,
  defaultEventPageConfig,
} from "@/lib/eventPageConfig";

const registrationFormKeySchema = z
  .string()
  .refine(
    (value): value is RegistrationFormKey => isRegistrationFormKey(value),
    "Select a valid registration form",
  )
  .default(DEFAULT_REGISTRATION_FORM_KEY);

const eventPageModuleSchema = z.object({
  id: z.enum(EVENT_PAGE_MODULE_TYPES),
  order: z.number(),
  visibility: z.enum([
    "public",
    "signedIn",
    "registered",
    "checkedIn",
    "admin",
  ]),
  config: z.record(z.unknown()).optional(),
});

const eventPageConfigSchema = z
  .object({
    subtitle: z.string().optional(),
    targetAudience: z.string().optional(),
    externalUrl: z
      .string()
      .url("External link must be a valid URL")
      .or(z.literal(""))
      .optional(),
    modules: z
      .array(eventPageModuleSchema)
      .default(defaultEventPageConfig.modules),
  })
  .default(defaultEventPageConfig);

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
  imageUrl: z.string().min(1, "Cover photo is required"),
  deadline: z.date({
    required_error: "Registration deadline is required",
  }),
  partnerDescription: z.string().min(1, "Partner description is required"),

  // Optional fields
  price: z.number().min(0, "Price cannot be negative").default(0),
  nonMemberPrice: z
    .number()
    .min(0, "Non-member price cannot be negative")
    .optional(),
  isApplicationBased: z.boolean().default(false),
  nonBizTechAllowed: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  isCompleted: z.boolean().default(false),
  registrationFormKey: registrationFormKeySchema,
  eventPage: eventPageConfigSchema,

  // Arrays with defaults
  customQuestions: z
    .array(
      z.object({
        id: z.string().min(1, "Question ID is required"),
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
        charLimit: z
          .number()
          .min(0, "Character limit cannot be negative")
          .optional(),
        questionImageUrl: z.string().optional(),
        participantCap: z
          .number()
          .min(0, "Participant cap cannot be negative")
          .optional(),
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
