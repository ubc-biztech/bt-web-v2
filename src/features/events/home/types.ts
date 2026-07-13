import type { EventCounts } from "@/queries/events";
import type { Registration } from "@/queries/registrations";
import type { BiztechEvent } from "@/types/types";

export type EventPageModuleType = "registration" | "qa" | "connections";

export type EventPageConfig = {
  enabled?: boolean;
  subtitle?: string;
  targetAudience?: string;
  externalUrl?: string;
  modules?: Array<{
    type: EventPageModuleType;
    enabled: boolean;
    order: number;
    config?: Record<string, unknown>;
  }>;
};

export type EventHomeEvent = BiztechEvent & {
  eventPage?: EventPageConfig;
  targetAudience?: string;
  externalUrl?: string;
  websiteUrl?: string;
};

export type EventRegistrationRecord = Registration & {
  registrationStatus?: string;
  applicationStatus?: string;
};

export type { EventCounts };
