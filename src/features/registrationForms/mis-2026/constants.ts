export type MISNightEventId = "MISNight" | "MIS_Night_2026";

const MIS_NIGHT_EVENT_IDS = new Set<string>(["MISNight", "MIS_Night_2026"]);

export function isMISNightEventId(
  eventId?: string,
): eventId is MISNightEventId {
  return eventId !== undefined && MIS_NIGHT_EVENT_IDS.has(eventId);
}
