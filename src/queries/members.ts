import { fetchBackend } from "@/lib/db";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface Member {
  profileID: string;
  id: string;
  firstName: string;
  lastName: string;
  faculty?: string;
  year?: string;
  major?: string;
  cardCount?: number;
  international?: boolean;
  topics?: string[];
  createdAt?: number;
  updatedAt?: number;
}

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

export async function updateMemberCardCount(
  memberId: string,
  increment: number,
): Promise<void> {
  await fetchBackend({
    endpoint: `/members/${memberId}`,
    method: "PATCH",
    data: { cardCount: increment },
  });
}
