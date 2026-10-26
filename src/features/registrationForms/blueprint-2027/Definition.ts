import { z } from "zod";
import type { RegistrationQuestion } from "@/types";

export const BLUEPRINT_REGISTRATION_QUESTIONS =
  [] satisfies readonly RegistrationQuestion[];

export const blueprintAttendeeRegistrationSchema = z.object({});

export type BlueprintAttendeeRegistrationValues = z.infer<
  typeof blueprintAttendeeRegistrationSchema
>;

export const blueprintPartnerRegistrationSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  companyName: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role is required"),
});

export type BluePrintPartnerRegistrationValues = z.infer<
  typeof blueprintPartnerRegistrationSchema
>;
