import { z } from "zod";
import { membershipFormFieldsSchema } from "./membershipFormSchema";

export const onboardingValidationSchema =
  membershipFormFieldsSchema.superRefine((data, context) => {
    if (data.education === "UBC") {
      if (!data.studentNumber || !/^\d{8}$/.test(data.studentNumber)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please provide a valid student number",
          path: ["studentNumber"],
        });
      }
    } else if (data.studentNumber && !/^\d+$/.test(data.studentNumber)) {
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
  });
