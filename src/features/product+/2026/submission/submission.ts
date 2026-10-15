export interface SubmissionFields {
  team_name: string;
  project_title: string | null;
  member_names: string[];
  video_url: string;
  prd_path: string;
}

export interface Submission extends SubmissionFields {
  prd_filename: string | null;
  team_code: string;
  prd_view_url: string;
  submitted_at: string;
  updated_at: string;
}

export interface SubmissionTeam {
  team_code: string;
  team_name: string;
  members: { user_id: string; name: string }[];
}

export type SubmissionPhase = "idle" | "uploading" | "saving";
export type SubmissionNotice = { tone: "success" | "error"; message: string };
export type SubmissionErrors = {
  project_title?: string;
  team_name?: string;
  member_names?: string;
  video_url?: string;
  prd_path?: string;
};

export const MAX_PDF_BYTES = 5_000_000;

// Match the Workflow 2 contract; a preview cannot verify video visibility.
export function youtubeVideoId(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.username || url.password || url.port)
      return null;
    let id: string | null = null;
    if (url.hostname === "youtu.be") {
      id = /^\/([\w-]{11})\/?$/.exec(url.pathname)?.[1] ?? null;
    } else if (
      ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname)
    ) {
      if (
        url.pathname === "/watch" &&
        url.searchParams.getAll("v").length === 1
      ) {
        id = url.searchParams.get("v");
      } else {
        id =
          /^\/(?:shorts|embed)\/([\w-]{11})\/?$/.exec(url.pathname)?.[1] ??
          null;
      }
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function validateSubmission(
  fields: SubmissionFields,
  hasPdf: boolean,
): SubmissionErrors {
  return {
    ...(!fields.team_name.trim() && { team_name: "Enter your team name." }),
    ...(!fields.project_title?.trim() && {
      project_title: "Enter your project title.",
    }),
    ...((!fields.member_names.length ||
      fields.member_names.some((name) => !name.trim())) && {
      member_names: "Enter a full name for each team member.",
    }),
    ...(!youtubeVideoId(fields.video_url) && {
      video_url:
        "That doesn’t look like a YouTube link. Paste an unlisted youtube.com or youtu.be URL.",
    }),
    ...(!hasPdf && { prd_path: "Choose a PDF before submitting." }),
  };
}

export function formatSubmissionDate(value: string, short = false): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not configured";
  return new Intl.DateTimeFormat("en-US", {
    month: short ? "short" : "long",
    day: "numeric",
    ...(short ? {} : { year: "numeric", timeZoneName: "short" as const }),
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
