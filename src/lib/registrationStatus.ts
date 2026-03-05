import { DBRegistrationStatus } from "@/types";

export const RegistrationStatusConfig = {
  [DBRegistrationStatus.REGISTERED]: {
    label: "Registered",
    sortOrder: 2,
    color: "#AAE7FF",
  },
  [DBRegistrationStatus.ACCEPTED_PENDING]: {
    label: "Accepted Pending",
    sortOrder: 5,
    color: "#AAE7FF",
  },
  [DBRegistrationStatus.ACCEPTED]: {
    label: "Accepted",
    sortOrder: 6,
    color: "#AAE7FF",
  },
  [DBRegistrationStatus.ACCEPTED_COMPLETE]: {
    label: "Accepted Complete",
    sortOrder: 7,
    color: "#AAE7FF",
  },
  [DBRegistrationStatus.CHECKED_IN]: {
    label: "Checked-In",
    sortOrder: 1,
    color: "#70E442",
  },
  [DBRegistrationStatus.WAITLISTED]: {
    label: "Waitlisted",
    sortOrder: 3,
    color: "#D79EF1",
  },
  [DBRegistrationStatus.CANCELLED]: {
    label: "Cancelled",
    sortOrder: 4,
    color: "#FB6F8E",
  },
  [DBRegistrationStatus.INCOMPLETE]: {
    label: "Incomplete",
    sortOrder: 8,
    color: "#FFAD8F",
  },
} as const;

const EXCLUDED_STATUSES = new Set([DBRegistrationStatus.ACCEPTED_PENDING]);

export const RegistrationStatusOptions = Object.freeze(
  Object.entries(RegistrationStatusConfig)
    .filter(([value]) => !EXCLUDED_STATUSES.has(value as DBRegistrationStatus))
    .map(([value, cfg]) => ({
      value,
      label: cfg.label,
    })),
);

export const getSortOrder = (value?: string | null) =>
  RegistrationStatusConfig[value as DBRegistrationStatus]?.sortOrder ?? 999;

export const getStatusLabel = (value: string) =>
  RegistrationStatusConfig[value as DBRegistrationStatus]?.label ?? value;

export const getStatusColor = (value?: string | null): string =>
  RegistrationStatusConfig[value as DBRegistrationStatus]?.color ?? "#ffffff";

export const isNeedsPayment = (value?: string | null): boolean =>
  value === DBRegistrationStatus.ACCEPTED ||
  value === DBRegistrationStatus.INCOMPLETE;

export const isNeedsConfirmation = (value?: string | null): boolean =>
  value === DBRegistrationStatus.ACCEPTED_PENDING;

export const isConfirmed = (value?: string | null): boolean =>
  value === DBRegistrationStatus.ACCEPTED_COMPLETE;

export const isCheckedIn = (value?: string | null): boolean =>
  value === DBRegistrationStatus.CHECKED_IN;

export const isWaitlisted = (value?: string | null): boolean =>
  value === DBRegistrationStatus.WAITLISTED;

export const isCancelled = (value?: string | null): boolean =>
  value === DBRegistrationStatus.CANCELLED;

export const isRegistered = (value?: string | null): boolean =>
  value === DBRegistrationStatus.REGISTERED;

export const isAccepted = (value?: string | null): boolean =>
  value === DBRegistrationStatus.ACCEPTED;

export const isAcceptedPending = (value?: string | null): boolean =>
  value === DBRegistrationStatus.ACCEPTED_PENDING;

export const isIncomplete = (value?: string | null): boolean =>
  value === DBRegistrationStatus.INCOMPLETE;

export const REGISTERED_STATUS = DBRegistrationStatus.REGISTERED;
