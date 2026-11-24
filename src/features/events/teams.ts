import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { fetchBackend } from "@/lib/db";

export interface TeamMember {
  user_id: string;
  name: string;
}

export interface Team {
  team_code: string;
  team_name: string;
  leader_user_id: string;
  projectId?: string;
  members: TeamMember[];
}

export type TeamQueryOptions = Pick<
  UseQueryOptions<Team | null>,
  "staleTime" | "gcTime" | "refetchOnWindowFocus" | "refetchInterval" | "retry"
>;

export const eventTeamQueryKey = (
  eventId: string,
  year: number,
  email?: string,
) => ["eventTeam", eventId, year, email];

const teamPath = (eventId: string, year: number) =>
  `/team/${encodeURIComponent(eventId)}/${year}`;

export function errorStatus(error: unknown): number | undefined {
  return typeof error === "object" && error !== null && "status" in error
    ? Number((error as { status: unknown }).status)
    : undefined;
}

export function useEventTeam(
  eventId: string,
  year: number,
  email: string | undefined,
  options: TeamQueryOptions = {},
) {
  return useQuery<Team | null>({
    ...options,
    queryKey: eventTeamQueryKey(eventId, year, email),
    queryFn: () =>
      fetchBackend({
        endpoint: `${teamPath(eventId, year)}/${encodeURIComponent(email!)}`,
        method: "GET",
      }),
    enabled: !!email,
  });
}

export function useCreateEventTeam(
  eventId: string,
  year: number,
  email: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamName: string): Promise<Team> =>
      fetchBackend({
        endpoint: teamPath(eventId, year),
        method: "POST",
        data: { team_name: teamName },
      }),
    // Team reads are eventually consistent. Keep the successful write response.
    onSuccess: async (team) => {
      const queryKey = eventTeamQueryKey(eventId, year, email);
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(queryKey, team);
    },
  });
}

export function useJoinEventTeam(
  eventId: string,
  year: number,
  email: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamCode: string): Promise<Team> =>
      fetchBackend({
        endpoint: `${teamPath(eventId, year)}/join`,
        method: "POST",
        data: { team_code: teamCode },
      }),
    onSuccess: async (team) => {
      const queryKey = eventTeamQueryKey(eventId, year, email);
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(queryKey, team);
    },
  });
}

export function useLeaveEventTeam(
  eventId: string,
  year: number,
  email: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (): Promise<null> =>
      fetchBackend({
        endpoint: `${teamPath(eventId, year)}/leave`,
        method: "POST",
      }),
    onSuccess: async () => {
      const queryKey = eventTeamQueryKey(eventId, year, email);
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(queryKey, null);
    },
  });
}

export function useRemoveEventTeamMember(
  eventId: string,
  year: number,
  email: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string): Promise<null> =>
      fetchBackend({
        endpoint: `${teamPath(eventId, year)}/members/${encodeURIComponent(userId)}`,
        method: "DELETE",
      }),
    onSuccess: async (_, userId) => {
      const queryKey = eventTeamQueryKey(eventId, year, email);
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<Team | null>(queryKey, (team) =>
        team
          ? {
              ...team,
              members: team.members.filter(
                (member) => member.user_id !== userId,
              ),
            }
          : team,
      );
    },
  });
}
