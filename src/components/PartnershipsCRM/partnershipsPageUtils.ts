import {
  KNOWN_STATUS_VALUES,
  KnownPartnerStatus,
  toStatusLabel,
} from "./status";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

export const toTierLabel = (tier: string) => {
  return String(tier || "")
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const slugifyTier = (label: string) => {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);
};

export const toLocalDateTimeInput = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const tzOffset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - tzOffset * 60_000);
  return local.toISOString().slice(0, 16);
};

export const normalizeStatusOptions = (values: unknown[]) => {
  const custom = new Set<string>();

  for (const rawValue of values || []) {
    if (typeof rawValue !== "string") continue;
    const normalized = rawValue.trim().toLowerCase();
    if (!normalized) continue;
    if (KNOWN_STATUS_VALUES.includes(normalized as KnownPartnerStatus))
      continue;
    custom.add(normalized);
  }

  return [
    ...KNOWN_STATUS_VALUES,
    ...Array.from(custom).sort((left, right) =>
      toStatusLabel(left).localeCompare(toStatusLabel(right)),
    ),
  ];
};

export const normalizeTierOptions = (values: unknown[]) => {
  const tiers = new Set<string>();

  for (const value of values || []) {
    if (typeof value !== "string") continue;
    const normalized = slugifyTier(value);
    if (!normalized) continue;
    tiers.add(normalized);
  }

  return Array.from(tiers).sort((left, right) =>
    toTierLabel(left).localeCompare(toTierLabel(right)),
  );
};

export const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return currencyFormatter.format(value);
};

export const formatPercent = (value: number | null | undefined, digits = 1) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return `${Number(value).toFixed(digits)}%`;
};

export const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatTimestamp = (value?: number | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

export const formatIsoTimestamp = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

export const buildCsv = (rows: Record<string, unknown>[]) => {
  if (!rows.length) return "";

  const columns = Object.keys(rows[0]);
  const escapeCsv = (value: unknown) => {
    const text = value === undefined || value === null ? "" : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };

  return [
    columns.join(","),
    ...rows.map((row) =>
      columns.map((column) => escapeCsv(row[column])).join(","),
    ),
  ].join("\n");
};

export const downloadTextFile = (
  filename: string,
  mimeType: string,
  content: string,
) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export const toErrorMessage = (error: unknown, fallback: string) => {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error instanceof Error && error.message) return error.message;

  const candidate = error as {
    message?: unknown;
    error?: { message?: unknown };
    details?: { message?: unknown };
  };

  const possible = [
    candidate?.message,
    candidate?.error?.message,
    candidate?.details?.message,
  ];

  for (const value of possible) {
    if (typeof value === "string" && value.trim()) return value;
  }

  if (typeof candidate?.message === "object" && candidate?.message) {
    const nestedMessage = (candidate.message as { message?: unknown }).message;
    if (typeof nestedMessage === "string" && nestedMessage.trim()) {
      return nestedMessage;
    }
  }

  return fallback;
};

export const toTagList = (input: string) => {
  const values = input
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const deduped = new Set<string>();
  for (const value of values) {
    deduped.add(value);
  }

  return Array.from(deduped);
};

export const getContactDisplayName = (contactName?: string | null) => {
  const normalized = contactName?.trim();
  return normalized || "Unnamed Contact";
};

export const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};
