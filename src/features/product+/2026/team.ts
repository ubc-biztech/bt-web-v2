import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBackend } from "@/lib/db";
import { PRODUCT_PLUS_EVENT_ID, PRODUCT_PLUS_YEAR } from "./access";

export interface TeamMember {
  user_id: string;
  name: string;
}

export interface Team {
  team_code: string;
  team_name: string;
  leader_user_id: string;
  members: TeamMember[];
}

const TEAM_PATH = `/team/${encodeURIComponent(PRODUCT_PLUS_EVENT_ID)}/${PRODUCT_PLUS_YEAR}`;

const teamQueryKey = (email: string | undefined) => ["productPlusTeam", email];

/** The HTTP status fetchBackend attaches to a failed request, if any. */
export function errorStatus(error: unknown): number | undefined {
  return typeof error === "object" && error !== null && "status" in error
    ? Number((error as { status: unknown }).status)
    : undefined;
}

/** The caller's team for Product+ 2026, or null when they are not on one. */
export function useProductPlusTeam(email: string | undefined) {
  return useQuery<Team | null>({
    queryKey: teamQueryKey(email),
    queryFn: () =>
      fetchBackend({
        endpoint: `${TEAM_PATH}/${encodeURIComponent(email!)}`,
        method: "GET",
      }),
    enabled: !!email,
  });
}

// The backend reads are eventually consistent, so each mutation writes its
// result straight into the cache rather than refetching.

export function useCreateTeam(email: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamName: string): Promise<Team> =>
      fetchBackend({
        endpoint: TEAM_PATH,
        method: "POST",
        data: { team_name: teamName },
      }),
    onSuccess: (team) => queryClient.setQueryData(teamQueryKey(email), team),
  });
}

export function useJoinTeam(email: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamCode: string): Promise<Team> =>
      fetchBackend({
        endpoint: `${TEAM_PATH}/join`,
        method: "POST",
        data: { team_code: teamCode },
      }),
    onSuccess: (team) => queryClient.setQueryData(teamQueryKey(email), team),
  });
}

export function useLeaveTeam(email: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (): Promise<null> =>
      fetchBackend({ endpoint: `${TEAM_PATH}/leave`, method: "POST" }),
    onSuccess: () => queryClient.setQueryData(teamQueryKey(email), null),
  });
}

export function useRemoveTeamMember(email: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userID: string): Promise<null> =>
      fetchBackend({
        endpoint: `${TEAM_PATH}/members/${encodeURIComponent(userID)}`,
        method: "DELETE",
      }),
    onSuccess: (_, userID) =>
      queryClient.setQueryData<Team | null>(teamQueryKey(email), (team) =>
        team
          ? {
              ...team,
              members: team.members.filter(
                (member) => member.user_id !== userID,
              ),
            }
          : team,
      ),
  });
}
