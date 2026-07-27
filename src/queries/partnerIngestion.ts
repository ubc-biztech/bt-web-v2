import { fetchBackend } from "@/lib/db";

export type ParsedPartner = {
  email: string;
  firstName: string;
  lastName: string;
  pronouns?: string;
  linkedIn?: string;
  company?: string;
  position?: string;
};

export type PartnerBatchResult = {
  email: string;
  status: "created" | "skipped" | "failed";
  reason?: string;
  profileID?: string;
};

export type PartnerBatchResponse = {
  created: number;
  skipped: number;
  failed: number;
  results: PartnerBatchResult[];
  eventID?: string;
  year?: number;
};

export async function createPartnerMemberships(
  partners: ParsedPartner[],
): Promise<PartnerBatchResponse> {
  return fetchBackend({
    endpoint: "/members/partners/batch",
    method: "POST",
    data: {
      partners,
    },
  });
}

export async function createPartnerRegistrations({
  eventID,
  year,
  partners,
}: {
  eventID: string;
  year: number;
  partners: ParsedPartner[];
}): Promise<PartnerBatchResponse> {
  return fetchBackend({
    endpoint: "/registrations/partners/batch",
    method: "POST",
    data: {
      eventID,
      year,
      partners,
    },
  });
}
