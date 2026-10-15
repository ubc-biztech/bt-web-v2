import { useQuery } from "@tanstack/react-query";
import { fetchBackend } from "@/lib/db";
import {
  orderSubmissions,
  audienceSubmissionsPath,
  type AudienceResponse,
  type VoteChoice,
} from "../arena";

export const audienceQueryKey = (identity: string | null) =>
  ["productplus", "2026", "audience", identity] as const;

export async function getAudienceSubmissions(
  identity: string | null,
): Promise<AudienceResponse> {
  const data: AudienceResponse = await fetchBackend({
    endpoint: audienceSubmissionsPath(identity),
    method: "GET",
    authenticatedCall: identity !== null,
  });
  const storageKey = `productplus:2026:arena-order:${identity ?? "guest"}`;
  try {
    const saved: unknown = JSON.parse(
      sessionStorage.getItem(storageKey) ?? "[]",
    );
    const order = Array.isArray(saved)
      ? saved.filter((code): code is string => typeof code === "string")
      : [];
    data.submissions = orderSubmissions(data.submissions, order);
    sessionStorage.setItem(
      storageKey,
      JSON.stringify(data.submissions.map((team) => team.team_code)),
    );
  } catch {
    // Storage may be unavailable. React Query still retains the current order.
  }
  return data;
}

export function useAudienceSubmissions(
  identity: string | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: audienceQueryKey(identity),
    queryFn: () => getAudienceSubmissions(identity),
    enabled,
    staleTime: Infinity,
    refetchOnWindowFocus: "always",
    retry: 1,
  });
}

export async function postAudienceVote(
  team_code: string,
  choice: VoteChoice,
): Promise<{ has_voted: true }> {
  return fetchBackend({
    endpoint: "/productplus/audience/vote",
    method: "POST",
    data: { team_code, choice },
  });
}
