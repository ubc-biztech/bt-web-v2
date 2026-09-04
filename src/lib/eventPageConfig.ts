export const EVENT_PAGE_MODULE_TYPES = [
  "registration",
  "qa",
  "connections",
] as const;

export type EventPageModuleType = (typeof EVENT_PAGE_MODULE_TYPES)[number];

export type EventPageModule = {
  id: EventPageModuleType;
  order: number;
  visibility: "public" | "signedIn" | "registered" | "checkedIn" | "admin";
  config?: Record<string, unknown>;
};

export type EventPageConfig = {
  subtitle?: string;
  targetAudience?: string;
  externalUrl?: string;
  modules: EventPageModule[];
};

export const defaultEventModules: EventPageModule[] = [
  { id: "registration", order: 1, visibility: "public", config: {} },
];

export const defaultEventPageConfig: EventPageConfig = {
  subtitle: "",
  targetAudience: "",
  externalUrl: "",
  modules: defaultEventModules,
};

export function normalizeEventPageModules(
  modules?: EventPageModule[] | null,
): EventPageModule[] {
  if (!modules) {
    return defaultEventModules.map((module) => ({
      ...module,
      config: { ...(module.config ?? {}) },
    }));
  }

  return modules
    .filter((module) => EVENT_PAGE_MODULE_TYPES.includes(module.id))
    .map((module, index) => ({
      id: module.id,
      visibility: module.visibility ?? "public",
      config: module.config ?? {},
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
