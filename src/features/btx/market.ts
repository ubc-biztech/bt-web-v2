import { DBRegistrationStatus } from "@/types/types";
import type { Company, Market } from "./seedApi";

export const exchangePath = "/companion/kickstart/2026/btx";

export const isBtxRegistrationStatus = (status: unknown) =>
  status === DBRegistrationStatus.ACCEPTED_COMPLETE ||
  status === DBRegistrationStatus.CHECKED_IN;

export const companyName = (p: Company) =>
  p.companyName || p.name || p.projectId;

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const money = (cents: number) => usd.format(cents / 100);

export const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  signDisplay: "exceptZero",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format;

export const compactMoney = (cents: number) =>
  money(cents).replace(/\.00$/, "");

export function windowState(p: Company, now: number) {
  return p.seedStatus === "ACTIVE" &&
    p.seedEndsAt != null &&
    p.seedEndsAt <= now
    ? "ENDED"
    : p.seedStatus;
}

export function countdown(seconds: number) {
  return [Math.floor(seconds / 60), seconds % 60]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

export function timeLeft(p: Company, now: number) {
  if (!p.seedEndsAt) return "";
  return countdown(Math.max(0, Math.ceil((p.seedEndsAt - now) / 1000)));
}

export function windowPillTone(state: Company["seedStatus"]) {
  if (state === "ENDED") return "ended";
  return state === "NOT_STARTED" ? "neutral" : "active";
}

export function windowLabel(p: Company, now: number) {
  switch (windowState(p, now)) {
    case "ACTIVE":
      return ("Seeding " + timeLeft(p, now)).trim();
    case "NOT_STARTED":
      return "Not started";
    case "ENDED":
      return "Ended";
    case "LIVE":
      return "Live";
  }
}

export function marketStage(market: Market, now: number) {
  if (market.phase === "LIVE") return "live";
  if (market.phase === "IPO_PREPARING") return "launching";
  const projects = market.projects;
  const open =
    now < market.eventEndsAt &&
    projects.some(
      (p) => p.seedStatus === "ACTIVE" && now < (p.seedEndsAt ?? 0),
    );
  const waiting =
    !projects.length || projects.some((p) => p.seedStatus === "NOT_STARTED");
  return open ? "open" : waiting ? "waiting" : "closed";
}

export type MarketStage = ReturnType<typeof marketStage>;
