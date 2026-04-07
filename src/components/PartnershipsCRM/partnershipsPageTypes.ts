export type PartnerStatus = string;

export type TierConfig = {
  id: string;
  label: string;
  amount: number | null;
};

export type PartnerSummary = {
  id: string;
  company: string;
  email: string;
  contactName: string;
  phone: string;
  contactRole: string;
  tier: string;
  linkedin: string;
  notes: string;
  tags: string[];
  isAlumni: boolean;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
  relationshipCount: number;
  confirmedCount: number;
  paidCount: number;
  totalAmount: number;
  statusBreakdown?: Array<{
    status: string;
    count: number;
    amount?: number;
  }>;
  latestStatus: PartnerStatus | null;
  latestEventIdYear: string | null;
  lastTouchedAt: number | null;
};

export type PartnerLink = {
  id: string;
  partnerId: string;
  eventId: string;
  eventYear: number;
  eventIdYear: string;
  eventName: string;
  status: PartnerStatus;
  packageTier: string;
  role: string;
  notes: string;
  amount: number | null;
  followUpDate: string | null;
  createdAt: number;
  updatedAt: number;
  eventStartDate?: string | null;
  eventEndDate?: string | null;
};

export type PartnerDocument = {
  id: string;
  partnerId: string;
  title: string;
  type: string;
  status: string;
  url: string;
  fileName: string;
  notes: string;
  eventId?: string | null;
  eventYear?: number | null;
  eventName?: string | null;
  createdAt: number;
  updatedAt: number;
};

export type PartnerCommunication = {
  id: string;
  partnerId: string;
  subject: string;
  summary: string;
  channel: string;
  direction: "inbound" | "outbound" | string;
  occurredAt: string;
  followUpDate: string | null;
  eventId?: string | null;
  eventYear?: number | null;
  eventName?: string | null;
  actorEmail?: string | null;
  sender?: string | null;
  recipientEmail?: string | null;
  source?: string | null;
  sourceProvider?: string | null;
  sourceMethod?: string | null;
  externalMessageId?: string | null;
  externalThreadId?: string | null;
  createdAt: number;
  updatedAt: number;
};

export type DirectorySummary = {
  totalPartners: number;
  archivedPartners: number;
  activePartners: number;
  alumniPartners: number;
  totalRelationships: number;
  confirmedRelationships: number;
  paidRelationships: number;
  upcomingFollowUps: number;
  statusCounts: Record<string, number>;
  packageTierCounts?: Record<string, number>;
  pipeline?: {
    byStatus?: Record<string, { count: number; amount: number }>;
    pipelineAmount?: number;
    securedAmount?: number;
  };
};

export type PartnershipsEmailSyncStatus = {
  provider: string;
  enabled: boolean;
  configured: boolean;
  ingestUrl: string;
  message: string;
  lastIngestAt: string | null;
  lastSuccessAt: string | null;
  lastIngestStatusCode: number | null;
  recentActorEmails?: string[];
};

export type EventOption = {
  id: string;
  year: number;
  name: string;
  startDate: string | null;
  endDate: string | null;
  outreachStartDate: string | null;
  sponsorshipGoal: number | null;
  tierConfigs: TierConfig[];
  packageTiers: string[];
  notes: string;
  archived: boolean;
  relationshipCount: number;
  confirmedCount: number;
  paidCount: number;
  committedAmount: number;
  securedAmount: number;
};

export type EventSponsorship = PartnerLink & {
  partner: {
    id: string;
    company: string;
    contactName: string;
    email: string;
    phone: string;
    contactRole: string;
    tier: string;
    archived: boolean;
    isAlumni: boolean;
  } | null;
};

export type EventDetailResponse = {
  event: EventOption;
  sponsorships: EventSponsorship[];
  pipeline?: {
    byStatus?: Record<string, { count: number; amount: number }>;
    pipelineAmount?: number;
    securedAmount?: number;
  };
};

export type PartnerDetailResponse = {
  partner: PartnerSummary;
  links: PartnerLink[];
  documents: PartnerDocument[];
  communications: PartnerCommunication[];
  statusOptions?: string[];
  packageTierOptions?: string[];
};

export type PartnerFormState = {
  company: string;
  contactName: string;
  email: string;
  phone: string;
  contactRole: string;
  tier: string;
  linkedin: string;
  tagsInput: string;
  notes: string;
  isAlumni: boolean;
};

export type PartnerLinkFormState = {
  partnerId: string;
  eventId: string;
  status: string;
  customStatus: string;
  packageTier: string;
  customTier: string;
  role: string;
  amount: string;
  followUpDate: string;
  notes: string;
};

export type TierConfigRow = {
  localId: string;
  label: string;
  amount: string;
};

export type PartnershipEventFormState = {
  name: string;
  year: string;
  startDate: string;
  endDate: string;
  outreachStartDate: string;
  sponsorshipGoal: string;
  notes: string;
  archived: boolean;
  tierRows: TierConfigRow[];
};

export type PartnerDocumentFormState = {
  title: string;
  type: string;
  status: string;
  url: string;
  fileName: string;
  eventId: string;
  notes: string;
};

export type PartnerCommunicationFormState = {
  subject: string;
  summary: string;
  channel: string;
  direction: "inbound" | "outbound";
  occurredAtLocal: string;
  followUpDate: string;
  eventId: string;
};
