/**
 * TODO(directors): confirm the real HelloHacks event id(s) before registration
 * opens. The registration form key in `registry.ts` must match the event's URL
 * slug, and this set gates the custom success screen on /register/success.
 */
export type HelloHacksEventId = "HelloHacks" | "HelloHacks_2026";

const HELLO_HACKS_EVENT_IDS = new Set<string>([
  "HelloHacks",
  "HelloHacks_2026",
]);

export function isHelloHacksEventId(
  eventId?: string,
): eventId is HelloHacksEventId {
  return eventId !== undefined && HELLO_HACKS_EVENT_IDS.has(eventId);
}
