import { portfolio } from "./seedApi";
import { useUserRegistrations } from "@/queries/registrations";
import { useUserAttributes } from "@/queries/user";
import { useQuery } from "@tanstack/react-query";
import { fetchBackend } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/user";

export function useBtxProfile(userId: string) {
  const { data: user } = useQuery({
    queryKey: ["btx", "profile", userId],
    queryFn: getAuthenticatedUser,
    enabled: !!userId,
    gcTime: 0,
  });

  const email = user?.email || user?.id;
  const { data: registrations } = useUserRegistrations(
    user?.admin ? undefined : email,
  );
  const registration = registrations?.find(
    (row) =>
      row["eventID;year"] === "kickstart;2026" &&
      row.registrationStatus === "acceptedComplete",
  ) as { teamID?: string } | undefined;

  return { user, registration };
}

export function useCompanyTeam(projectId: string) {
  const { data: user } = useUserAttributes();
  return useQuery({
    queryKey: ["kickstart-teams", "2026", user?.sub],
    enabled: !!user?.sub,
    queryFn: (): Promise<{ id: string; memberNames?: string[] }[]> =>
      fetchBackend({
        endpoint: "/team/kickstart/2026",
        method: "GET",
      }),
    select: (teams) =>
      teams.find((team) => "kickstart;2026:" + team.id === projectId)
        ?.memberNames ?? [],
  });
}

export function usePortfolio(eventId: string, userId: string, enabled = true) {
  return useQuery({
    queryKey: ["btx-seed", eventId, userId, "portfolio"],
    queryFn: portfolio,
    enabled: !!userId && enabled,
    gcTime: 0,
  });
}
