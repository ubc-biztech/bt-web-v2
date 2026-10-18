import type { RankedSubmission, Rubric } from "./api";

export const RUBRIC_CRITERIA = [
  {
    name: "Problem Definition",
    max: 10,
    weight: 25,
    description:
      "How well does the team define the problem? Do they show a clear understanding of the target user, their needs and pain points?",
  },
  {
    name: "Problem-Solution Fit",
    max: 10,
    weight: 25,
    description:
      "How well does the solution respond to the problem? Are key product decisions and priorities explained and justified?",
  },
  {
    name: "Business Viability",
    max: 10,
    weight: 25,
    description: "How convincing is the business case for the product?",
  },
  {
    name: "Research & Supporting Evidence",
    max: 10,
    weight: 15,
    description:
      "How effectively is research, evidence or reasoning used to support assumptions and direction?",
  },
  {
    name: "Video Pitch & Creativity",
    max: 10,
    weight: 10,
    description:
      "How clearly does the video pitch communicate the team’s thinking? Consider storytelling and creativity.",
  },
] as const;

export const RUBRIC_MAX = RUBRIC_CRITERIA.reduce(
  (total, criterion) => total + criterion.weight,
  0,
);

export function rubricTotal(scores: readonly number[]): number {
  return RUBRIC_CRITERIA.reduce(
    (total, criterion, index) =>
      total + (scores[index] / criterion.max) * criterion.weight,
    0,
  );
}

export function validRubricScore(score: string, max: number): boolean {
  const value = Number(score);
  return (
    score.trim() !== "" && Number.isFinite(value) && value >= 0 && value <= max
  );
}

export function validRubricScores(scores: readonly string[]): boolean {
  return (
    scores.length === RUBRIC_CRITERIA.length &&
    scores.every((score, index) =>
      validRubricScore(score, RUBRIC_CRITERIA[index].max),
    )
  );
}

export function rubricDraft(rubric?: Rubric) {
  return {
    scores: RUBRIC_CRITERIA.map((_, index) => {
      const score = rubric?.scores[index];
      return Number.isFinite(score) ? String(score) : "";
    }),
    comments: RUBRIC_CRITERIA.map((_, index) =>
      Array.isArray(rubric?.comments) ? (rubric.comments[index] ?? "") : "",
    ),
  };
}

export function rankByRubric(submissions: readonly RankedSubmission[]) {
  return submissions
    .filter(
      (
        submission,
      ): submission is RankedSubmission & { rubric_average: number } =>
        submission.rubric_average !== null,
    )
    .sort(
      (a, b) =>
        b.rubric_average - a.rubric_average ||
        a.team_code.localeCompare(b.team_code),
    );
}

export function rankByAudience(submissions: readonly RankedSubmission[]) {
  return [...submissions].sort(
    (a, b) =>
      b.audience_score - a.audience_score ||
      a.team_code.localeCompare(b.team_code),
  );
}

export function formatScore(score: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(score);
}
