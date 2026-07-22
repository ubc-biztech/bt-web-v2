import { fetchBackend } from "@/lib/db";

export async function checkMembership(email: string): Promise<boolean> {
  if (!email) return false;
  const normalizedEmail = email.trim().toLowerCase();

  const hasMembership = await fetchBackend({
    endpoint: `/users/checkMembership/${normalizedEmail}`,
    method: "GET",
    authenticatedCall: false,
  });

  return hasMembership === true;
}
