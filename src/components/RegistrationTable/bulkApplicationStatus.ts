import type { fetchBackend } from "@/lib/db";

type StatusUpdate = {
  email: string;
  fname: string;
  applicationStatus: string;
};

export async function updateApplicationStatuses(
  request: typeof fetchBackend,
  eventID: string,
  eventYear: number,
  updates: StatusUpdate[],
): Promise<string[]> {
  const { results }: { results: { email: string; success: boolean }[] } =
    await request({
      endpoint: "/registrations/massUpdate",
      method: "PUT",
      data: { eventID, eventYear, updates },
    });
  const confirmed = new Set(
    results.filter((row) => row.success === true).map((row) => row.email),
  );
  return updates
    .map(({ email }) => email)
    .filter((email) => !confirmed.has(email));
}
