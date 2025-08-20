import { BiztechEvent } from "@/types";

export function sortEventsByDate(
  events: BiztechEvent[],
  order: "asc" | "desc" = "asc",
): BiztechEvent[] {
  return events.sort((a, b) => {
    const dateA = new Date(a.startDate).getTime();
    const dateB = new Date(b.startDate).getTime();

    return order === "asc" ? dateA - dateB : dateB - dateA;
  });
}

export function getHighlightedEvent(events: BiztechEvent[]): BiztechEvent {
  const now = new Date();

  const validEvents = events.filter((event) => event.startDate != null);

  const futureEvents = validEvents
    .filter((event) => new Date(event.startDate) >= now)
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );

  if (futureEvents.length > 0) {
    return futureEvents[0];
  }

  const pastEvents = validEvents
    .filter((event) => new Date(event.startDate) < now)
    .sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    );

  return pastEvents[0];
}
