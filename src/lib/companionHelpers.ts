import Events from "@/constants/companion-events";
import type { Event } from "@/constants/companion-events";
import { fetchBackend } from "@/lib/db";
import { DBRegistrationStatus } from "@/types";

/**
 * Lookup companion configuration by event ID and year
 * @param eventId - Event identifier (e.g., "kickstart", "blueprint")
 * @param year - Event year
 * @returns Event configuration or null if not found
 */
export function getCompanionByEventIdYear(
  eventId: string,
  year: number,
): Event | null {
  const companion = Events.find(
    (event) => event.eventID === eventId && event.year === year,
  );
  return companion || null;
}

/**
 * Check if a user has a valid registration for an event
 * @param email - User email
 * @param eventId - Event identifier
 * @param year - Event year
 * @returns Registration object or null if not found/invalid
 */
export async function checkUserRegistration(
  email: string,
  eventId: string,
  year: number,
): Promise<any | null> {
  try {
    const response = await fetchBackend({
      endpoint: `/registrations?email=${email}`,
      method: "GET",
    });

    if (!response?.data) return null;

    const eventIdYearKey = `${eventId};${year}`;
    const showcaseKey = `${eventId}-showcase;${year}`;

    const registration = response.data.find(
      (reg: any) =>
        reg["eventID;year"] === eventIdYearKey ||
        reg["eventID;year"] === showcaseKey,
    );

    if (!registration) return null;
    // Validate registration status
    if (!hasValidCompanionAccess(registration)) return null;

    return registration;
  } catch (error) {
    console.error("Error checking user registration:", error);
    return null;
  }
}

/**
 * Check if a registration has valid status for companion access
 * @param registration - Registration object
 * @returns true if registration allows companion access
 */
export function hasValidCompanionAccess(registration: any): boolean {
  if (!registration) return false;

  const validStatuses = [
    DBRegistrationStatus.REGISTERED,
    DBRegistrationStatus.ACCEPTED_COMPLETE,
    DBRegistrationStatus.CHECKED_IN,
    DBRegistrationStatus.ACCEPTED,
  ];

  return validStatuses.includes(registration.registrationStatus);
}

/**
 * Get the latest registered event for a user that has a companion
 * @param email - User email
 * @returns Object with eventId and year, or null if no registered events with companions
 */
export async function getLatestRegisteredEvent(
  email: string,
): Promise<{ eventId: string; year: number } | null> {
  try {
    const response = await fetchBackend({
      endpoint: `/registrations?email=${email}`,
      method: "GET",
    });

    if (!response?.data || response.data.length === 0) return null;

    // Filter registrations that have companions and valid status
    const registrationsWithCompanions: Array<{
      eventId: string;
      year: number;
      activeUntil: Date;
    }> = response.data
      .filter((reg: any) => {
        if (!hasValidCompanionAccess(reg)) return false;

        const eventIdYearString = reg["eventID;year"];
        if (!eventIdYearString) return false;

        const [eventId, yearStr] = eventIdYearString.split(";");
        const year = parseInt(yearStr);

        const baseEventId = eventId.replace("-showcase", "");

        const companion = getCompanionByEventIdYear(baseEventId, year);
        return companion !== null;
      })
      .map((reg: any) => {
        const eventIdYearString = reg["eventID;year"];
        const [eventId, yearStr] = eventIdYearString.split(";");
        const year = parseInt(yearStr);

        const baseEventId = eventId.replace("-showcase", "");
        const companion = getCompanionByEventIdYear(baseEventId, year);

        return {
          eventId: baseEventId,
          year,
          activeUntil: companion?.activeUntil || new Date(0),
        };
      });

    if (registrationsWithCompanions.length === 0) return null;

    registrationsWithCompanions.sort(
      (a, b) => b.activeUntil.getTime() - a.activeUntil.getTime(),
    );

    const latest = registrationsWithCompanions[0];
    return { eventId: latest.eventId, year: latest.year };
  } catch (error) {
    console.error("Error getting latest registered event:", error);
    return null;
  }
}
