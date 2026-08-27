import { useEffect } from "react";
import { useRouter } from "next/router";
import { fetchAuthSession } from "@aws-amplify/auth";
import { getAuthenticatedUser, needsOnboarding } from "@/lib/user";
// checks if a signed-in user must complete this year’s onboarding
export default function OnboardingChecker() {
  const router = useRouter();

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const session = await fetchAuthSession();
        if (!session.tokens?.accessToken) return;

        const user = await getAuthenticatedUser();
        if (needsOnboarding(user)) {
          await router.replace(
            `/onboarding?redirect=${encodeURIComponent(router.asPath)}`,
          );
        }
      } catch (error) {
        console.error("Failed to check onboarding:", error);
      }
    }

    checkOnboarding();
  }, [router]);

  return null;
}
