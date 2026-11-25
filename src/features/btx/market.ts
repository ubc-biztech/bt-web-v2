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

export function windowPillTone(state: Company["seedStatus"]) {
  if (state === "ENDED") return "ended";
  return state === "NOT_STARTED" ? "neutral" : "active";
}

export function windowLabel(p: Company, now: number) {
  switch (windowState(p, now)) {
    case "ACTIVE":
      return "Seeding open";
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
  if (market.phase !== "SEED" || now >= market.eventEndsAt) return "closed";
  const projects = market.projects;
  const open = projects.some((p) => p.seedStatus === "ACTIVE");
  const waiting =
    !projects.length || projects.some((p) => p.seedStatus === "NOT_STARTED");
  return open ? "open" : waiting ? "waiting" : "closed";
}

export type MarketStage = ReturnType<typeof marketStage>;
