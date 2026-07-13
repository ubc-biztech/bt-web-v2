import { fetchBackend } from "@/lib/db";
import { BiztechEvent } from "@/types/types";
import { useQuery } from "@tanstack/react-query";

export type EventCounts = {
  registeredCount?: number;
  checkedInCount?: number;
  [key: string]: unknown;
};

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

export async function getEvent(
  eventId: string,
  year: string | number,
): Promise<BiztechEvent> {
  return fetchBackend({
    endpoint: `/events/${eventId}/${year}`,
    method: "GET",
    authenticatedCall: false,
  });
}

export function useEvent(eventId?: string, year?: string) {
  return useQuery({
    queryKey: ["events", eventId, year],
    queryFn: () => getEvent(eventId!, year!),
    enabled: !!eventId && !!year,
    staleTime: 60 * 1000,
  });
}

export async function getEventCounts(
  eventId: string,
  year: string | number,
): Promise<EventCounts> {
  const params = new URLSearchParams({ count: String(true) });

  return fetchBackend({
    endpoint: `/events/${eventId}/${year}?${params}`,
    method: "GET",
    authenticatedCall: false,
  });
}

export function useEventCounts(eventId?: string, year?: string) {
  return useQuery({
    queryKey: ["events", eventId, year, "counts"],
    queryFn: () => getEventCounts(eventId!, year!),
    enabled: !!eventId && !!year,
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
