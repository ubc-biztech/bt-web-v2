import { DBRegistrationStatus } from "@/types";

export const RegistrationStatusConfig = {
  [DBRegistrationStatus.REGISTERED]: {
    label: "Registered",
    sortOrder: 2,
    color: "#AAE7FF",
  },
  [DBRegistrationStatus.ACCEPTED_PENDING]: {
    label: "Accepted (Confirm)",
    sortOrder: 5,
    color: "#AAE7FF",
  },
  [DBRegistrationStatus.ACCEPTED]: {
    label: "Accepted (Pay)",
    sortOrder: 6,
    color: "#AAE7FF",
  },
  [DBRegistrationStatus.ACCEPTED_COMPLETE]: {
    label: "Accepted (Confirmed)",
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

export const RegistrationStatusOptions = Object.entries(
  RegistrationStatusConfig,
).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

export const getSortOrder = (value?: string | null) =>
  RegistrationStatusConfig[value as DBRegistrationStatus]?.sortOrder ?? 999;

export const getStatusLabel = (value: string) =>
  RegistrationStatusConfig[value as DBRegistrationStatus]?.label ?? value;

export const isNeedsPayment = (value?: string | null): boolean =>
  value === DBRegistrationStatus.ACCEPTED ||
  value === DBRegistrationStatus.INCOMPLETE;

export const isNeedsConfirmation = (value?: string | null): boolean =>
  value === DBRegistrationStatus.ACCEPTED_PENDING;

export const isConfirmed = (value?: string | null): boolean =>
  value === DBRegistrationStatus.ACCEPTED_COMPLETE;
