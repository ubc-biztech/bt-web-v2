export const CONNECTION_TYPES = {
  ATTENDEE: "ATTENDEE",
  PARTNER: "PARTNER",
  EXEC: "EXEC",
} as const;

export type ConnectionType =
  (typeof CONNECTION_TYPES)[keyof typeof CONNECTION_TYPES];

export const CONNECTION_TYPE_FILTERS = [
  { value: "ALL", label: "All" },
  { value: CONNECTION_TYPES.ATTENDEE, label: "Attendees" },
  { value: CONNECTION_TYPES.PARTNER, label: "Partners" },
  { value: CONNECTION_TYPES.EXEC, label: "Execs" },
] as const;

export type ConnectionTypeFilter =
  (typeof CONNECTION_TYPE_FILTERS)[number]["value"];

export const CONNECTION_TYPE_LABELS: Record<ConnectionType, string> = {
  ATTENDEE: "Attendee",
  PARTNER: "Partner",
  EXEC: "Exec",
};
