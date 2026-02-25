import { fetchBackend } from "@/lib/db";
import { BiztechEvent } from "@/types/types";
import { useQuery } from "@tanstack/react-query";

export async function getEvents(): Promise<BiztechEvent[]> {
  const response = await fetchBackend({
    endpoint: "/events",
    method: "GET",
    authenticatedCall: false,
  });

  const events: BiztechEvent[] = response || [];

  events.sort(
    (a: BiztechEvent, b: BiztechEvent) =>
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );

  return events.filter(
    (e: BiztechEvent) => e.isPublished && e.id !== "alumni-night",
  );
}

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
    staleTime: 60 * 1000,
  });
}
