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



// Helper to prepare update payload
export function prepareUpdatePayload(
  column: string,
  value: any,
  eventId: string,
  year: string,
  currentApplicationStatus?: string,
  currentRegistrationStatus?: string,
) {
  const basePayload = {
    eventID: eventId,
    year: parseInt(year),
  };

  if (column === "registrationStatus" || column === "applicationStatus") {
    // For status updates, send both current statuses so backend can implement proper logic
    return {
      ...basePayload,
      applicationStatus: column === "applicationStatus" ? value : currentApplicationStatus,
      registrationStatus: column === "registrationStatus" ? value : currentRegistrationStatus,
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
  console.log("🔄 Sending PUT request to backend:", {
    endpoint: `/registrations/${email}/${fname}`,
    payload: body
  });
  
  try {
    const response = await fetchBackend({
      endpoint: `/registrations/${email}/${fname}`,
      method: "PUT",
      authenticatedCall: false,
      data: body,
    });
    
    console.log("✅ Backend response received:", response);
    return response;
  } catch (e) {
    console.error("❌ Backend request failed:", e);
    throw e;
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

    // Clear localStorage items
    const localStorageKeys = Object.keys(localStorage);
    localStorageKeys.forEach((key) => {
      if (
        key.includes("cognito") ||
        key.includes("Cognito") ||
        key.startsWith("CognitoIdentityServiceProvider") ||
        key.includes("idToken") ||
        key.includes("accessToken") ||
        key.includes("refreshToken") ||
        key.includes("amplify") ||
        key.includes("aws.cognito") ||
        key.includes("user") ||
        key.includes("auth")
      ) {
        localStorage.removeItem(key);
      }
    });
  }
}
