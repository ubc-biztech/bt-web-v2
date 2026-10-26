import { z } from "zod";
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

export const DIETARY_OPTIONS = ["None", "Vegetarian", "Vegan", "Gluten-free", "Other"] as const;

export const blueprintPartnerRegistrationSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  nametag: z.string().min(1, "Name for nametag is required"), // Name as you would like to see it on your name tag
  pronouns: z.enum(PRONOUNS, {
    required_error: "Pick a pronoun option",
    invalid_type_error: "Pick a valid pronoun option",
  }),
  otherPronoun: z.string().optional(), // optional field for partners to specify any other pronouns
  linkedin: z.string().url("Enter a valid LinkedIn URL"),
  companyName: z.string().min(1, "Organization name is required"), // can list as myself if no affiliation
  role: z.string().min(1, "Role is required"),
  areasOfExpertise: z.enum(AREAS_OF_EXPERTISE, {
    required_error: "Pick an area of expertise",
    invalid_type_error: "Pick a valid area of expertise",
  }),
  headshot: z
  .instanceof(File, { message: "An headshot is required." })
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: "Max file size is 10MB.",
  })
  .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: ".jpg, .jpeg, and .png files are accepted.",
  }),
  dietaryRestrictions: z.enum(DIETARY_OPTIONS, {
    required_error: "Pick a dietary restriction option",
    invalid_type_error: "Pick a valid dietary restriction option",
  }),
  otherDietaryRestrictions: z.string().optional(), // optional field for partners to specify any other dietary restrictions
  parkingNeeds: z.boolean({
    required_error: "Please indicate if you need parking",
    invalid_type_error: "Please select a valid option for parking needs",
  }), // "Yes/Likely" or "No"
  coffeeChatInterest: z.boolean({
    required_error: "Please indicate your interest in being available for a coffee chat", // in addition to their current role
    invalid_type_error: "Interest in coffee chat must be a boolean",
  }),
  askMeAbout: z.string().optional(), // optional field for partners to have a short description of what people can ask them during coffee chats
});

export type BluePrintPartnerRegistrationValues = z.infer<
  typeof blueprintPartnerRegistrationSchema
>;
