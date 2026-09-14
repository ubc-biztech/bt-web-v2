import {
  fetchAuthSession,
  fetchUserAttributes,
  AuthError,
} from "@aws-amplify/auth";
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
    const [attributes, session] = await Promise.all([
      fetchUserAttributes(),
      fetchAuthSession(),
    ]);
    const emailVerified = String(attributes?.email_verified) === "true";
    const email = emailVerified ? (attributes?.email || "").toLowerCase() : "";
    const groups = session.tokens?.idToken?.payload["cognito:groups"];
    const isAdmin =
      emailVerified &&
      ((Array.isArray(groups) && groups.includes("admin")) ||
        email.endsWith("@ubcbiztech.com"));
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
    staleTime: 20 * 60 * 1000, // stale time can be long as this is rarely modified
    retry: 1,
  });
}

/**
 * Sign-in state for components that gate UI on it. Shares the cached
 * `useUserAttributes` query, so it is safe to call from as many components as
 * need it rather than threading `signedIn` down through props.
 *
 * `authLoading` matters: until the query settles, `signedIn` is false for a
 * signed-in user, so acting on it (e.g. redirecting to /login) is wrong.
 */
export function useAuthState() {
  const { data, isLoading } = useUserAttributes();
  return {
    email: data?.email,
    signedIn: !!data?.email,
    isAdmin: data?.isAdmin ?? false,
    authLoading: isLoading,
  };
}
