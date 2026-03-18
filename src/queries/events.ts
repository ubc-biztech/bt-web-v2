import { fetchBackend } from "@/lib/db";
import { BiztechEvent } from "@/types/types";
import { useQuery } from "@tanstack/react-query";

async function fetchAllEvents(): Promise<BiztechEvent[]> {
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

  return events;
}

export async function getEvents(): Promise<BiztechEvent[]> {
  const events = await fetchAllEvents();
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

/**
 * Hook for admin pages - returns all events without filtering
 */
export function useAllEvents() {
  return useQuery({
    queryKey: ["events", "all"],
    queryFn: fetchAllEvents,
    staleTime: 60 * 1000,
  });
}
