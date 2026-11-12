import { z } from "zod";
import { normalizePartnerLinkedin } from "./linkedin";
import type { RegistrationQuestion } from "@/types";

export const BLUEPRINT_REGISTRATION_QUESTIONS =
  [] satisfies readonly RegistrationQuestion[];

export const blueprintAttendeeRegistrationSchema = z.object({});

export type BlueprintAttendeeRegistrationValues = z.infer<
  typeof blueprintAttendeeRegistrationSchema
>;

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export const PRONOUNS = [
  "He/Him",
  "She/Her",
  "They/Them",
  "Other",
  "Prefer not to say",
] as const;

export const AREAS_OF_EXPERTISE = [
  "Software Engineering",
  "Data Science",
  "Cybersecurity",
  "Product Management",
  "Design",
  "Consulting",
  "Entrepreneurship",
  "Venture Capital",
  "Academia/Research",
  "Other",
] as const;

export const DIETARY_OPTIONS = [
  "None",
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Halal",
  "Kosher",
  "Other",
] as const;

export const blueprintHeadshotSchema = z
  .instanceof(File, {
    message:
      "Upload a headshot or give permission to use your LinkedIn headshot.",
  })
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: "Max file size is 10 MB.",
  })
  .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: ".jpg, .jpeg, and .png files are accepted.",
  });

export const blueprintPartnerRegistrationSchema = z
  .object({
    email: z.string().email(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    nametag: z.string().min(1, "Name for nametag is required"),
    pronouns: z.enum(PRONOUNS, {
      required_error: "Pick a pronoun option",
      invalid_type_error: "Pick a valid pronoun option",
    }),
    otherPronoun: z.string().optional(),
    linkedin: z
      .string()
      .transform(normalizePartnerLinkedin)
      .pipe(z.string().url("Enter a valid LinkedIn URL"))
      .refine((value) => {
        try {
          const url = new URL(value);
          return (
            url.protocol === "https:" &&
            ["linkedin.com", "www.linkedin.com"].includes(url.hostname) &&
            /^\/in\/[^/]+\/?$/.test(url.pathname) &&
            !url.username &&
            !url.password
          );
        } catch {
          return false;
        }
      }, "Enter your LinkedIn profile URL"),
    companyName: z.string(),
    participatingIndependently: z.boolean().default(false),
    role: z.string().min(1, "Role is required"),
    areasOfExpertise: z
      .array(z.enum(AREAS_OF_EXPERTISE))
      .min(1, "Pick at least one area of expertise"),
    otherExpertise: z.string().optional(),
    headshot: z.union(
      [blueprintHeadshotSchema, z.literal("linkedin-permission")],
      {
        errorMap: () => ({
          message:
            "Upload a headshot or give permission to use your LinkedIn headshot.",
        }),
      },
    ),
    dietaryRestrictions: z.enum(DIETARY_OPTIONS, {
      required_error: "Pick a dietary restriction option",
      invalid_type_error: "Pick a valid dietary restriction option",
    }),
    otherDietaryRestrictions: z.string().optional(),
    coffeeChatInterest: z.boolean({
      required_error:
        "Please indicate your interest in being available for a coffee chat",
      invalid_type_error: "Interest in coffee chat must be a boolean",
    }),
    askMeAbout: z.string().optional(),
  })
  .superRefine((values, context) => {
    if (!values.participatingIndependently && !values.companyName.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["companyName"],
        message: "Organization name is required",
      });
    }
  });

export type BluePrintPartnerRegistrationValues = z.infer<
  typeof blueprintPartnerRegistrationSchema
>;
