import { fetchBackend } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";

export interface Registration {
  "eventID;year": string;
  [key: string]: unknown;
}

export async function getUserRegistrations(
  email: string,
): Promise<Registration[]> {
  const response = await fetchBackend({
    endpoint: `/registrations?email=${email}`,
    method: "GET",
  });
  return response?.data || [];
}

export function useUserRegistrations(email: string | undefined) {
  return useQuery({
    queryKey: ["registrations", email],
    queryFn: () => getUserRegistrations(email!),
    enabled: !!email,
    staleTime: 60 * 1000,
  });
}
