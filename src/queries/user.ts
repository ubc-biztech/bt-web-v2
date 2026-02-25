import { fetchUserAttributes, AuthError } from "@aws-amplify/auth";
import { useQuery } from "@tanstack/react-query";

export interface UserAttributes {
  email?: string;
  email_verified?: string | boolean;
  sub?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  isAdmin?: boolean;
}

export async function getUserAttributes(): Promise<UserAttributes | null> {
  try {
    const attributes = await fetchUserAttributes();
    const email = attributes?.email || "";
    const isAdmin = email.split("@")[1] === "ubcbiztech.com";
    return { ...attributes, isAdmin, email };
  } catch (e) {
    if (e instanceof AuthError && e.name === "UserUnAuthenticatedException") {
      return null;
    }
    throw e;
  }
}

export function useUserAttributes() {
  return useQuery({
    queryKey: ["userAttributes"],
    queryFn: getUserAttributes,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}
