import type { fetchBackend } from "@/lib/db";

export function eventRegistrationsEndpoint(eventId: string, year: string) {
  // Encode query values so event IDs such as "product+" keep their literal +.
  const query = new URLSearchParams({ eventID: eventId, year });
  return `/registrations?${query.toString()}`;
}

type Batch = {
  eventID: string;
  eventYear: number;
  updates: { email: string; fname: string; applicationStatus: string }[];
};

export async function updateApplicationStatuses(
  request: typeof fetchBackend,
  data: Batch,
) {
  const { results } = await request({
    method: "PUT",
    endpoint: "/registrations/massUpdate",
    data,
  });
  const confirmed = new Set<string>();
  for (const { email, success } of results) {
    if (success === true) confirmed.add(email);
  }
  return data.updates
    .map(({ email }) => email)
    .filter((email) => !confirmed.has(email));
}
