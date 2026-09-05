import { fetchBackend } from "@/lib/db";
import { User } from "@/types";

export function ensureAuthenticatedUser() {
  return fetchBackend({
    endpoint: "/users/ensure",
    method: "POST",
  });
}

export function needsOnboarding(user: User) {
  return user.needsOnboarding !== false;
}

export function getAuthenticatedUser(): Promise<User> {
  return fetchBackend({ endpoint: "/users/self", method: "GET" });
}
