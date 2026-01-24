import { fetchBackend } from "@/lib/db";
import { UserProfile, BackendProfile } from "@/types";
import { useQuery } from "@tanstack/react-query";

export async function getProfile(profileId: string): Promise<UserProfile> {
  const response = await fetchBackend({
    endpoint: `/profiles/${profileId}`,
    method: "GET",
    authenticatedCall: false,
  });

  const backendProfile = response as BackendProfile;

  const transformedProfile: UserProfile = {
    profileID: backendProfile.profileID,
    fname: backendProfile.fname,
    lname: backendProfile.lname,
    pronouns: backendProfile.pronouns,
    type: backendProfile.profileType,
    hobby1: backendProfile.hobby1,
    hobby2: backendProfile.hobby2,
    funQuestion1: backendProfile.funQuestion1,
    funQuestion2: backendProfile.funQuestion2,
    linkedIn: backendProfile.linkedIn,
    profilePictureURL: backendProfile.profilePictureURL,
    additionalLink: backendProfile.additionalLink,
    description: backendProfile.description,
    major: backendProfile.major,
    year: backendProfile.year,
    eventIDYear: backendProfile.eventIDYear,
    role: backendProfile.position,
    createdAt: backendProfile.createdAt,
    updatedAt: backendProfile.updatedAt,
    company: backendProfile.company,
  };

  return transformedProfile;
}

export function useProfile(profileId: string | undefined) {
  return useQuery({
    queryKey: ["profile", profileId],
    queryFn: () => getProfile(profileId!),
    enabled: !!profileId,
    staleTime: 60 * 1000,
  });
}
