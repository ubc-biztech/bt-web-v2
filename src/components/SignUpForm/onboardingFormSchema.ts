import { z } from "zod";
import { membershipValidationSchema } from "./membershipFormSchema";

export const onboardingValidationSchema =
  membershipValidationSchema.superRefine((data, context) => {
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
  });
