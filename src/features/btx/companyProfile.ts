import { fetchBackend } from "@/lib/db";
import { youtubeVideoId } from "@/features/product+/2026/submission/submission";
import { companyNameError } from "./teamRules";

export interface CompanyProfileFields {
  companyName: string;
  blurb: string;
  youtubeURL: string;
  twitterURL: string;
  demoURL: string;
  logo: string;
}

export interface CompanyProfile extends CompanyProfileFields {
  projectId: string;
  canEdit: boolean;
  canEditName: boolean;
  eventEndsAt: number | null;
}

const legacyProfileFields = [
  "companyName",
  "blurb",
  "youtubeURL",
  "twitterURL",
] as const;

export const profileTextFields = [...legacyProfileFields, "demoURL"] as const;
export const profileFields = [...profileTextFields, "logo"] as const;
export const thumbnailTypes = ["image/jpeg", "image/png", "image/webp"];
export const maxThumbnailBytes = 2 * 1024 * 1024;

export const profileLimits: Record<keyof CompanyProfileFields, number> = {
  companyName: 100,
  blurb: 2000,
  youtubeURL: 2048,
  twitterURL: 2048,
  demoURL: 2048,
  logo: 2048,
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
    demoURL: profile.demoURL.trim(),
    logo: profile.logo.trim(),
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

export function isDemoUrl(value: string): boolean {
  if (!/^https:\/\//i.test(value)) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
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
    errors.youtubeURL =
      "Enter an HTTPS youtube.com or youtu.be video link, or leave it blank.";
  if (
    values.twitterURL &&
    !errors.twitterURL &&
    !isTwitterUrl(values.twitterURL)
  )
    errors.twitterURL = "Enter an HTTPS Twitter/X link, or leave this blank.";
  if (values.demoURL && !errors.demoURL && !isDemoUrl(values.demoURL))
    errors.demoURL = "Enter an HTTPS live demo link, or leave this blank.";
  return errors;
}

export function profileIsComplete(profile: CompanyProfileFields): boolean {
  const values = profileValues(profile);
  const errors = validateProfile(values);
  return Boolean(
    values.companyName &&
      values.blurb &&
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
    legacyProfileFields.some((field) => typeof response[field] !== "string") ||
    (response.demoURL != null && typeof response.demoURL !== "string") ||
    (response.logo != null && typeof response.logo !== "string") ||
    typeof response.canEdit !== "boolean" ||
    typeof response.canEditName !== "boolean" ||
    (response.eventEndsAt !== null &&
      (typeof response.eventEndsAt !== "number" ||
        !Number.isFinite(response.eventEndsAt)))
  )
    throw new Error(
      "The company profile response is unavailable. Reload or contact an organizer.",
    );
  return {
    ...response,
    demoURL: response.demoURL ?? "",
    logo: response.logo ?? "",
  };
}

export async function uploadCompanyThumbnail(projectId: string, file: File) {
  const upload = await fetchBackend({
    endpoint: `${profilePath(projectId)}/thumbnail-upload-url`,
    method: "POST",
    data: { contentType: file.type, size: file.size },
  });
  if (
    typeof upload?.uploadUrl !== "string" ||
    !upload.uploadUrl ||
    typeof upload.publicUrl !== "string" ||
    !upload.publicUrl
  )
    throw new Error("The thumbnail upload is unavailable. Try again.");

  const response = await fetch(upload.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type, ...upload.headers },
    body: file,
  });
  if (!response.ok) throw new Error("The thumbnail upload failed. Try again.");
  return upload.publicUrl;
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
