import { KNOWN_STATUS_VALUES } from "./status";
import {
  normalizeStatusOptions,
  toLocalDateTimeInput,
} from "./partnershipsPageUtils";
import type {
  PartnerCommunicationFormState,
  PartnerFormState,
  PartnerLinkFormState,
  PartnerSummary,
  PartnershipEventFormState,
  PartnerDocumentFormState,
  TierConfigRow,
} from "./partnershipsPageTypes";

export const CUSTOM_STATUS_VALUE = "__custom_status__";
export const CUSTOM_TIER_VALUE = "__custom_tier__";

export const createTierRow = (label = "", amount = ""): TierConfigRow => ({
  localId: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  label,
  amount,
});

export const defaultStatusValues = normalizeStatusOptions(KNOWN_STATUS_VALUES);

export const defaultPartnerForm: PartnerFormState = {
  company: "",
  contactName: "",
  email: "",
  phone: "",
  contactRole: "",
  tier: "",
  linkedin: "",
  tagsInput: "",
  notes: "",
  isAlumni: false,
};

export const defaultLinkForm: PartnerLinkFormState = {
  partnerId: "",
  eventId: "",
  status: "reached_out",
  customStatus: "",
  packageTier: "",
  customTier: "",
  role: "",
  amount: "",
  followUpDate: "",
  notes: "",
};

export const defaultEventForm: PartnershipEventFormState = {
  name: "",
  year: String(new Date().getFullYear()),
  startDate: "",
  endDate: "",
  outreachStartDate: "",
  sponsorshipGoal: "",
  notes: "",
  archived: false,
  tierRows: [createTierRow()],
};

export const defaultDocumentForm: PartnerDocumentFormState = {
  title: "",
  type: "general",
  status: "draft",
  url: "",
  fileName: "",
  eventId: "",
  notes: "",
};

export const defaultCommunicationForm: PartnerCommunicationFormState = {
  subject: "",
  summary: "",
  channel: "email",
  direction: "outbound",
  occurredAtLocal: toLocalDateTimeInput(new Date().toISOString()),
  followUpDate: "",
  eventId: "",
};

export const roleSuggestions = [
  "Sponsor",
  "Mentor",
  "Keynote Speaker",
  "Judge",
  "Panelist",
  "Workshop Speaker",
  "Industry Partner",
];

export const getStatusSummary = (partner: PartnerSummary, limit = 2) => {
  const breakdown = Array.isArray(partner.statusBreakdown)
    ? partner.statusBreakdown
        .map((entry) => ({
          status: String(entry?.status || "").trim(),
          count: Number(entry?.count) || 0,
        }))
        .filter((entry) => entry.status && entry.count > 0)
    : [];

  if (breakdown.length) {
    return {
      visible: breakdown.slice(0, limit),
      hiddenCount: Math.max(0, breakdown.length - limit),
    };
  }

  if (partner.latestStatus) {
    return {
      visible: [{ status: partner.latestStatus, count: 1 }],
      hiddenCount: 0,
    };
  }

  return {
    visible: [],
    hiddenCount: 0,
  };
};
