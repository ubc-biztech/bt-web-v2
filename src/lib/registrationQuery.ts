import type { fetchBackend } from "@/lib/db";
import { isRegistrationStatus } from "@/lib/registrationStatus";
import type { DBRegistrationStatus } from "@/types";

export function eventRegistrationsEndpoint(eventId: string, year: string) {
  // Encode query values so event IDs such as "product+" keep their literal +.
  const query = new URLSearchParams({ eventID: eventId, year });
  return `/registrations?${query.toString()}`;
}

export type RegistrationStatusUpdate = {
  email: string;
  registrationStatus: DBRegistrationStatus;
};

type Batch = {
  eventID: string;
  eventYear: number;
  updates: (RegistrationStatusUpdate & { fname: string })[];
};

export async function updateRegistrationStatuses(
  request: typeof fetchBackend,
  data: Batch,
) {
  const { results } = await request({
    method: "PUT",
    endpoint: "/registrations/massUpdate",
    data,
  });
  const savedStatuses = new Map<string, DBRegistrationStatus>();
  for (const { email, success, registrationStatus } of results) {
    if (success === true && isRegistrationStatus(registrationStatus)) {
      savedStatuses.set(email, registrationStatus);
    }
  }
  const confirmed: RegistrationStatusUpdate[] = [];
  const failed: string[] = [];
  for (const { email } of data.updates) {
    const registrationStatus = savedStatuses.get(email);
    if (registrationStatus) confirmed.push({ email, registrationStatus });
    else failed.push(email);
  }
  return { confirmed, failed };
}
