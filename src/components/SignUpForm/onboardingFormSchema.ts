import { z } from "zod";
import { membershipFormFieldsSchema } from "./membershipFormSchema";

export const ONBOARDING_YEAR_LEVELS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5+ Year",
  "Other",
];

export const onboardingValidationSchema = membershipFormFieldsSchema
  .extend({
    dietaryRestrictionsOther: z.string(),
    studentNumber: z
      .string()
      .trim()
      .max(8, "Student number must be 8 characters or fewer")
      .optional(),
    levelOfStudy: z
      .string()
      .refine((value) => ONBOARDING_YEAR_LEVELS.includes(value), {
        message: "Please select your year level",
      }),
  })
  .superRefine((data, context) => {
    if (data.studentNumber && !/^\d+$/.test(data.studentNumber)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Student number must contain numbers only",
        path: ["studentNumber"],
      });
    }

    if (
      data.dietaryRestrictions === "Other" &&
      !data.dietaryRestrictionsOther.trim()
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify your dietary restrictions",
        path: ["dietaryRestrictionsOther"],
      });
    }

    if (data.levelOfStudy === "Other" && !data.levelOfStudyOther.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify your level of study",
        path: ["levelOfStudyOther"],
      });
    }

    if (data.pronouns === "Other" && !data.pronounsOther.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify your pronouns",
        path: ["pronounsOther"],
      });
    }
  });

export type OnboardingFormValues = z.infer<typeof onboardingValidationSchema>;
