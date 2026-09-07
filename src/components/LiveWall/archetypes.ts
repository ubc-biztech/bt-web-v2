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
  ARCHITECT: "/assets/misnight/Architect.svg",
  DESIGNER: "/assets/misnight/Designers.svg",
  LOGICIAN: "/assets/misnight/Logician.svg",
  STRATEGIST: "/assets/misnight/Strategist.svg",
  VISIONARY: "/assets/misnight/Visionaries.svg",
};

/** Dominant colour of each illustration — used for the node glow/bloom. */
export const ARCHETYPE_COLOR: Record<Archetype, string> = {
  ARCHITECT: "#FF7A32",
  DESIGNER: "#FFFF57",
  LOGICIAN: "#947FFE",
  STRATEGIST: "#71FC7A",
  VISIONARY: "#FF7CC4",
};

/**
 * Per-archetype size trim.
 *
 * The illustrations were exported with inconsistent viewBoxes: Visionaries is
 * 996x932 with the character filling only ~0.66x0.84 of it, while the others
 * run edge to edge at ~635x616. Drawn into one box that makes visionaries
 * read small, so each is nudged back to a common apparent size here.
 */
export const ARCHETYPE_SCALE: Record<Archetype, number> = {
  ARCHITECT: 1,
  DESIGNER: 1.05,
  LOGICIAN: 1,
  STRATEGIST: 0.92,
  VISIONARY: 1.6,
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
