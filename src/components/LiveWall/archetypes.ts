/**
 * MIS Night archetypes — every wall node carries one, and is drawn on the
 * graph as its archetype illustration instead of a plain coloured dot.
 */

export const ARCHETYPES = [
  "ARCHITECT",
  "DESIGNER",
  "LOGICIAN",
  "STRATEGIST",
  "VISIONARY",
] as const;

export type Archetype = (typeof ARCHETYPES)[number];

export const ARCHETYPE_ICON: Record<Archetype, string> = {
  ARCHITECT: "/assets/misnight/mis_architect.svg",
  DESIGNER: "/assets/misnight/mis_designer.svg",
  LOGICIAN: "/assets/misnight/mis_logician.svg",
  STRATEGIST: "/assets/misnight/mis_strategist.svg",
  VISIONARY: "/assets/misnight/mis_visionary.svg",
};

/** Dominant colour of each illustration — used for the node glow/bloom. */
export const ARCHETYPE_COLOR: Record<Archetype, string> = {
  ARCHITECT: "#ED9407",
  DESIGNER: "#FFFF57",
  LOGICIAN: "#947FFE",
  STRATEGIST: "#109AFF",
  VISIONARY: "#D44142",
};

export const isArchetype = (v: any): v is Archetype =>
  typeof v === "string" && (ARCHETYPES as readonly string[]).includes(v);

/** Deterministic fallback so nodes without an archetype still get an icon. */
export const archetypeFor = (id: string): Archetype => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return ARCHETYPES[h % ARCHETYPES.length];
};

/* ── image cache (canvas needs decoded <img> elements) ── */
const cache: Partial<Record<Archetype, HTMLImageElement>> = {};

export const getArchetypeImage = (a: Archetype): HTMLImageElement | null => {
  const img = cache[a];
  return img && img.complete && img.naturalWidth > 0 ? img : null;
};

/** Loads every archetype illustration once. Resolves when all have settled. */
export const preloadArchetypeImages = (): Promise<void> => {
  if (typeof window === "undefined") return Promise.resolve();
  return Promise.all(
    ARCHETYPES.map(
      (a) =>
        new Promise<void>((resolve) => {
          if (cache[a]) return resolve();
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = ARCHETYPE_ICON[a];
          cache[a] = img;
        }),
    ),
  ).then(() => undefined);
};
