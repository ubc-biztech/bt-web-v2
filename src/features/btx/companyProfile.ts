import { fetchBackend } from "@/lib/db";
import { youtubeVideoId } from "@/features/product+/2026/submission/submission";
import { companyNameError } from "./teamRules";
import type { Company } from "./seedApi";

export interface CompanyProfileFields {
  companyName: string;
  blurb: string;
  youtubeURL: string;
  twitterURL: string;
}

export interface CompanyProfile extends CompanyProfileFields {
  projectId: string;
  canEdit: boolean;
  canEditName: boolean;
  eventEndsAt: number | null;
}

export const profileFields = [
  "companyName",
  "blurb",
  "youtubeURL",
  "twitterURL",
] as const;

export const profileLimits: Record<keyof CompanyProfileFields, number> = {
  companyName: 100,
  blurb: 2000,
  youtubeURL: 2048,
  twitterURL: 2048,
};

export type ProfileErrors = Partial<Record<keyof CompanyProfileFields, string>>;

export function profileValues(
  profile: CompanyProfileFields,
): CompanyProfileFields {
  return {
    companyName: profile.companyName.trim(),
    blurb: profile.blurb.trim(),
    youtubeURL: profile.youtubeURL.trim(),
    twitterURL: profile.twitterURL.trim(),
  };
}

function isTwitterUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      [
        "x.com",
        "www.x.com",
        "twitter.com",
        "www.twitter.com",
        "m.twitter.com",
      ].includes(url.hostname) &&
      url.pathname !== "/"
    );
  } catch {
    return false;
  }
}

export function validateProfile(profile: CompanyProfileFields): ProfileErrors {
  const values = profileValues(profile);
  const errors: ProfileErrors = {};
  for (const field of profileFields) {
    if (values[field].length > profileLimits[field])
      errors[field] =
        `Use ${profileLimits[field].toLocaleString()} characters or fewer.`;
  }
  errors.companyName = companyNameError(values.companyName);
  if (
    values.youtubeURL &&
    !errors.youtubeURL &&
    !youtubeVideoId(values.youtubeURL)
  )
    errors.youtubeURL = "Enter an HTTPS youtube.com or youtu.be video link.";
  if (
    values.twitterURL &&
    !errors.twitterURL &&
    !isTwitterUrl(values.twitterURL)
  )
    errors.twitterURL = "Enter an HTTPS Twitter/X link, or leave this blank.";
  return errors;
}

export function profileIsComplete(profile: CompanyProfileFields): boolean {
  const values = profileValues(profile);
  const errors = validateProfile(values);
  return Boolean(
    values.companyName &&
      values.blurb &&
      values.youtubeURL &&
      !errors.companyName &&
      !errors.blurb &&
      !errors.youtubeURL,
  );
}

export const companyProfileKey = (projectId: string, email: string) =>
  ["btx", "companyProfile", projectId, email] as const;

const profilePath = (projectId: string) =>
  `/btx/projects/${encodeURIComponent(projectId)}`;

export async function getCompanyProfile(
  projectId: string,
): Promise<CompanyProfile> {
  const response = await fetchBackend({
    endpoint: profilePath(projectId),
    method: "GET",
  });
  // This handler uses response.ok(profile), which returns the profile directly.
  // The market/seed handlers use a different { message, data } envelope.
  if (
    response?.projectId !== projectId ||
    profileFields.some((field) => typeof response[field] !== "string") ||
    typeof response.canEdit !== "boolean" ||
    typeof response.canEditName !== "boolean" ||
    (response.eventEndsAt !== null &&
      (typeof response.eventEndsAt !== "number" ||
        !Number.isFinite(response.eventEndsAt)))
  )
    throw new Error(
      "The company profile response is unavailable. Reload or contact an organizer.",
    );
  return response;
}

export async function saveCompanyProfile(
  projectId: string,
  patch: Partial<CompanyProfileFields>,
): Promise<void> {
  // PATCH returns 204. Reload GET for canonical values and current permissions.
  await fetchBackend({
    endpoint: profilePath(projectId),
    method: "PATCH",
    data: patch,
  });
}

export interface SeedWindow {
  projectId: string;
  eventId: string;
  seedStartedAt: number;
  seedEndsAt: number;
  seedStatus: Company["seedStatus"];
  serverTime: number;
  ipoAt: number | null;
}

export async function startCompanySeeding(
  projectId: string,
): Promise<SeedWindow> {
  const response = await fetchBackend({
    endpoint: profilePath(projectId) + "/seed/start",
    method: "POST",
  });
  return response.data;
}

export function profileErrorMessage(error: unknown, fallback: string): string {
  return error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
    ? error.message
    : fallback;
}

export function profileRequiresSignIn(error: unknown): boolean {
  return (
    (error instanceof Error && error.name === "UnauthenticatedUserError") ||
    (!!error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 401)
  );
}
