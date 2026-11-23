import { fetchBackend } from "@/lib/db";
import { eventRegistrationsEndpoint } from "@/lib/registrationQuery";
import type { Registration } from "@/types/types";
import { isBtxRegistrationStatus } from "./market";

export interface Investor {
  email: string;
  name: string;
}

export async function investors(): Promise<Investor[]> {
  const { data }: { data: Registration[] } = await fetchBackend({
    endpoint: eventRegistrationsEndpoint("kickstart", "2026"),
    method: "GET",
  });
  const roster = new Map<string, Investor>();
  for (const row of data) {
    if (!isBtxRegistrationStatus(row.registrationStatus)) continue;
    const email = row.id.trim().toLowerCase();
    const name = [
      row.basicInformation?.fname ?? row.fname,
      row.basicInformation?.lname,
    ]
      .filter(Boolean)
      .join(" ");
    roster.set(email, { email, name: name || email });
  }
  return Array.from(roster.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export const launchIpo = () =>
  fetchBackend({ endpoint: "/btx/admin/ipo", method: "POST" });

export interface GrantBatch {
  requestId: string;
  amountCents: number;
  targets: string[];
}

export type GrantOutcome = {
  userId: string;
  status: "APPLIED" | "REJECTED";
  message?: string;
};

// Each request ID is bound to its original amount and complete recipient list.
export async function grant(batch: GrantBatch): Promise<GrantOutcome[]> {
  const { data } = await fetchBackend({
    endpoint: "/btx/admin/grant",
    method: "POST",
    data: { ...batch },
  });
  return data.outcomes;
}
