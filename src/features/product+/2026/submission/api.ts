import { fetchBackend } from "@/lib/db";
import type { JudgeFeedback } from "../components/JudgeFeedbackList";
import type {
  Submission,
  SubmissionFields,
  SubmissionTeam,
} from "./submission";

export interface SubmissionSnapshot {
  submission: Submission | null;
  submission_deadline: string;
  can_edit: boolean;
  /** Judge comments without scores; absent on backends that predate it. */
  feedback?: JudgeFeedback[];
}

// Workflow 1 PR #802 supersedes the older route in the Workflow 5 Notion page.
export function getSubmissionTeam(
  email: string,
): Promise<SubmissionTeam | null> {
  return fetchBackend({
    endpoint: `/team/${encodeURIComponent("product+")}/2026/${encodeURIComponent(email)}`,
    method: "GET",
  });
}

export function getSubmission(): Promise<SubmissionSnapshot> {
  return fetchBackend({ endpoint: "/productplus/submissions", method: "GET" });
}

export function saveSubmission(fields: SubmissionFields): Promise<Submission> {
  return fetchBackend({
    endpoint: "/productplus/submissions",
    method: "PUT",
    data: {
      team_name: fields.team_name.trim(),
      ...(fields.project_title?.trim()
        ? { project_title: fields.project_title.trim() }
        : {}),
      member_names: fields.member_names.map((name) => name.trim()),
      video_url: fields.video_url.trim(),
      prd_path: fields.prd_path,
    },
  });
}

export async function uploadSubmissionPdf(file: File): Promise<string> {
  const upload: {
    upload_url: string;
    upload_method: "PUT";
    upload_headers: Record<string, string>;
    prd_path: string;
  } = await fetchBackend({
    endpoint: "/productplus/submissions/upload",
    method: "POST",
    data: { content_type: "application/pdf", prd_filename: file.name },
  });
  // S3 uses its signed headers, never the Cognito token or JSON API client.
  const response = await fetch(upload.upload_url, {
    method: upload.upload_method,
    headers: upload.upload_headers,
    body: file,
  });
  if (!response.ok)
    throw new Error("Upload failed. Check your connection and try again.");
  return upload.prd_path;
}

export function errorMessage(error: unknown): string {
  return error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
    ? error.message
    : "Something went wrong. Please try again.";
}

export function errorStatus(error: unknown): number | undefined {
  return error &&
    typeof error === "object" &&
    "status" in error &&
    typeof error.status === "number"
    ? error.status
    : undefined;
}
