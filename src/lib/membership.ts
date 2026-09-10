import { fetchBackend } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";

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

export function useMembershipStatus(email?: string) {
  const normalizedEmail = email?.trim().toLowerCase();

  return useQuery({
    queryKey: ["membershipStatus", normalizedEmail],
    queryFn: () => checkMembership(normalizedEmail!),
    enabled: Boolean(normalizedEmail),
    staleTime: 20 * 60 * 1000,
  });
}
