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
  { id: "qa", order: 2, visibility: "public", config: {} },
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
  const normalized = (modules ?? defaultEventModules)
    .filter((module) => EVENT_PAGE_MODULE_TYPES.includes(module.id))
    .map((module, index) => ({
      id: module.id,
      visibility: module.visibility ?? "public",
      config: { ...(module.config ?? {}) },
      order: typeof module.order === "number" ? module.order : index + 1,
    }));

  // Q&A is available on every event, so add it to configs saved before the
  // module existed rather than requiring each event to be edited.
  if (!normalized.some((module) => module.id === "qa")) {
    normalized.push({
      id: "qa",
      order: normalized.length + 1,
      visibility: "public",
      config: {},
    });
  }

  return normalized
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
