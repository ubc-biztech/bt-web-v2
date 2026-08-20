import type { EventCounts, EventHomeEvent } from "./types";

const monthDayFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const asDate = (value?: string) => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const asNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

export function stripHtml(value?: string) {
  return (value ?? "")
    .replace(/\\n/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|li)>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function getEventSubtitle(event: EventHomeEvent) {
  return event.eventPage?.subtitle?.trim() ?? "";
}

export function getExternalEventUrl(event: EventHomeEvent) {
  return (
    event.eventPage?.externalUrl ||
    event.externalUrl ||
    event.websiteUrl ||
    event.facebookUrl ||
    ""
  );
}

export function getEventAccessLabel(event: EventHomeEvent) {
  return event.nonBizTechAllowed ? "Public" : "Members only";
}

export function formatEventDateRange(startDate?: string, endDate?: string) {
  const start = asDate(startDate);
  const end = asDate(endDate);

  if (!start && !end) return "Dates TBA";
  if (start && !end) return fullDateFormatter.format(start);
  if (!start && end) return fullDateFormatter.format(end);
  if (!start || !end) return "Dates TBA";

  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) {
    return `${fullDateFormatter.format(start)}, ${timeFormatter.format(start)} - ${timeFormatter.format(end)}`;
  }

  const sameYear = start.getFullYear() === end.getFullYear();
  return sameYear
    ? `${monthDayFormatter.format(start)} - ${fullDateFormatter.format(end)}`
    : `${fullDateFormatter.format(start)} - ${fullDateFormatter.format(end)}`;
}

export function formatDeadline(deadline?: string) {
  const deadlineDate = asDate(deadline);
  if (!deadlineDate) return "Deadline TBA";
  return fullDateFormatter.format(deadlineDate);
}

export function formatDeadlineStatus(deadline?: string) {
  const deadlineDate = asDate(deadline);
  if (!deadlineDate) return "Registration deadline TBA";

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfDeadline = new Date(
    deadlineDate.getFullYear(),
    deadlineDate.getMonth(),
    deadlineDate.getDate(),
  );
  const daysRemaining = Math.ceil(
    (startOfDeadline.getTime() - startOfToday.getTime()) /
      (1000 * 60 * 60 * 24),
  );

  if (daysRemaining < 0) return "Registration closed";
  if (daysRemaining === 0) return "Registration closes today";
  if (daysRemaining === 1) return "1 day left to register";
  return `${daysRemaining} days left to register`;
}

export function isDateInPast(date?: string) {
  const value = asDate(date);
  return value ? value.getTime() < Date.now() : false;
}

export function formatPrice(event: EventHomeEvent) {
  const memberPrice =
    typeof event.pricing?.members === "number" ? event.pricing.members : null;
  const nonMemberPrice =
    typeof event.pricing?.nonMembers === "number"
      ? event.pricing.nonMembers
      : null;

  if (memberPrice === null && nonMemberPrice === null) return "Pricing TBA";

  if (nonMemberPrice === null) {
    return memberPrice && memberPrice > 0
      ? `Members only - $${memberPrice.toFixed(2)}`
      : "Members only - Free";
  }

  if (memberPrice === null || memberPrice === nonMemberPrice) {
    return nonMemberPrice > 0 ? `$${nonMemberPrice.toFixed(2)}` : "Free";
  }

  return `Members $${memberPrice.toFixed(2)} - Non-members $${nonMemberPrice.toFixed(2)}`;
}

export function formatPrimaryPrice(event: EventHomeEvent) {
  const memberPrice =
    typeof event.pricing?.members === "number" ? event.pricing.members : null;
  const nonMemberPrice =
    typeof event.pricing?.nonMembers === "number"
      ? event.pricing.nonMembers
      : null;
  const displayPrice = nonMemberPrice ?? memberPrice;

  if (displayPrice === null) return "Pricing TBA";
  return displayPrice > 0 ? `$${displayPrice.toFixed(2)}` : "Free";
}

export function getCapacityStats(event: EventHomeEvent, counts?: EventCounts) {
  const capacity = asNumber(event.capac);
  const registeredCount = asNumber(counts?.registeredCount);
  const checkedInCount = asNumber(counts?.checkedInCount);
  const activeCount = registeredCount + checkedInCount;
  const spotsRemaining = capacity > 0 ? Math.max(capacity - activeCount, 0) : 0;
  const fillPercentage =
    capacity > 0
      ? Math.min(Math.round((activeCount / capacity) * 100), 100)
      : 0;

  return {
    capacity,
    registeredCount,
    checkedInCount,
    activeCount,
    spotsRemaining,
    fillPercentage,
  };
}
