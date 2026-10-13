import { z } from "zod";
import type { FeedbackGridDefinition, FeedbackQuestion } from "@/types";

const gridLabelSchema = z
  .string()
  .trim()
  .min(1, "Grid labels must have 1–200 characters.")
  .max(200, "Grid labels must have 1–200 characters.");

const feedbackGridSchema = z.object({
  rows: z
    .array(z.object({ id: z.string(), label: gridLabelSchema }))
    .min(1, "Grid must have 1–20 rows.")
    .max(20, "Grid must have 1–20 rows.")
    .refine(
      (rows) => new Set(rows.map((row) => row.label)).size === rows.length,
      "Grid row labels must be unique.",
    ),
  columns: z
    .array(gridLabelSchema)
    .min(1, "Grid must have 1–10 columns.")
    .max(10, "Grid must have 1–10 columns.")
    .refine(
      (columns) => new Set(columns).size === columns.length,
      "Grid column labels must be unique.",
    ),
});

export function validateGridConfig(
  grid?: FeedbackGridDefinition,
): string | null {
  const result = feedbackGridSchema.safeParse(
    grid ?? { rows: [], columns: [] },
  );
  return result.success ? null : result.error.issues[0].message;
}

// Only answers are flat. Saving/loading uses the grid object without conversion.
export function getFeedbackAnswerFields(
  questions: FeedbackQuestion[],
): FeedbackQuestion[] {
  return questions.flatMap((question) => {
    if (question.type === "SECTION") return [];
    if (question.type === "MULTIPLE_CHOICE_GRID") {
      return question.grid!.rows.map((row) => ({
        ...question,
        questionId: row.id,
        label: `${question.label}: ${row.label}`,
      }));
    }
    return [question];
  });
}
