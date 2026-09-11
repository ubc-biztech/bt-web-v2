import type { FeedbackGridDefinition, FeedbackQuestion } from "@/types";

export function validateGridConfig(
  grid?: FeedbackGridDefinition,
): string | null {
  const rows = grid?.rows.map((row) => row.label.trim()) ?? [];
  const columns = grid?.columns.map((column) => column.trim()) ?? [];
  if (rows.length < 1 || rows.length > 20) return "Grid must have 1–20 rows.";
  if (columns.length < 1 || columns.length > 10)
    return "Grid must have 1–10 columns.";
  if ([...rows, ...columns].some((label) => !label || label.length > 200)) {
    return "Grid labels must have 1–200 characters.";
  }
  if (new Set(rows).size !== rows.length)
    return "Grid row labels must be unique.";
  if (new Set(columns).size !== columns.length)
    return "Grid column labels must be unique.";
  return null;
}

// Only answers are flat. Saving/loading uses the grid object without conversion.
export function getFeedbackAnswerFields(
  questions: FeedbackQuestion[],
): FeedbackQuestion[] {
  return questions.flatMap((question) =>
    question.type === "MULTIPLE_CHOICE_GRID"
      ? question.grid!.rows.map((row) => ({
          ...question,
          questionId: row.id,
          label: `${question.label}: ${row.label}`,
        }))
      : [question],
  );
}

export function formatFeedbackAnswer(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (value === undefined || value === null || value === "") return "-";
  if (typeof value === "object") {
    return (
      Object.entries(value)
        .map(([row, choice]) => `${row}: ${String(choice)}`)
        .join("; ") || "-"
    );
  }
  return String(value);
}
