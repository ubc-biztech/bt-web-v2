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

export function marketStage(market: Market, now: number) {
  if (market.phase === "LIVE") return "live";
  if (market.phase === "IPO_PREPARING") return "launching";
  if (market.phase === "IPO_RESETTING") return "resetting";
  return market.phase === "SEED" && now < market.eventEndsAt
    ? "open"
    : "closed";
}

export type MarketStage = ReturnType<typeof marketStage>;

export function listingState(company: Company, stage: MarketStage) {
  if (company.isActive === false || stage === "closed") return "ENDED";
  if (stage === "open") return "ACTIVE";
  return stage === "live" ? "LIVE" : "PAUSED";
}

type ListingState = ReturnType<typeof listingState>;

const listingLabels: Record<ListingState, string> = {
  ACTIVE: "Seeding open",
  ENDED: "Closed",
  LIVE: "Live",
  PAUSED: "Trading paused",
};

export const listingLabel = (state: ListingState) => listingLabels[state];

export function listingPillTone(state: ListingState) {
  if (state === "ENDED") return "ended";
  return state === "PAUSED" ? "neutral" : "active";
}
