import { z } from "zod";
import type { RegistrationQuestion } from "@/types";

export const MIS_CAREER_INTERESTS = [
  "The Visionary",
  "The Designer",
  "The Architect",
  "The Logician",
  "The Strategist",
] as const;

export type MISCareerInterest = (typeof MIS_CAREER_INTERESTS)[number];

export const MIS_REGISTRATION_QUESTIONS = [
  {
    questionId: "careerInterest",
    label: "Which MIS building block best represents your career interests?",
    type: "SELECT",
    required: true,
    choices: MIS_CAREER_INTERESTS.join(","),
  },
] satisfies readonly RegistrationQuestion[];

export const MISRegistrationSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  studentId: z.string().trim().optional(),
  year: z.string().trim().min(1, "Year is required"),
  faculty: z.string().trim().min(1, "Faculty is required"),
  major: z.string().trim().min(1, "Major is required"),
  dietaryRestrictions: z.string().trim().optional(),
  careerInterest: z.enum(MIS_CAREER_INTERESTS, {
    required_error: "Select a career interest",
    invalid_type_error: "Select a valid career interest",
  }),
});

export type MISRegistrationValues = z.infer<typeof MISRegistrationSchema>;
