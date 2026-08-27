import { fetchBackend } from "@/lib/db";
import { User } from "@/types";

export const CURRENT_ONBOARDING_YEAR = new Date().getFullYear();

export function ensureAuthenticatedUser() {
  return fetchBackend({
    endpoint: "/users/ensure",
    method: "POST",
  });
}

export function needsOnboarding(user: User) {
  return user.onboardingYear !== CURRENT_ONBOARDING_YEAR;
}

export function getAuthenticatedUser(): Promise<User> {
  return fetchBackend({ endpoint: "/users/self", method: "GET" });
}
