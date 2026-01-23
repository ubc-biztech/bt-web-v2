import { useQuery } from "@tanstack/react-query";
import { fetchBackend } from "@/lib/db";

export interface UserProfile {
  compositeID: string;
  profileType: string;
  fname: string;
  lname: string;
  pronouns?: string;
  year?: string;
  major?: string;
  hobby1?: string;
  hobby2?: string;
  funQuestion1?: string;
  funQuestion2?: string;
  linkedIn?: string;
  profilePictureURL?: string;
  additionalLink?: string;
  description?: string;
  company?: string;
  position?: string;
  viewableMap: Record<string, boolean>;
}

async function fetchUserProfile(): Promise<UserProfile> {
  const response = await fetchBackend({
    endpoint: "/profiles/user",
    method: "GET",
    authenticatedCall: true,
  });
  return response;
}

export function useUserProfile() {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function getProfileId(compositeID: string): string {
  return compositeID.split("#")[1] || "";
}
