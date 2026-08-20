import type { EventCounts } from "@/queries/events";
import type { Registration } from "@/queries/registrations";
import type { BiztechEvent } from "@/types/types";
import type { EventPageConfig } from "@/lib/eventPageConfig";

export type {
  EventPageConfig,
  EventPageModule,
  EventPageModuleType,
} from "@/lib/eventPageConfig";

export type EventHomeEvent = BiztechEvent & {
  eventPage?: EventPageConfig;
  externalUrl?: string;
  websiteUrl?: string;
};

export type EventRegistrationRecord = Registration & {
  registrationStatus?: string;
  applicationStatus?: string;
};

export type { EventCounts };
