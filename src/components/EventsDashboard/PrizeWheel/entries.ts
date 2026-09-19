export type WheelEntry = { id: string; name: string };
export type WheelSubmission = {
  id: string;
  respondentName?: string;
  respondentEmail?: string;
};

// Collapse matching emails. Email-free submissions stay separate so admins
// can review duplicates without merging different attendees with the same name.
export function getWheelEntries(submissions: WheelSubmission[]): WheelEntry[] {
  const entries = new Map<string, WheelEntry>();
  for (const submission of submissions) {
    const name = submission.respondentName?.trim();
    const id =
      submission.respondentEmail?.trim().toLowerCase() || submission.id;
    if (name && id && !entries.has(id)) entries.set(id, { id, name });
  }
  return Array.from(entries.values());
}

export function randomEntryIndex(count: number): number {
  if (!Number.isSafeInteger(count) || count < 1 || count > 0xffffffff) {
    throw new Error("The wheel needs at least one entrant.");
  }
  const limit = Math.floor(0x100000000 / count) * count;
  const values = new Uint32Array(1);
  do crypto.getRandomValues(values);
  while (values[0] >= limit);
  return values[0] % count;
}
