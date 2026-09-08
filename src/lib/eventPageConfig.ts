export type EventPageModuleVisibility =
  | "public"
  | "signedIn"
  | "registered"
  | "checkedIn"
  | "admin";

type EventPageModuleDefinition = {
  /** Title shown on the module's card in the event admin form. */
  title: string;
  /** Supporting copy shown under the title in the event admin form. */
  description: string;
  /** Whether a brand-new event starts with this module turned on. */
  defaultEnabled: boolean;
};

/**
 * The registry of event page modules. To add a module, add an entry here and a
 * matching case in EventModuleRenderer — everything else (the id union, form
 * validation, the admin toggle, ordering, defaults) is derived from this.
 *
 * A module is enabled for an event when it is present in that event's
 * `eventPage.modules`. Existing events are not retrofitted when a module is
 * added here; turn it on per event from the admin form.
 */
export const EVENT_PAGE_MODULES = {
  registration: {
    title: "Registration",
    description: "Shows the existing registration or application status card.",
    defaultEnabled: true,
  },
  qa: {
    title: "Q&A Board",
    description: "Shows anonymous event questions and answers.",
    defaultEnabled: true,
  },
  connections: {
    title: "Connections",
    description: "Shows event networking and connection insights.",
    defaultEnabled: false,
  },
} as const satisfies Record<string, EventPageModuleDefinition>;

export type EventPageModuleType = keyof typeof EVENT_PAGE_MODULES;

export const EVENT_PAGE_MODULE_TYPES = Object.keys(EVENT_PAGE_MODULES) as [
  EventPageModuleType,
  ...EventPageModuleType[],
];

export type EventPageModule = {
  id: EventPageModuleType;
  order: number;
  visibility: EventPageModuleVisibility;
  config?: Record<string, unknown>;
};

export type EventPageConfig = {
  subtitle?: string;
  targetAudience?: string;
  externalUrl?: string;
  modules: EventPageModule[];
};

export const defaultEventModules: EventPageModule[] =
  EVENT_PAGE_MODULE_TYPES.filter(
    (id) => EVENT_PAGE_MODULES[id].defaultEnabled,
  ).map((id, index) => ({
    id,
    order: index + 1,
    visibility: "public",
    config: {},
  }));

export const defaultEventPageConfig: EventPageConfig = {
  subtitle: "",
  targetAudience: "",
  externalUrl: "",
  modules: defaultEventModules,
};

export function normalizeEventPageModules(
  modules?: EventPageModule[] | null,
): EventPageModule[] {
  return (modules ?? defaultEventModules)
    .filter((module) => EVENT_PAGE_MODULE_TYPES.includes(module.id))
    .map((module, index) => ({
      id: module.id,
      visibility: module.visibility ?? "public",
      config: { ...(module.config ?? {}) },
      order: typeof module.order === "number" ? module.order : index + 1,
    }))
    .sort((a, b) => a.order - b.order)
    .map((module, index) => ({
      ...module,
      order: index + 1,
    }));
}

export function normalizeEventPageConfig(
  eventPage?: Partial<EventPageConfig> | null,
): EventPageConfig {
  return {
    subtitle: eventPage?.subtitle ?? defaultEventPageConfig.subtitle,
    targetAudience:
      eventPage?.targetAudience ?? defaultEventPageConfig.targetAudience,
    externalUrl: eventPage?.externalUrl ?? defaultEventPageConfig.externalUrl,
    modules: normalizeEventPageModules(eventPage?.modules),
  };
}

export function isEventModuleEnabled(
  eventPage: Partial<EventPageConfig> | null | undefined,
  moduleId: EventPageModuleType,
): boolean {
  return normalizeEventPageModules(eventPage?.modules).some(
    (module) => module.id === moduleId,
  );
}
