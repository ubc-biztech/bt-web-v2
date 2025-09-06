import { fetchBackend } from "./db";
import { DBRegistrationStatus } from "@/types";

export async function fetchRegistrationData(eventId: string, year: string) {
  let registrationData = await fetchBackend({
    endpoint: `/registrations?eventID=${eventId}&year=${year}`,
    method: "GET",
    authenticatedCall: false,
  });

  return registrationData.data;
}

// Helper to convert UI registration status to DB format
// This function handles converting human-readable status labels (like "Checked-In")
// to database values (like "checkedIn") for registration updates including check-ins
export function convertRegistrationStatusToDB(uiStatus: string): string {
  switch (uiStatus.toLowerCase()) {
    case "registered":
      return DBRegistrationStatus.REGISTERED;
    case "checked-in":
      return DBRegistrationStatus.CHECKED_IN;
    case "cancelled":
      return DBRegistrationStatus.CANCELLED;
    case "incomplete":
      return DBRegistrationStatus.INCOMPLETE;
    case "waitlisted":
      return DBRegistrationStatus.WAITLISTED;
    default:
      return uiStatus.toLowerCase();
  }
}

// Helper to prepare update payload
export function prepareUpdatePayload(
  column: string,
  value: any,
  eventId: string,
  year: string,
) {
  const basePayload = {
    eventID: eventId,
    year: parseInt(year),
  };

  if (column === "registrationStatus") {
    return {
      ...basePayload,
      [column]: convertRegistrationStatusToDB(value as string),
    };
  }

  if (column === "points") {
    return {
      ...basePayload,
      [column]: parseInt(value as string),
    };
  }

  return {
    ...basePayload,
    [column]: value,
  };
}

export async function updateRegistrationData(
  email: string,
  fname: string,
  body: any,
) {
  console.log("Updating registration data", body);
  try {
    await fetchBackend({
      endpoint: `/registrations/${email}/${fname}`,
      method: "PUT",
      authenticatedCall: false,
      data: body,
    });
  } catch (e) {
    console.error("Internal Server Error, Update Failed");
  }
}

export class UnauthenticatedUserError extends Error {
  constructor(message: string = "User is not authenticated") {
    super(message);
    this.name = "UnauthenticatedUserError";
  }
}

export function clearCognitoCookies() {
  if (typeof window !== "undefined") {
    const clearCookie = (name: string) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; max-age=0; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; max-age=0; path=/; domain=${window.location.hostname};`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; max-age=0; path=/; domain=.${window.location.hostname};`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; max-age=0; path=/; secure;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; max-age=0; path=/; secure; samesite=strict;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; max-age=0; path=/; secure; samesite=lax;`;
    };

    const cookies = document.cookie.split(";");
    cookies.forEach((cookie) => {
      const cookieName = cookie.split("=")[0].trim();
      console.log(cookieName);
      if (
        cookieName.includes("cognito") ||
        cookieName.includes("Cognito") ||
        cookieName.startsWith("CognitoIdentityServiceProvider") ||
        cookieName.includes("idToken") ||
        cookieName.includes("accessToken") ||
        cookieName.includes("refreshToken")
      ) {
        clearCookie(cookieName);
      }
    });
  }
}
