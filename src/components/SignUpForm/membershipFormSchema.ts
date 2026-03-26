import { z } from "zod";
import { MembershipFormValues } from "./MembershipFormSection";

export const membershipValidationSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    education: z.string().min(1, "Education selection is required"),
    studentNumber: z.string().optional(),
    pronouns: z.string().min(1, "Please select your pronouns"),
    levelOfStudy: z.string().min(1, "Level of study is required"),
    faculty: z.string().min(1, "Faculty is required"),
    major: z.string().min(1, "Major is required"),
    internationalStudent: z
      .string()
      .min(1, "Please specify if you are an international student"),
    previousMember: z
      .string()
      .min(1, "Please specify if you were a previous member"),
    dietaryRestrictions: z.string().min(1, "Dietary restrictions are required"),
    referral: z.string().min(1, "Referral source is required"),
    topics: z.array(z.string()),
  })
  .refine(
    (data) =>
      data.education === "UBC"
        ? !!data.studentNumber && /^\d{8}$/.test(data.studentNumber)
        : true,
    {
      message: "Student number must be an 8 digit number for UBC students",
      path: ["studentNumber"],
    },
  );

export const MEMBERSHIP_FORM_DEFAULTS: MembershipFormValues = {
  email: "",
  firstName: "",
  lastName: "",
  education: "",
  studentNumber: "",
  pronouns: "",
  levelOfStudy: "",
  faculty: "",
  major: "",
  internationalStudent: "",
  previousMember: "",
  dietaryRestrictions: "None",
  referral: "",
  topics: [],
};
