export { toErrorMessage } from "./partnershipsPageUtils";

export const toSafeText = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

export const splitFullName = (value: string) => {
  const normalized = toSafeText(value).replace(/\s+/g, " ").trim();
  if (!normalized) {
    return {
      firstName: "",
      lastName: "",
      fullName: "",
    };
  }

  const parts = normalized.split(" ").filter(Boolean);
  if (parts.length <= 1) {
    return {
      firstName: normalized,
      lastName: "",
      fullName: normalized,
    };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
    fullName: normalized,
  };
};

export const deriveDisplayNameFromEmail = (email: string) => {
  const localPart = toSafeText(email).split("@")[0] || "";
  return toSafeText(localPart.replace(/[._-]+/g, " "));
};

export const renderTemplatePreview = (
  template: string,
  values: Record<string, string>,
) => {
  return template.replace(/{{\s*([a-z0-9_]+)\s*}}/gi, (_, keyRaw) => {
    const key = String(keyRaw || "").toLowerCase();
    return values[key] || "";
  });
};

export const toReadableDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};
