import { useQuery } from "@tanstack/react-query";
import { fetchBackend } from "@/lib/db";
import { getProfileIdFromSource, normalizeViewableMap } from "@/util/profile";

export interface UserProfile {
  profileID?: string;
  compositeID?: string;
  profileType: "ATTENDEE" | "EXEC" | "PARTNER";
  fname?: string;
  lname?: string;
  pronouns?: string;
  year?: string | number;
  major?: string;
  hobby1?: string;
  hobby2?: string;
  funQuestion1?: string;
  funQuestion2?: string;
  linkedIn?: string;
  profilePictureURL?: string;
  additionalLink?: string;
  resumeURL?: string;
  description?: string;
  company?: string;
  position?: string;
  viewableMap?: Record<string, boolean>;
}

export interface UserProfileByEmail {
  "favedEventsID;year"?: string[];
  [key: string]: unknown;
}

function normalizeStringSet(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (value instanceof Set) {
    return Array.from(value).filter(
      (item): item is string => typeof item === "string",
    );
  }

  if (value && typeof value === "object" && "values" in value) {
    return normalizeStringSet((value as { values?: unknown }).values);
  }

  return [];
}

async function fetchUserProfile(): Promise<UserProfile> {
  const response = await fetchBackend({
    endpoint: "/profiles/user",
    method: "GET",
    authenticatedCall: true,
  });
  return {
    ...response,
    resumeURL: response?.resumeURL ?? "",
    viewableMap: normalizeViewableMap(response?.viewableMap),
  };
}

export function useUserProfile() {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

async function fetchUserProfileByEmail(
  email: string,
): Promise<UserProfileByEmail> {
  const response = await fetchBackend({
    endpoint: `/users/${email}`,
    method: "GET",
  });
  if (!response) return {};

  return {
    ...response,
    "favedEventsID;year": normalizeStringSet(response["favedEventsID;year"]),
  };
}

export function useUserProfileByEmail(email: string | undefined) {
  return useQuery({
    queryKey: ["userProfileByEmail", email],
    queryFn: () => fetchUserProfileByEmail(email!),
    enabled: !!email,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function getProfileId(
  profile: string | Pick<UserProfile, "profileID" | "compositeID"> | undefined,
): string {
  return getProfileIdFromSource(profile);
}
