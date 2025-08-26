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
