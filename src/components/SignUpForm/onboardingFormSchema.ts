import { z } from "zod";
import { membershipFormFieldsSchema } from "./membershipFormSchema";

export const onboardingValidationSchema =
  membershipFormFieldsSchema.superRefine((data, context) => {
    if (data.studentNumber && !/^\d+$/.test(data.studentNumber)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Student number must contain numbers only",
        path: ["studentNumber"],
      });
    }

    if (data.pronouns === "Other" && !data.pronounsOther.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify your pronouns",
        path: ["pronounsOther"],
      });
    }

    if (data.levelOfStudy === "Other" && !data.levelOfStudyOther.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify your level of study",
        path: ["levelOfStudyOther"],
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

    if (data.referral === "Other" && !data.referralOther.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please tell us how you heard about us",
        path: ["referralOther"],
      });
    }
  });
