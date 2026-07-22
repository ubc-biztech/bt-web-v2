import { fetchBackend } from "@/lib/db";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Member } from "@/types";

export type { Member } from "@/types";

export async function getMembers(): Promise<Member[]> {
  const response = await fetchBackend({
    endpoint: "/members",
    method: "GET",
  });
  return response || [];
}

export function useMembers() {
  return useQuery({
    queryKey: ["members"],
    queryFn: getMembers,
    staleTime: 60 * 1000,
  });
}

export function useInvalidateMembers() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["members"] });
  };
}
