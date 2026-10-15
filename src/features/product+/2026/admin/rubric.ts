import type { RankedSubmission, Rubric } from "./api";

export const RUBRIC_CRITERIA = [
  {
    name: "Problem Definition",
    max: 30,
    description:
      "How well does the team define the problem? Do they show a clear understanding of the target user, their needs and pain points?",
  },
  {
    name: "Product Solution",
    max: 35,
    description:
      "How well does the solution respond to the problem? Are key product decisions and priorities explained and justified?",
  },
  {
    name: "Research & Supporting Evidence",
    max: 20,
    description:
      "How effectively is research, evidence or reasoning used to support assumptions and direction?",
  },
  {
    name: "Pitch & Creativity",
    max: 15,
    description:
      "How clearly do the video and PRD communicate the team’s thinking? Consider storytelling and creativity.",
  },
] as const;

export const RUBRIC_MAX = RUBRIC_CRITERIA.reduce(
  (total, criterion) => total + criterion.max,
  0,
);

export function rubricTotal(scores: readonly number[]): number {
  return scores.reduce((total, score) => total + score, 0);
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
