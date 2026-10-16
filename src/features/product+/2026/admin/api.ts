import { fetchBackend } from "@/lib/db";
import type { Submission } from "../submission/submission";

export interface Rubric {
  judge_user_id: string;
  /** Five raw scores from 0 to 10, in RUBRIC_CRITERIA order. */
  scores: number[];
  comments: string[];
}

export interface RankedSubmission {
  team_code: string;
  team_name: string;
  /** Mean weighted total out of 100, or null when no judges have scored. */
  rubric_average: number | null;
  rubric_count: number;
  upvotes: number;
  downvotes: number;
  audience_score: number;
}

export interface AdminSubmission extends Omit<Submission, "prd_view_url"> {
  prd_view_url: string | null;
  graded_submissions: Rubric[];
  upvotes: number;
  downvotes: number;
}

const submissionsPath = "/productplus/admin/submissions";

export const adminSubmissionsKey = (judgeId: string) =>
  ["productplus", "admin", judgeId, "submissions"] as const;

export const adminSubmissionKey = (judgeId: string, teamCode: string) =>
  [...adminSubmissionsKey(judgeId), teamCode] as const;

export function getAdminSubmissions(): Promise<RankedSubmission[]> {
  return fetchBackend({ endpoint: submissionsPath, method: "GET" });
}

export function getAdminSubmission(teamCode: string): Promise<AdminSubmission> {
  return fetchBackend({
    endpoint: `${submissionsPath}/${encodeURIComponent(teamCode)}`,
    method: "GET",
  });
}

export function saveAdminRubric(
  teamCode: string,
  rubric: Pick<Rubric, "scores" | "comments">,
): Promise<Rubric> {
  return fetchBackend({
    endpoint: `${submissionsPath}/${encodeURIComponent(teamCode)}/rubric`,
    method: "PUT",
    data: rubric,
  });
}
