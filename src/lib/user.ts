import { fetchBackend } from "@/lib/db";

export function ensureAuthenticatedUser() {
  return fetchBackend({
    endpoint: "/users/ensure",
    method: "POST",
  });
}
