import { fetchBackend } from "@/lib/db";
import { UserProfile, BackendProfile } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { normalizeViewableMap } from "@/util/profile";

export async function getProfile(profileId: string): Promise<UserProfile> {
  const response = await fetchBackend({
    endpoint: `/profiles/profile/${profileId}`,
    method: "GET",
    authenticatedCall: false,
  });

  const backendProfile = response as BackendProfile;

  const transformedProfile: UserProfile = {
    profileID: backendProfile.profileID ?? profileId,
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
    resumeURL: backendProfile.resumeURL ?? "",
    description: backendProfile.description,
    major: backendProfile.major,
    year: backendProfile.year,
    eventIDYear: backendProfile.eventIDYear,
    role: backendProfile.position,
    createdAt: backendProfile.createdAt,
    updatedAt: backendProfile.updatedAt,
    company: backendProfile.company,
    companyProfileID: backendProfile.companyProfileID,
    companyProfilePictureURL: backendProfile.companyProfilePictureURL,
    viewableMap: normalizeViewableMap(backendProfile.viewableMap),
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
