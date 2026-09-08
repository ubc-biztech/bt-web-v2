"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { WS_URL, EVENT_ID } from "@/lib/dbconfig";
import { fetchBackend } from "@/lib/db";
import {
  ARCHETYPE_COLOR,
  ARCHETYPE_ICON,
  ARCHETYPE_SCALE,
  archetypeFor,
  getArchetypeImage,
  isArchetype,
  preloadArchetypeImages,
  type Archetype,
} from "./archetypes";
import WallBackdrop from "./WallBackdrop";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Zap,
  Trophy,
  Radio,
  Search,
  X,
  ChevronDown,
  BarChart3,
  Users,
  Network,
  User,
  Link2,
  Eye,
  EyeOff,
  Maximize2,
  Play,
  Square,
  Route,
  PartyPopper,
} from "lucide-react";
import { forceManyBody, forceCollide, forceX, forceY } from "d3-force";
import type { ForceGraphMethods } from "react-force-graph-2d";
import type { BiztechEvent } from "@/types";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

/* ───────────────────────── tunables ───────────────────────── */
const VIS = 0.5;
const WALL_FONT = '"DM Sans", ui-sans-serif, system-ui, sans-serif';
const SNAPSHOT_WINDOW_SEC = 860_400;
const RECENT_EDGE_WINDOW_MS = 5 * 60_000;
const TICKER_MAX = 24;

const CHARGE_BASE = -30;
const CHARGE_PER_DEG = -2;
/**
 * Repulsion has to outrun the link force at graph scale. Capping its reach
 * meant well-separated clusters stopped pushing each other apart at all,
 * which is what collapsed the wall into one blob.
 */
const CHARGE_DIST_MAX = 1500;
/**
 * Personal space per person. The name tag is far wider than the character it
 * hangs under, so this is sized for the tag, not the illustration.
 */
/** Resting length of a connection — long enough to read both cards. */
const LINK_DISTANCE = 280;
/** Weak, so links suggest structure instead of hauling everyone inward. */
const LINK_STRENGTH = 0.08;
/**
 * Repulsion this strong has no equilibrium on its own — d3's center force
 * only re-centres the centroid, it doesn't hold anything in, so clusters
 * drift apart forever. A weak pull toward the origin is the counterweight
 * that lets the two forces settle into a spread graph instead of a blob.
 */
const GRAVITY = 0.015;
/* how far outside its anchor a newly connected node first appears */
const SPAWN_OFFSET = 46 * VIS;

/* idle "alive" motion — gentle bob plus an occasional horizontal flip */
const BOB_AMP = 0.1; // fraction of the icon radius
const BOB_PERIOD_MS = 1200;
const FLIP_MIN_MS = 5000;
const FLIP_MAX_MS = 11_000;
const FLIP_DUR_MS = 380;
const FLIP_SQUASH = 0.14;

const SPOTLIGHT_MS = 6000;
const HALO_RECENT_MS = 20_000;
const AUTOPAN_ENABLED_DEFAULT = false;
const AUTOPAN_INTERVAL_MS = 12_000;
const AUTOPAN_ZOOM = 2.6;
const AUTOPAN_PAN_MS = 1200;
const AUTOPAN_ZOOM_MS = 1200;
const DEDUPE_GRACE_MS = 4000;

const isFiniteNum = (v: any) => typeof v === "number" && Number.isFinite(v);
const INTRO_MS = 1200;
const LINK_REVEAL_MS = 700;

const STREAK_WINDOW_MS = 2 * 60_000;
const STREAK_THRESHOLD = 3;

const QR_URL = process.env.NEXT_PUBLIC_WALL_QR_URL || "";

const CROWN_COLORS = ["#D9A400", "#8C8C8C", "#A9662E"];

const HEATMAP_WINDOW_MS = 5 * 60_000;
const HEATMAP_ENABLED_DEFAULT = true;
const HEATMAP_INTENSITY = 0.12;
/* blobs are additive, so past this many hot nodes each one dims to keep the
   total glow roughly constant instead of whiting out a busy centre */
const HEATMAP_HOT_BUDGET = 10;
/** Constant — a halo that grew with degree read as a bigger profile. */
const HEATMAP_RADIUS = 90 * VIS;

const TRAIL_WINDOW_MS = 90_000;
const TRAIL_MAX = 2000;
const TRAIL_LINE_WIDTH = 1 * VIS;
const TRAIL_DASH: [number, number] = [4 * VIS, 6 * VIS];

/* ───────────────────────── milestones ─────────────────────── */
const MILESTONE_THRESHOLDS = [
  10, 25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 750, 1000,
];
const MILESTONE_DURATION_MS = 6000;

/* ───────────────────────── path finder (bfs) ─────────────── */
function bfsShortestPath(
  startId: string,
  endId_: string,
  neighbors: Map<string, Set<string>>,
): string[] | null {
  if (startId === endId_) return [startId];
  const visited = new Set<string>([startId]);
  const queue: Array<{ id: string; path: string[] }> = [
    { id: startId, path: [startId] },
  ];
  while (queue.length > 0) {
    const { id, path } = queue.shift()!;
    const nbrs = neighbors.get(id);
    if (!nbrs) continue;
    for (const nb of Array.from(nbrs)) {
      if (visited.has(nb)) continue;
      const newPath = [...path, nb];
      if (nb === endId_) return newPath;
      visited.add(nb);
      queue.push({ id: nb, path: newPath });
    }
  }
  return null;
}

/* ───────────────────────── simulation (dev only) ─────────── */
const IS_DEV = process.env.NEXT_PUBLIC_REACT_APP_STAGE !== "production";

/*
 * How the simulation works (dev only):
 *   Start  -> load the backend snapshot for the selected event, shuffle its
 *             edges into a queue, and wipe the wall to 0 people / 0 edges.
 *   Tick   -> every SIM_TICK_MIN_MS..SIM_TICK_MAX_MS, pop edges off the queue
 *             and add them exactly as a live websocket "connection" would.
 *             Usually one; with SIM_CONCURRENT_CHANCE it's 2..SIM_CONCURRENT_MAX
 *             at once, to mimic several people scanning in the same moment.
 *   Stop   -> stop ticking, leave the partially replayed wall on screen.
 *   Clear  -> wipe it and reload the full snapshot.
 * Nothing is invented: every edge the sim adds is a real edge from the
 * snapshot, and the sim stops itself when the queue is empty.
 */
const SIM_TICK_MIN_MS = 700;
const SIM_TICK_MAX_MS = 1800;
const SIM_CONCURRENT_CHANCE = 0.3;
const SIM_CONCURRENT_MAX = 4;

const shuffle = <T,>(arr: T[]): T[] => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* cluster palette */
const CLUSTER_PALETTE = [
  "hsl(160, 70%, 65%)",
  "hsl(220, 70%, 68%)",
  "hsl(280, 60%, 68%)",
  "hsl(340, 65%, 68%)",
  "hsl(40, 80%, 65%)",
  "hsl(100, 60%, 60%)",
  "hsl(190, 75%, 62%)",
  "hsl(15, 75%, 65%)",
  "hsl(260, 55%, 72%)",
  "hsl(55, 75%, 60%)",
  "hsl(320, 60%, 65%)",
  "hsl(130, 55%, 58%)",
];

/* ───────────────────────── types ──────────────────────────── */
type WallNode = {
  id: string;
  name: string;
  archetype?: Archetype;
  avatar?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  __born?: number;
  __pinUntil?: number;
};

type WallLink = { source: string; target: string; createdAt: number };
type WallLinkLive = WallLink & { __born?: number };
type SnapshotResponse = { nodes: WallNode[]; links: WallLink[] };
type Spotlight = { id: string; from: string; to: string; t: number };
type Trail = { s: string; t: string; createdAt: number };

/* ───────────────────────── utils ──────────────────────────── */
const asString = (v: any, fallback: string) => {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") {
    if (typeof v.S === "string") return v.S;
    if (typeof v.value === "string") return v.value;
  }
  return fallback;
};

const normalizeNode = (n: any): WallNode => {
  const id = asString(n.id, String(n.id));
  const raw = asString(n.archetype, "").toUpperCase();
  return {
    id,
    name: asString(n.name, id),
    archetype: isArchetype(raw) ? raw : archetypeFor(id),
    avatar: n.avatar ? asString(n.avatar, "") : undefined,
  };
};

/** Archetype of a node currently in the graph (falls back deterministically). */
const nodeArchetype = (n: any, id: string): Archetype =>
  isArchetype(n?.archetype) ? n.archetype : archetypeFor(id);

const firstName = (raw: string | undefined, fallbackId: string) => {
  const name = (raw ?? "").trim();
  if (!name) return fallbackId;
  const cleaned = name.includes(",")
    ? name.split(",")[1]?.trim() || name
    : name;
  return (cleaned.split(/\s+/)[0] || fallbackId).toLowerCase();
};

const fullName = (raw: string | undefined, fallbackId: string) => {
  const name = (raw ?? "").trim();
  return (name || fallbackId).toLowerCase();
};

const endId = (e: any) => (e && typeof e === "object" ? e.id : String(e));

/**
 * Random-but-stable motion seed per node, so no two characters bob in step or
 * flip on the same beat. Rolled once the first time a node is drawn.
 */
type MotionSeed = {
  bobPhase: number;
  bobPeriod: number;
  flipPeriod: number;
  flipOffset: number;
};
const motionSeeds = new Map<string, MotionSeed>();

const motionSeed = (id: string): MotionSeed => {
  let seed = motionSeeds.get(id);
  if (!seed) {
    const flipPeriod =
      FLIP_MIN_MS + Math.random() * (FLIP_MAX_MS - FLIP_MIN_MS);
    seed = {
      bobPhase: Math.random() * Math.PI * 2,
      bobPeriod: BOB_PERIOD_MS * (0.85 + Math.random() * 0.4),
      flipPeriod,
      flipOffset: Math.random() * flipPeriod,
    };
    motionSeeds.set(id, seed);
  }
  return seed;
};

/** Idle animation for a single character: gentle bob, occasional flip. */
const idleMotion = (id: string, rr: number, now: number) => {
  const { bobPhase, bobPeriod, flipPeriod, flipOffset } = motionSeed(id);

  const bobY =
    Math.sin((now / bobPeriod) * Math.PI * 2 + bobPhase) * rr * BOB_AMP;

  const t = now + flipOffset;
  const facing = Math.floor(t / flipPeriod) % 2 === 0 ? 1 : -1;

  let sx = facing;
  let sy = 1;
  const into = t % flipPeriod;
  if (into < FLIP_DUR_MS) {
    // swing through zero width: starts on the old facing, lands on the new one
    const q = into / FLIP_DUR_MS;
    sx = -facing * Math.cos(q * Math.PI);
    sy = 1 + FLIP_SQUASH * Math.sin(q * Math.PI);
  }

  return { bobY, sx, sy };
};

/**
 * A person on the wall is labelled with the MIS Night name tag: white card,
 * hard black rule, the archetype glyph and its name in the archetype colour,
 * then the person's name set big and black underneath.
 *
 * Sizes are divided by `globalScale` so the tag holds one constant size on
 * screen no matter how far the wall is zoomed.
 */
/**
 * The node IS the placard.
 *
 * The invariant we want is: if you can see someone's icon, you can read
 * their name. That only holds if the icon and the name are one object that
 * scales together — a separate label, however cleverly placed, can always
 * be dropped, occluded, or shrunk out of step with the icon it belongs to.
 *
 * So a person renders as one card, sized in graph units, with their
 * character inside it. Zooming scales card and name together, and the
 * collide force is sized from the card, so two cards can never overlap in
 * graph space and therefore never overlap on screen at any zoom.
 */
const CARD_PAD = 3;
const CARD_ICON = 12;
const CARD_GAP = 3;
const CARD_NAME = 9;
const CARD_CORNER = 3;
/** Medium, not black — the guide's weight was shouting at wall scale. */
const CARD_WEIGHT = 500;
const CARD_FILL = "#1C1C1C";
const CARD_INK = "rgba(255,255,255,0.92)";
const CARD_EDGE = "rgba(255,255,255,0.22)";
/** Hairline by default; states thicken it only slightly. */
const CARD_EDGE_W = 0.4;
const CARD_EDGE_W_ACTIVE = 1.1;
/** Clear space around a card when the layout packs them together. */
const CARD_MARGIN = 9;

/** How long after tapping in your card stays picked out of the crowd. */
const CARD_RECENT_MS = 30_000;

/**
 * Size an illustration into a box of side `box` without squashing it. The
 * exports have aspect ratios from 0.79 to 1.07, so drawing them into a
 * square stretched some characters wider than others.
 */
const fitIcon = (icon: HTMLImageElement, arche: Archetype, box: number) => {
  const iw = icon.naturalWidth || 1;
  const ih = icon.naturalHeight || 1;
  const k = (box * ARCHETYPE_SCALE[arche]) / Math.max(iw, ih);
  return { w: iw * k, h: ih * k };
};

type CardBox = { w: number; h: number; textW: number };

/**
 * Name widths are measured off-canvas and cached — the layout needs a card's
 * size to set its collision radius, which happens outside any paint call.
 */
let measureCtx: CanvasRenderingContext2D | null = null;
const nameWidths = new Map<string, number>();

/** Widths measured before DM Sans decodes are the fallback face's. */
const resetNameWidths = () => nameWidths.clear();

const nameWidth = (name: string) => {
  const hit = nameWidths.get(name);
  if (hit !== undefined) return hit;
  if (!measureCtx && typeof document !== "undefined") {
    measureCtx = document.createElement("canvas").getContext("2d");
  }
  if (!measureCtx) return name.length * CARD_NAME * 0.58;
  measureCtx.font = `${CARD_WEIGHT} ${CARD_NAME}px ${WALL_FONT}`;
  const w = measureCtx.measureText(name).width;
  nameWidths.set(name, w);
  return w;
};

const cardMetrics = (name: string): CardBox => {
  const textW = nameWidth(name);
  return {
    w: CARD_PAD * 2 + CARD_ICON + CARD_GAP + textW,
    h: CARD_PAD * 2 + CARD_ICON,
    textW,
  };
};

/** Radius that keeps two cards apart whatever their names. */
const cardRadius = (name: string) => {
  const { w, h } = cardMetrics(name);
  return Math.hypot(w, h) / 2 + CARD_MARGIN;
};

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) => {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
};

const easeOutBack = (t: number, s = 1.10158) =>
  1 + s * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);

/* ─── connected components (bfs) ──────────────────────────── */
function computeClusters(
  nodes: WallNode[],
  neighbors: Map<string, Set<string>>,
): Map<string, number> {
  const clusterMap = new Map<string, number>();
  const visited = new Set<string>();
  let clusterId = 0;
  for (const node of nodes) {
    if (visited.has(node.id)) continue;
    const queue = [node.id];
    visited.add(node.id);
    while (queue.length) {
      const cur = queue.shift()!;
      clusterMap.set(cur, clusterId);
      const nbrs = neighbors.get(cur);
      if (nbrs) {
        Array.from(nbrs).forEach((nb) => {
          if (!visited.has(nb)) {
            visited.add(nb);
            queue.push(nb);
          }
        });
      }
    }
    clusterId++;
  }
  return clusterMap;
}

/* ════════════════════════════════════════════════════════════ */
/*  component                                                  */
/* ════════════════════════════════════════════════════════════ */
export default function ConnectionWall() {
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const pairRecentlySeen = useRef<Map<string, number>>(new Map());

  /* ── core data ── */
  const graphDataRef = useRef<{ nodes: WallNode[]; links: WallLinkLive[] }>({
    nodes: [],
    links: [],
  });
  const [dataTick, setDataTick] = useState(0);
  const nodesByIdRef = useRef<Record<string, WallNode>>({});
  const neighborsRef = useRef<Map<string, Set<string>>>(new Map());
  const pairKeySetRef = useRef<Set<string>>(new Set());

  const pairKey = (l: WallLink | any) => {
    const s = endId(l.source);
    const t = endId(l.target);
    return s < t ? `${s}|${t}` : `${t}|${s}`;
  };

  /* ── ws ── */
  const [wsStatus, setWsStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [lastError, setLastError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  /* ── ui toggles ── */
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [showTicker, setShowTicker] = useState(true);
  const [autoPan, setAutoPan] = useState(AUTOPAN_ENABLED_DEFAULT);
  const [kiosk, setKiosk] = useState(false);
  const zoomFitDone = useRef(false);

  /* ── event selector ── */
  const [events, setEvents] = useState<BiztechEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(EVENT_ID);
  const selectedEventIdRef = useRef(EVENT_ID);

  /* ── search ── */
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  /* ── analytics panel ── */
  const [showAnalytics, setShowAnalytics] = useState(false);

  /* ── node detail panel ── */
  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);

  /* ── cluster coloring ── */
  const [clusterMode, setClusterMode] = useState(false);

  /* ── simulation (dev only) ── */
  const [simActive, setSimActive] = useState(false);
  const simActiveRef = useRef(false);
  simActiveRef.current = simActive;
  /* true from the first Start until Clear — the wall is showing simulated data */
  const [simDirty, setSimDirty] = useState(false);
  const simTickRef = useRef<() => void>(() => {});
  /* edges still to replay, plus the people they refer to */
  const simQueueRef = useRef<{
    people: Record<string, WallNode>;
    edges: WallLink[];
  }>({ people: {}, edges: [] });

  /* ── path finder ── */
  const [pathMode, setPathMode] = useState(false);
  const [pathStart, setPathStart] = useState<string | null>(null);
  const [pathResult, setPathResult] = useState<string[] | null>(null);
  const pathEdgeSet = useMemo(() => {
    if (!pathResult || pathResult.length < 2) return new Set<string>();
    const s = new Set<string>();
    for (let i = 0; i < pathResult.length - 1; i++) {
      const a = pathResult[i];
      const b = pathResult[i + 1];
      s.add(a < b ? `${a}|${b}` : `${b}|${a}`);
    }
    return s;
  }, [pathResult]);
  const pathNodeSet = useMemo(() => new Set(pathResult ?? []), [pathResult]);

  /* ── milestones ── */
  const milestonesHit = useRef<Set<number>>(new Set());
  const [milestone, setMilestone] = useState<{
    type: string;
    value: number;
    t: number;
  } | null>(null);

  /* ── activity timeline ── */
  const activityBuckets = useRef<number[]>([]);
  const [activityData, setActivityData] = useState<number[]>([]);

  /* ── overlays ── */
  const [spotlights, setSpotlights] = useState<Spotlight[]>([]);
  const [toasts, setToasts] = useState<
    Array<{ id: string; text: string; t: number }>
  >([]);

  /* ── ticker + analytics ── */
  const [ticker, setTicker] = useState<
    Array<{ id?: string; from: string; to: string; t: number }>
  >([]);
  const [totalToday, setTotalToday] = useState(0);
  const [perMinute, setPerMinute] = useState(0);

  /* ── recency ── */
  const lastSeen = useRef<Record<string, number>>({});
  const streakMap = useRef<Record<string, number[]>>({});

  /* ── trails & heatmap ── */
  const [trails, setTrails] = useState<Trail[]>([]);
  const [heatmapEnabled, setHeatmapEnabled] = useState(HEATMAP_ENABLED_DEFAULT);

  /* ── ticker measure ── */
  const tickerContainerRef = useRef<HTMLDivElement | null>(null);
  const tickerTrackRef = useRef<HTMLDivElement | null>(null);
  const [tickerDurSec, setTickerDurSec] = useState(16);
  const [tickerStartPx, setTickerStartPx] = useState(0);
  const [tickerContentPx, setTickerContentPx] = useState(0);

  /* ── drag ── */
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragModeRef = useRef(false);
  const draggingIdRef = useRef<string | null>(null);

  /* ── derived ── */
  const [degree, setDegree] = useState<Record<string, number>>({});
  const degreeRef = useRef<Record<string, number>>({});
  useEffect(() => {
    degreeRef.current = degree;
  }, [degree]);

  const topRanks = useMemo(() => {
    return Object.entries(degree)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id], i) => ({ id, rank: i }));
  }, [degree]);

  const rankMap = useMemo(() => {
    const m: Record<string, number> = {};
    topRanks.forEach(({ id, rank }) => (m[id] = rank));
    return m;
  }, [topRanks]);

  /* ── cluster map ── */
  const clusterMap = useMemo(() => {
    if (!clusterMode) return new Map<string, number>();
    return computeClusters(graphDataRef.current.nodes, neighborsRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterMode, dataTick]);

  /* ── search results ── */
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return graphDataRef.current.nodes
      .filter(
        (n) =>
          n.name.toLowerCase().includes(q) || n.id.toLowerCase().includes(q),
      )
      .slice(0, 12);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, dataTick]);

  /* ── network analytics ── */
  const networkStats = useMemo(() => {
    const nodes = graphDataRef.current.nodes;
    const links = graphDataRef.current.links;
    const n = nodes.length;
    const m = links.length;
    if (n === 0) return null;

    const degrees = Object.values(degree);
    const avgDegree = degrees.length
      ? degrees.reduce((a, b) => a + b, 0) / degrees.length
      : 0;
    const maxDegree = degrees.length ? Math.max(...degrees) : 0;
    const density = n > 1 ? (2 * m) / (n * (n - 1)) : 0;

    const clusters = computeClusters(nodes, neighborsRef.current);
    const clusterIds = new Set(clusters.values());
    const numClusters = clusterIds.size;
    const clusterSizes = new Map<number, number>();
    clusters.forEach((cid) => {
      clusterSizes.set(cid, (clusterSizes.get(cid) || 0) + 1);
    });
    const largestCluster = clusterSizes.size
      ? Math.max(...Array.from(clusterSizes.values()))
      : 0;
    const isolated = nodes.filter(
      (nd) =>
        !neighborsRef.current.has(nd.id) ||
        neighborsRef.current.get(nd.id)!.size === 0,
    ).length;

    return {
      nodes: n,
      edges: m,
      avgDegree: avgDegree.toFixed(1),
      maxDegree,
      density: (density * 100).toFixed(2),
      numClusters,
      largestCluster,
      isolated,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [degree, dataTick]);

  /* ── node detail info ── */
  const detailNode = useMemo(() => {
    if (!detailNodeId) return null;
    const node = nodesByIdRef.current[detailNodeId];
    if (!node) return null;
    const neighbors = neighborsRef.current.get(detailNodeId);
    const connectionIds = neighbors ? Array.from(neighbors) : [];
    const connections = connectionIds
      .map((id) => ({
        id,
        name: nodesByIdRef.current[id]?.name || id,
        archetype: nodeArchetype(nodesByIdRef.current[id], id),
        degree: degree[id] || 0,
      }))
      .sort((a, b) => b.degree - a.degree);

    const mutuals: Array<{ id: string; name: string }> = [];
    if (focusedId && focusedId !== detailNodeId) {
      const focusedNeighbors = neighborsRef.current.get(focusedId);
      if (focusedNeighbors && neighbors) {
        Array.from(neighbors).forEach((n) => {
          if (focusedNeighbors.has(n)) {
            mutuals.push({ id: n, name: nodesByIdRef.current[n]?.name || n });
          }
        });
      }
    }
    return { node, degree: degree[detailNodeId] || 0, connections, mutuals };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailNodeId, degree, focusedId, dataTick]);

  /* ── highlight set ── */
  const highlightSet = useMemo(() => {
    const s = new Set<string>();
    if (searchQuery.trim()) searchResults.forEach((n) => s.add(n.id));
    if (focusedId) s.add(focusedId);
    return s;
  }, [searchQuery, searchResults, focusedId]);

  /* ── helpers ── */
  const getGraphNode = (id: string): WallNode | null =>
    nodesByIdRef.current[id] || null;

  const alphaKick = (durationMs = 1000, peak = 0.22) => {
    const g = fgRef.current as any;
    if (!g || typeof g.d3AlphaTarget !== "function") return;
    try {
      g.d3AlphaTarget(peak);
      g.d3ReheatSimulation?.();
      const t0 = Date.now();
      const timer = setInterval(() => {
        const t = (Date.now() - t0) / durationMs;
        if (t >= 1) {
          g.d3AlphaTarget(0);
          clearInterval(timer);
        } else {
          g.d3AlphaTarget(peak * (1 - t));
        }
      }, 120);
    } catch {}
  };

  const freezeExisting = (ms: number, excludeIds: string[] = []) => {
    const now = Date.now();
    const until = now + ms;
    const excludes = new Set(excludeIds);
    for (const n of graphDataRef.current.nodes) {
      if (excludes.has(n.id)) continue;
      n.__pinUntil = Math.max(n.__pinUntil || 0, until);
      if (isFiniteNum(n.x) && isFiniteNum(n.y)) {
        (n as any).fx = n.x;
        (n as any).fy = n.y;
      }
    }
    setTimeout(() => {
      const tnow = Date.now();
      for (const n of graphDataRef.current.nodes) {
        if ((n.__pinUntil || 0) <= tnow) {
          delete (n as any).fx;
          delete (n as any).fy;
          n.__pinUntil = 0;
        }
      }
    }, ms + 20);
  };

  const ensureNode = (raw: WallNode | any, spawnNearId?: string): WallNode => {
    const base = normalizeNode(raw);
    const existing = nodesByIdRef.current[base.id];
    if (existing) return existing;
    const seeded = spawnNodeNear(base, spawnNearId);
    nodesByIdRef.current[seeded.id] = seeded;
    graphDataRef.current.nodes.push(seeded);
    setDataTick((t) => t + 1);
    return seeded;
  };

  const spawnNodeNear = (nn: WallNode, nearId?: string): WallNode => {
    const born = Date.now();
    if (!nearId) return { ...nn, __born: born };
    const anchor = getGraphNode(nearId);
    if (
      anchor &&
      typeof anchor.x === "number" &&
      typeof anchor.y === "number"
    ) {
      /* land just outside the anchor on the side facing away from the
         crowd, so the graph grows outward instead of piling into the middle */
      const { cx, cy } = getGraphExtent();
      let ang = Math.atan2(anchor.y - cy, anchor.x - cx);
      if (Math.hypot(anchor.x - cx, anchor.y - cy) < 1)
        ang = Math.random() * 2 * Math.PI;
      ang += (Math.random() - 0.5) * (Math.PI / 2); // ±45° spread
      const dist = SPAWN_OFFSET;
      return {
        ...nn,
        x: anchor.x + Math.cos(ang) * dist,
        y: anchor.y + Math.sin(ang) * dist,
        vx: Math.cos(ang) * 0.3,
        vy: Math.sin(ang) * 0.3,
        __born: born,
      };
    }
    return { ...nn, __born: born };
  };

  const addLinkInPlace = (l: WallLink, bornTs?: number) => {
    const pk = pairKey(l);
    if (pairKeySetRef.current.has(pk)) return;
    const sId = endId(l.source);
    const tId = endId(l.target);
    /* resolve string ids to node refs — bail if missing */
    const sNode = nodesByIdRef.current[sId];
    const tNode = nodesByIdRef.current[tId];
    if (!sNode || !tNode) return;
    const live: WallLinkLive = {
      source: sNode as any,
      target: tNode as any,
      createdAt: l.createdAt,
      __born: bornTs ?? Date.now(),
    };
    graphDataRef.current.links.push(live);
    pairKeySetRef.current.add(pk);
    if (!neighborsRef.current.has(sId))
      neighborsRef.current.set(sId, new Set());
    if (!neighborsRef.current.has(tId))
      neighborsRef.current.set(tId, new Set());
    const sNeigh = neighborsRef.current.get(sId)!;
    const tNeigh = neighborsRef.current.get(tId)!;
    const wasNew = !sNeigh.has(tId);
    sNeigh.add(tId);
    tNeigh.add(sId);
    if (wasNew) {
      setDegree((prev) => {
        const next = { ...prev };
        next[sId] = (next[sId] || 0) + 1;
        next[tId] = (next[tId] || 0) + 1;
        return next;
      });
    }
    setDataTick((t) => t + 1);
  };

  const pushTicker = (
    from: WallNode | any,
    to: WallNode | any,
    createdAt: number,
  ) => {
    const nf = normalizeNode(from);
    const nt = normalizeNode(to);
    setTicker((prev) => {
      const next = [
        ...prev.slice(Math.max(0, prev.length - (TICKER_MAX - 1))),
        {
          id: `${createdAt}-${nf.id}-${nt.id}`,
          from: firstName(nf.name, nf.id),
          to: firstName(nt.name, nt.id),
          t: createdAt,
        },
      ];
      setTotalToday((n) => n + 1);
      const now = Date.now();
      setPerMinute(next.filter((x) => now - x.t <= 60_000).length);

      const spotId = `${createdAt}-${nf.id}-${nt.id}`;
      setSpotlights((prevS) => [
        {
          id: spotId,
          from: firstName(nf.name, nf.id),
          to: firstName(nt.name, nt.id),
          t: createdAt,
        },
        ...prevS,
      ]);
      setTimeout(
        () => setSpotlights((prevS) => prevS.filter((s) => s.id !== spotId)),
        SPOTLIGHT_MS,
      );

      lastSeen.current[nf.id] = createdAt;
      lastSeen.current[nt.id] = createdAt;

      const bumpStreak = (id: string) => {
        const arr = (streakMap.current[id] || []).filter(
          (t) => createdAt - t <= STREAK_WINDOW_MS,
        );
        arr.push(createdAt);
        streakMap.current[id] = arr;
        if (arr.length === STREAK_THRESHOLD) {
          const toastId = `${id}-${createdAt}`;
          setToasts((prevT) => [
            ...prevT,
            {
              id: toastId,
              text: `${firstName(nodesByIdRef.current[id]?.name, id)} is on a streak!`,
              t: createdAt,
            },
          ]);
          setTimeout(
            () => setToasts((prevT) => prevT.filter((x) => x.id !== toastId)),
            5000,
          );
        }
      };
      bumpStreak(nf.id);
      bumpStreak(nt.id);
      return next;
    });
  };

  /* ── clear graph (for event switching) ── */
  const clearGraph = useCallback(() => {
    graphDataRef.current = { nodes: [], links: [] };
    nodesByIdRef.current = {};
    neighborsRef.current = new Map();
    pairKeySetRef.current = new Set();
    pairRecentlySeen.current = new Map();
    lastSeen.current = {};
    streakMap.current = {};
    setDegree({});
    setTicker([]);
    setTotalToday(0);
    setPerMinute(0);
    setTrails([]);
    setSpotlights([]);
    setToasts([]);
    setFocusedId(null);
    setDetailNodeId(null);
    zoomFitDone.current = false;
    setDataTick((t) => t + 1);
  }, []);

  /* ── fetch snapshot ── */
  const loadSnapshot = useCallback(
    async (eventId?: string): Promise<SnapshotResponse> => {
      const eid = eventId ?? selectedEventIdRef.current;
      const qs = new URLSearchParams({
        eventId: eid,
        sinceSec: String(SNAPSHOT_WINDOW_SEC),
      });
      return await fetchBackend({
        endpoint: `/interactions/wall?${qs.toString()}`,
        method: "GET",
        authenticatedCall: false,
      });
    },
    [],
  );

  const fetchSnapshot = useCallback(
    async (eventId?: string) => {
      try {
        const res = await loadSnapshot(eventId);

        for (const raw of res.nodes) {
          const n = normalizeNode(raw);
          if (!nodesByIdRef.current[n.id]) {
            const seeded = { ...n, __born: 0 };
            nodesByIdRef.current[seeded.id] = seeded;
            graphDataRef.current.nodes.push(seeded);
          }
        }

        for (const l of res.links) {
          const pk = pairKey(l);
          if (!pairKeySetRef.current.has(pk)) {
            pairKeySetRef.current.add(pk);
            graphDataRef.current.links.push({ ...l, __born: 0 });
            const s = endId(l.source);
            const t = endId(l.target);
            if (!neighborsRef.current.has(s))
              neighborsRef.current.set(s, new Set());
            if (!neighborsRef.current.has(t))
              neighborsRef.current.set(t, new Set());
            neighborsRef.current.get(s)!.add(t);
            neighborsRef.current.get(t)!.add(s);
          }
        }

        const d: Record<string, number> = {};
        neighborsRef.current.forEach((set, id) => {
          d[id] = set.size;
        });
        setDegree(d);
        setTotalToday(graphDataRef.current.links.length);
        setDataTick((t) => t + 1);
        setLastError(null);
      } catch {
        setLastError("Snapshot fetch failed");
      }
    },
    [loadSnapshot],
  );

  /* ── DM Sans must be decoded before the canvas can set a tag in it ── */
  useEffect(() => {
    const fonts = (document as any).fonts;
    if (!fonts?.load) return;
    fonts
      .load(`${CARD_WEIGHT} ${CARD_NAME}px "DM Sans"`)
      .then(() => resetNameWidths())
      .catch(() => {});
  }, []);

  /* ── preload archetype illustrations ── */
  useEffect(() => {
    let cancelled = false;
    preloadArchetypeImages().then(() => {
      if (!cancelled) setDataTick((t) => t + 1);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /* ── fetch events list ── */
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchBackend({
          endpoint: "/events",
          method: "GET",
          authenticatedCall: false,
        });
        const list: BiztechEvent[] = Array.isArray(data) ? data : [];
        list.sort(
          (a, b) =>
            new Date(b.startDate ?? 0).getTime() -
            new Date(a.startDate ?? 0).getTime(),
        );
        setEvents(list);
      } catch {
        console.warn("Could not fetch events list");
      }
    })();
  }, []);

  /* ── event switch handler ── */
  const handleEventChange = useCallback(
    (newEventId: string) => {
      if (newEventId === selectedEventIdRef.current) return;
      setSelectedEventId(newEventId);
      selectedEventIdRef.current = newEventId;
      clearGraph();

      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: "subscribe", eventId: newEventId }));
      }

      setTimeout(() => fetchSnapshot(newEventId), 100);
    },
    [clearGraph, fetchSnapshot],
  );

  /* ── navigate to node ── */
  const navigateToNode = useCallback((id: string) => {
    const node = nodesByIdRef.current[id];
    if (!node || node.x == null || node.y == null) return;
    const g = fgRef.current as any;
    if (!g) return;
    setFocusedId(id);
    setDetailNodeId(id);
    g.centerAt(node.x, node.y, 800);
    g.zoom(3.5, 800);
  }, []);

  /* ── URL toggles ── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("kiosk") === "1") setKiosk(true);
    if (sp.get("autopan") === "0") setAutoPan(false);
    if (sp.get("ticker") === "0") setShowTicker(false);
    if (sp.get("leaderboard") === "0") setShowLeaderboard(false);
    if (sp.get("heat") === "0") setHeatmapEnabled(false);
    if (sp.get("heat") === "1") setHeatmapEnabled(true);
  }, []);

  /* ── keyboard toggles ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )
        return;
      const k = e.key.toLowerCase();
      if (k === "l") setShowLeaderboard((v) => !v);
      if (k === "t") setShowTicker((v) => !v);
      if (k === "a") setAutoPan((v) => !v);
      if (k === "h") setHeatmapEnabled((v) => !v);
      if (k === "s") {
        setSearchOpen((v) => !v);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
        setDetailNodeId(null);
        setFocusedId(null);
        setPathMode(false);
        setPathStart(null);
        setPathResult(null);
        setPathNotFound(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ── d3 forces ── */
  useEffect(() => {
    /**
     * ForceGraph2D is a `ssr: false` dynamic import, so on the first client
     * render it is still a placeholder and `fgRef.current` is null. This
     * effect has no deps, so bailing here meant the layout silently kept
     * d3's defaults forever — hence the knot. Wait for the ref instead.
     */
    let raf = 0;
    let cancelled = false;

    const apply = () => {
      if (cancelled) return;
      const g = fgRef.current as any;
      if (!g?.d3Force) {
        raf = requestAnimationFrame(apply);
        return;
      }
      configureForces(g);
    };

    const configureForces = (g: any) => {
      const charge = (g.d3Force && g.d3Force("charge")) || forceManyBody();
      charge
        .strength((n: any) => {
          const d = degreeRef.current[n.id] || 0;
          return CHARGE_BASE + d * CHARGE_PER_DEG;
        })
        .distanceMax(CHARGE_DIST_MAX)
        .distanceMin(2);
      g.d3Force?.("charge", charge);

      // sized from each card, so two cards can never overlap in graph space
      // — which is what makes "see the icon, read the name" hold at any zoom
      const collide = forceCollide()
        .radius((n: any) => cardRadius(firstName(n.name, n.id)))
        .strength(1)
        .iterations(3);
      g.d3Force?.("collide", collide);

      // without this the link force falls back to d3's default 30px rest
      // length, which pulls everyone back into a knot the charge can't undo
      const link = g.d3Force?.("link");
      link?.distance?.(LINK_DISTANCE);
      link?.strength?.(LINK_STRENGTH);

      g.d3Force?.("x", forceX(0).strength(GRAVITY));
      g.d3Force?.("y", forceY(0).strength(GRAVITY));

      try {
        g.d3AlphaTarget?.(0.12);
        g.d3ReheatSimulation?.();
        setTimeout(() => g.d3AlphaTarget?.(0), 600);
      } catch {}
    };

    apply();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  const getGraphExtent = () => {
    const nodes = graphDataRef.current.nodes;
    if (!nodes.length) return { cx: 0, cy: 0, r: 0 };
    let sx = 0,
      sy = 0,
      n = 0;
    for (const nd of nodes) {
      if (isFiniteNum(nd.x) && isFiniteNum(nd.y)) {
        sx += nd.x!;
        sy += nd.y!;
        n++;
      }
    }
    const cx = n ? sx / n : 0;
    const cy = n ? sy / n : 0;
    let r = 0;
    for (const nd of nodes) {
      if (isFiniteNum(nd.x) && isFiniteNum(nd.y)) {
        const d = Math.hypot(nd.x! - cx, nd.y! - cy);
        if (d > r) r = d;
      }
    }
    return { cx, cy, r };
  };

  const placeNewClusterAway = (a: WallNode, b: WallNode) => {
    const { cx, cy, r } = getGraphExtent();
    const margin = 140 * VIS;
    const targetR = (r || 220 * VIS) + margin;
    const hash = (s: string) => {
      let h = 0;
      for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
      return h;
    };
    const th = ((hash(a.id + "|" + b.id) % 360) * Math.PI) / 180;
    const tx = cx + targetR * Math.cos(th);
    const ty = cy + targetR * Math.sin(th);
    const sep = 22 * VIS;
    a.x = tx - sep;
    a.y = ty;
    b.x = tx + sep;
    b.y = ty;
    const kick = 0.02;
    a.vx = Math.cos(th) * kick;
    a.vy = Math.sin(th) * kick;
    b.vx = Math.cos(th) * kick;
    b.vy = Math.sin(th) * kick;
    (a as any).fx = a.x;
    (a as any).fy = a.y;
    (b as any).fx = b.x;
    (b as any).fy = b.y;
    setTimeout(() => {
      delete (a as any).fx;
      delete (a as any).fy;
      delete (b as any).fx;
      delete (b as any).fy;
    }, 600);
  };

  /* ── websocket lifecycle ── */
  useEffect(() => {
    let cancelled = false;

    const connect = () => {
      try {
        setWsStatus("connecting");
        const ws = new WebSocket(`${WS_URL}?v=1`);
        wsRef.current = ws;

        ws.onopen = () => {
          if (cancelled) return;
          setWsStatus("connected");
          ws.send(
            JSON.stringify({
              action: "subscribe",
              eventId: selectedEventIdRef.current,
            }),
          );
        };

        ws.onmessage = (ev) => {
          if (cancelled) return;
          try {
            const msg = JSON.parse(ev.data);

            if (msg.type === "snapshot") {
              const { nodes: ns, links: ls } = msg as SnapshotResponse;
              for (const raw of ns) {
                const n = normalizeNode(raw);
                if (!nodesByIdRef.current[n.id]) {
                  const seeded = { ...n, __born: 0 };
                  nodesByIdRef.current[seeded.id] = seeded;
                  graphDataRef.current.nodes.push(seeded);
                }
              }
              for (const l of ls) {
                const pk = pairKey(l);
                if (!pairKeySetRef.current.has(pk)) {
                  pairKeySetRef.current.add(pk);
                  graphDataRef.current.links.push({ ...l, __born: 0 });
                  const s = endId(l.source);
                  const t = endId(l.target);
                  if (!neighborsRef.current.has(s))
                    neighborsRef.current.set(s, new Set());
                  if (!neighborsRef.current.has(t))
                    neighborsRef.current.set(t, new Set());
                  neighborsRef.current.get(s)!.add(t);
                  neighborsRef.current.get(t)!.add(s);
                }
              }
              const d: Record<string, number> = {};
              neighborsRef.current.forEach((set, id) => {
                d[id] = set.size;
              });
              setDegree(d);
              setDataTick((t) => t + 1);
              return;
            }

            if (msg.type === "connection" || msg.type === "edge") {
              const { from, to, createdAt } = msg;
              let nf: WallNode | undefined;
              let nt: WallNode | undefined;

              if (from?.id) nf = ensureNode(from, to?.id);
              if (to?.id) nt = ensureNode(to, from?.id);

              if (nf?.id && nt?.id) {
                const isIsolated = (id: string) =>
                  (neighborsRef.current.get(id)?.size || 0) === 0;
                if (isIsolated(nf.id) && isIsolated(nt.id)) {
                  placeNewClusterAway(nf, nt);
                }
                freezeExisting(450, [nf.id, nt.id]);

                const ts = createdAt || Date.now();
                const key = [nf.id, nt.id].sort().join("|");
                const last = pairRecentlySeen.current.get(key) || 0;
                if (ts - last >= DEDUPE_GRACE_MS) {
                  pairRecentlySeen.current.set(key, ts);
                  addLinkInPlace(
                    { source: nf.id, target: nt.id, createdAt: ts },
                    ts,
                  );
                  setTrails((prev) => [
                    ...prev.slice(Math.max(0, prev.length - (TRAIL_MAX - 1))),
                    { s: nf!.id, t: nt!.id, createdAt: ts },
                  ]);
                  pushTicker(nf, nt, ts);
                }
              }
              return;
            }
          } catch (err) {
            console.warn("[WS] parse error:", ev.data, err);
          }
        };

        ws.onerror = () => !cancelled && setLastError("WebSocket error");
        ws.onclose = () => {
          if (cancelled) return;
          setWsStatus("disconnected");
          setTimeout(connect, 1500);
        };
      } catch {
        setWsStatus("disconnected");
        setLastError("WebSocket init failed");
      }
    };

    connect();
    return () => {
      cancelled = true;
      wsRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── initial + periodic snapshot ── */
  useEffect(() => {
    fetchSnapshot();
    const t = setInterval(() => {
      if (!simActiveRef.current) fetchSnapshot();
    }, 1800_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── prune old trails ── */
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setTrails((prev) =>
        prev.filter((tr) => now - tr.createdAt <= TRAIL_WINDOW_MS),
      );
    }, 2000);
    return () => clearInterval(id);
  }, []);

  /* ── dedupe map cleanup ── */
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      pairRecentlySeen.current.forEach((t, k) => {
        if (now - t > DEDUPE_GRACE_MS * 5) pairRecentlySeen.current.delete(k);
      });
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  /* ── milestone checks ── */
  useEffect(() => {
    const connections = graphDataRef.current.links.length;
    const people = graphDataRef.current.nodes.length;
    for (const threshold of MILESTONE_THRESHOLDS) {
      const connKey = threshold * 10000 + 1;
      const pplKey = threshold * 10000 + 2;
      if (connections >= threshold && !milestonesHit.current.has(connKey)) {
        milestonesHit.current.add(connKey);
        const ms = { type: "connections", value: threshold, t: Date.now() };
        setMilestone(ms);
        setTimeout(
          () => setMilestone((cur) => (cur === ms ? null : cur)),
          MILESTONE_DURATION_MS,
        );
      }
      if (people >= threshold && !milestonesHit.current.has(pplKey)) {
        milestonesHit.current.add(pplKey);
        const ms = { type: "people", value: threshold, t: Date.now() };
        setMilestone(ms);
        setTimeout(
          () => setMilestone((cur) => (cur === ms ? null : cur)),
          MILESTONE_DURATION_MS,
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataTick]);

  /* ── activity timeline (30s buckets, last 20 = 10 min) ── */
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      const windowMs = 30_000;
      const count = graphDataRef.current.links.filter(
        (l) => l.__born && now - l.__born <= windowMs,
      ).length;
      activityBuckets.current = [...activityBuckets.current.slice(-19), count];
      setActivityData([...activityBuckets.current]);
    }, 30_000);
    /* seed an initial value */
    activityBuckets.current = [0];
    setActivityData([0]);
    return () => clearInterval(id);
  }, []);

  /* ── path finder handlers ── */
  const [pathNotFound, setPathNotFound] = useState(false);
  const clearPath = useCallback(() => {
    setPathStart(null);
    setPathResult(null);
    setPathNotFound(false);
  }, []);

  const handlePathNodeClick = useCallback(
    (nodeId: string) => {
      if (!pathStart) {
        setPathStart(nodeId);
        setPathResult(null);
        setPathNotFound(false);
      } else if (nodeId === pathStart) {
        clearPath();
      } else {
        const path = bfsShortestPath(pathStart, nodeId, neighborsRef.current);
        if (path) {
          setPathResult(path);
          setPathNotFound(false);
        } else {
          setPathResult(null);
          setPathNotFound(true);
        }
      }
    },
    [pathStart, clearPath],
  );

  /* ── simulation (dev only) ── see the SIM_* constants for the rules ── */

  /** Add one edge to the wall exactly as a live websocket "connection" would. */
  const addSimEdge = (from: WallNode, to: WallNode) => {
    const now = Date.now();
    const nf = ensureNode(from, to.id);
    const nt = ensureNode(to, from.id);

    const wallHasLayout = graphDataRef.current.nodes.some(
      (n) => isFiniteNum(n.x) && isFiniteNum(n.y),
    );
    if (wallHasLayout) {
      const isolated = (id: string) =>
        (neighborsRef.current.get(id)?.size || 0) === 0;
      if (isolated(nf.id) && isolated(nt.id)) placeNewClusterAway(nf, nt);
      freezeExisting(450, [nf.id, nt.id]);
    }

    addLinkInPlace({ source: nf.id, target: nt.id, createdAt: now }, now);
    setTrails((prev) => [
      ...prev.slice(Math.max(0, prev.length - (TRAIL_MAX - 1))),
      { s: nf.id, t: nt.id, createdAt: now },
    ]);
    pushTicker(nf, nt, now);
    if (wallHasLayout) alphaKick(600, 0.15);
  };

  const simTick = () => {
    const { people, edges } = simQueueRef.current;

    /* usually one edge; sometimes a few land in the same moment */
    const count =
      Math.random() < SIM_CONCURRENT_CHANCE
        ? 2 + Math.floor(Math.random() * (SIM_CONCURRENT_MAX - 1))
        : 1;

    for (let i = 0; i < count; i++) {
      const edge = edges.shift();
      if (!edge) {
        console.info("[SIM] every snapshot edge replayed — stopping");
        setSimActive(false);
        return;
      }
      const from = people[endId(edge.source)];
      const to = people[endId(edge.target)];
      if (!from || !to) continue; // snapshot edge pointing at an unknown person
      console.debug(
        `[SIM] ${from.name} ↔ ${to.name}${count > 1 ? ` (${i + 1}/${count})` : ""}  (${edges.length} left)`,
      );
      addSimEdge(from, to);
    }
  };
  simTickRef.current = simTick; // ref so the timer never sees a stale closure

  /* Start: load + shuffle the snapshot, wipe to zero, then replay per tick */
  useEffect(() => {
    if (!IS_DEV || !simActive) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const scheduleTick = () => {
      const delay =
        SIM_TICK_MIN_MS + Math.random() * (SIM_TICK_MAX_MS - SIM_TICK_MIN_MS);
      timer = setTimeout(() => {
        if (cancelled) return;
        simTickRef.current();
        scheduleTick();
      }, delay);
    };

    (async () => {
      try {
        const snap = await loadSnapshot();
        if (cancelled) return;
        const people: Record<string, WallNode> = {};
        for (const raw of snap.nodes) {
          const n = normalizeNode(raw);
          people[n.id] = n;
        }
        simQueueRef.current = { people, edges: shuffle(snap.links) };
        console.info(
          `[SIM] replaying ${snap.links.length} edges across ${snap.nodes.length} people`,
        );
        clearGraph();
        scheduleTick();
      } catch (err) {
        console.warn("[SIM] could not load snapshot", err);
        setSimActive(false);
      }
    })();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [simActive, clearGraph, loadSnapshot]);

  const toggleSim = useCallback(() => {
    if (!IS_DEV) return;
    setSimActive((v) => {
      if (!v) setSimDirty(true);
      return !v;
    });
  }, []);

  /* Clear: drop the replayed wall and go back to the full snapshot */
  const clearSim = useCallback(() => {
    setSimActive(false);
    setSimDirty(false);
    simQueueRef.current = { people: {}, edges: [] };
    clearGraph();
    fetchSnapshot();
  }, [clearGraph, fetchSnapshot]);

  /* gently reheat on drag without reconfiguring forces */
  const setDragMode = (on: boolean) => {
    const g = fgRef.current as any;
    if (!g) return;
    if (on && !dragModeRef.current) {
      dragModeRef.current = true;
      try {
        g.d3AlphaTarget?.(0.05);
        g.d3ReheatSimulation?.();
      } catch {}
    }
    if (!on && dragModeRef.current) {
      dragModeRef.current = false;
      try {
        g.d3AlphaTarget?.(0);
      } catch {}
    }
  };

  /* ── camera tour ── */
  useEffect(() => {
    if (!autoPan) return;
    const id = setInterval(() => {
      const g = fgRef.current as any;
      if (
        !g ||
        typeof g.centerAt !== "function" ||
        typeof g.zoom !== "function"
      )
        return;
      const recent = ticker.slice(-5);
      if (recent.length === 0) {
        try {
          (g as any).zoomToFit?.(800, 100);
        } catch {}
        return;
      }
      const pick = recent[Math.floor(Math.random() * recent.length)];
      const targetId =
        graphDataRef.current.nodes.find(
          (n) => firstName(n.name, n.id) === pick.to,
        )?.id ||
        graphDataRef.current.nodes.find(
          (n) => firstName(n.name, n.id) === pick.from,
        )?.id;
      if (!targetId) return;
      const node = graphDataRef.current.nodes.find((n) => n.id === targetId);
      if (!node || node.x == null || node.y == null) return;
      g.centerAt(node.x, node.y, AUTOPAN_PAN_MS);
      g.zoom(AUTOPAN_ZOOM, AUTOPAN_ZOOM_MS);
      setTimeout(
        () => {
          try {
            (g as any).zoomToFit?.(800, 100);
          } catch {}
        },
        Math.max(3000, AUTOPAN_INTERVAL_MS - 2000),
      );
    }, AUTOPAN_INTERVAL_MS);
    return () => clearInterval(id);
  }, [autoPan, ticker]);

  /* ── ticker size/duration ── */
  useEffect(() => {
    const measure = () => {
      const c = tickerContainerRef.current;
      const t = tickerTrackRef.current;
      if (!c || !t) return;
      const cw = c.offsetWidth;
      const tw = t.scrollWidth;
      setTickerStartPx(cw);
      setTickerContentPx(tw);
      setTickerDurSec((cw + tw) / 120);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (tickerContainerRef.current) ro.observe(tickerContainerRef.current);
    if (tickerTrackRef.current) ro.observe(tickerTrackRef.current);
    return () => ro.disconnect();
  }, [ticker]);

  const isRecent = (t: number) => Date.now() - t <= RECENT_EDGE_WINDOW_MS;

  const graphDataMemo = useMemo(
    () => ({
      nodes: graphDataRef.current.nodes,
      links: graphDataRef.current.links,
      _v: dataTick,
    }),
    [dataTick],
  );

  const MEDALS = [
    {
      name: "Gold",
      ring: "#FFD700",
      fill: "linear-gradient(180deg,#FFE680,#FFD700)",
    },
    {
      name: "Silver",
      ring: "#C0C0C0",
      fill: "linear-gradient(180deg,#F0F0F0,#C0C0C0)",
    },
    {
      name: "Bronze",
      ring: "#CD7F32",
      fill: "linear-gradient(180deg,#E8B27A,#CD7F32)",
    },
  ];

  function MedalBadge({ rank }: { rank: number }) {
    const m = MEDALS[rank] ?? {
      ring: "rgba(255,255,255,.25)",
      fill: "linear-gradient(180deg,#FFF,#DDD)",
    };
    return (
      <span
        className="relative inline-flex items-center justify-center mr-2 shrink-0"
        title={MEDALS[rank]?.name ?? "Top connector"}
        style={{ width: 18, height: 18 }}
      >
        <span
          className="relative rounded-full border"
          style={{
            width: 18,
            height: 18,
            background: m.fill,
            borderColor: `${m.ring}90`,
          }}
        />
        <span
          className="absolute rounded-full"
          style={{
            top: 2,
            left: 4,
            width: 6,
            height: 3,
            background: "rgba(255,255,255,.7)",
            filter: "blur(0.5px)",
            borderRadius: 999,
          }}
        />
      </span>
    );
  }

  /* ════════════════════════════════════════════════════════════ */
  /*  render                                                     */
  /* ════════════════════════════════════════════════════════════ */
  return (
    <div
      className={`font-dmsans antialiased min-h-[95vh] rounded-2xl border border-white/10 bg-[#1a1a1a] overflow-hidden relative ${kiosk ? "cursor-none" : ""}`}
    >
      <WallBackdrop />

      {/* ── header ── */}
      {!kiosk && (
        <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 gap-2 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                wsStatus === "connected"
                  ? "bg-emerald-400"
                  : wsStatus === "connecting"
                    ? "bg-yellow-400"
                    : "bg-red-400"
              }`}
            />
            <div className="text-white/90 text-sm sm:text-base min-w-0">
              Live Connection Wall
              {simActive && (
                <span className="ml-2 text-orange-400 text-xs font-medium">
                  ● SIMULATING
                </span>
              )}
              <span className="ml-2 text-white/50 text-xs">
                {wsStatus === "connected"
                  ? "live"
                  : wsStatus === "connecting"
                    ? "connecting…"
                    : "offline"}
              </span>
              {lastError && (
                <span className="ml-2 text-rose-300 text-xs">{lastError}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs text-white flex-wrap">
            {/* event selector */}
            <div className="relative">
              <select
                value={selectedEventId}
                onChange={(e) => handleEventChange(e.target.value)}
                className="appearance-none rounded-lg border border-white/20 bg-white/10 text-white text-xs px-3 py-1.5 pr-7 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 cursor-pointer min-w-[140px] max-w-[220px] truncate"
              >
                <option value={EVENT_ID} className="bg-[#1c1c1c] text-white">
                  Current Event
                </option>
                {events.map((ev) => (
                  <option
                    key={`${ev.id}-${ev.year}`}
                    /* must match the id the backend stamps on live
                       connections (CURRENT_EVENT in interactions/constants) */
                    value={`${ev.id}-${ev.year}`}
                    className="bg-[#1c1c1c] text-white"
                  >
                    {ev.ename}
                    {ev.startDate
                      ? ` (${new Date(ev.startDate).toLocaleDateString("en-US", { month: "short", year: "2-digit" })})`
                      : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/50 pointer-events-none" />
            </div>

            {/* stats pills */}
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
                <Zap className="w-3 h-3" />
                <span className="font-medium">
                  {totalToday.toLocaleString()}
                </span>
                <span className="text-white/60">today</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
                <Radio className="w-3 h-3" />
                <span className="font-medium">{perMinute}</span>
                <span className="text-white/60">/min</span>
              </div>
            </div>

            {/* toolbar buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setSearchOpen((v) => !v);
                  setTimeout(() => searchInputRef.current?.focus(), 50);
                }}
                className={`p-1.5 rounded-md transition-colors ${searchOpen ? "bg-white text-[#111]" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                title="Search people (S)"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowAnalytics((v) => !v)}
                className={`p-1.5 rounded-md transition-colors ${showAnalytics ? "bg-white text-[#111]" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                title="Network analytics"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setClusterMode((v) => !v)}
                className={`p-1.5 rounded-md transition-colors ${clusterMode ? "bg-white text-[#111]" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                title="Color by cluster"
              >
                <Network className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setPathMode((v) => {
                    if (v) {
                      clearPath();
                    }
                    return !v;
                  });
                }}
                className={`p-1.5 rounded-md transition-colors ${pathMode ? "bg-violet-400/20 text-violet-300" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                title="Find shortest path between two people (click two nodes)"
              >
                <Route className="w-4 h-4" />
              </button>
              <button
                onClick={() => setHeatmapEnabled((v) => !v)}
                className={`p-1.5 rounded-md transition-colors ${heatmapEnabled ? "bg-white text-[#111]" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                title="Toggle heatmap (H)"
              >
                {heatmapEnabled ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => {
                  const g = fgRef.current as any;
                  g?.zoomToFit?.(600, 80);
                }}
                className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title="Fit to screen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <Button
                size="sm"
                variant="outline"
                className="bg-transparent border-white/20 text-white hover:bg-white/10 h-7 px-2 text-xs"
                onClick={() => fetchSnapshot()}
                title="Refresh snapshot"
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Refresh
              </Button>

              {/* simulation toggle (dev only) */}
              {IS_DEV && (
                <>
                  <button
                    onClick={toggleSim}
                    className={`p-1.5 rounded-md transition-colors ${simActive ? "bg-orange-400/20 text-orange-300 animate-pulse" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                    title={
                      simActive ? "Stop simulation" : "Start simulation (dev)"
                    }
                  >
                    {simActive ? (
                      <Square className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                  {simDirty && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-transparent border-orange-400/30 text-orange-300 hover:bg-orange-400/10 h-7 px-2 text-xs"
                      onClick={clearSim}
                      title="Clear simulated data and reload the real wall"
                    >
                      <X className="w-3 h-3 mr-1" /> Clear
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── search bar ── */}
      {searchOpen && !kiosk && (
        <div className="absolute top-14 left-4 z-30 w-80 max-w-[calc(100vw-2rem)]">
          <div className="rounded-xl border border-white/15 bg-[#1c1c1c]/95 backdrop-blur-md shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
              <Search className="w-4 h-4 text-white/50 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search people…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white text-sm placeholder:text-white/40 outline-none"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-white/40 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {searchQuery.trim() && (
              <div className="max-h-64 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="px-3 py-4 text-center text-white/50 text-sm">
                    No results found
                  </div>
                ) : (
                  searchResults.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        navigateToNode(n.id);
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 transition-colors text-left"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ARCHETYPE_ICON[nodeArchetype(n, n.id)]}
                        alt=""
                        className="w-5 h-5 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-white text-sm font-bold truncate">
                          {fullName(n.name, n.id)}
                        </div>
                        <div className="text-white/40 text-xs">
                          {degree[n.id] || 0} connections
                        </div>
                      </div>
                      {rankMap[n.id] !== undefined && (
                        <MedalBadge rank={rankMap[n.id]} />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── analytics panel ── */}
      {showAnalytics && !kiosk && networkStats && (
        <aside className="absolute left-3 top-14 z-10 mt-4">
          <div className="w-[260px] rounded-xl border border-white/10 bg-[#1c1c1c]/90 backdrop-blur-sm p-3">
            <div className="flex items-center justify-between text-white/90 mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm font-medium">Network Stats</span>
              </div>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <StatMini
                  icon={<Users className="w-3 h-3" />}
                  label="People"
                  value={networkStats.nodes}
                />
                <StatMini
                  icon={<Link2 className="w-3 h-3" />}
                  label="Connections"
                  value={networkStats.edges}
                />
                <StatMini
                  icon={<Network className="w-3 h-3" />}
                  label="Clusters"
                  value={networkStats.numClusters}
                />
                <StatMini
                  icon={<User className="w-3 h-3" />}
                  label="Isolated"
                  value={networkStats.isolated}
                />
              </div>
              <div className="border-t border-white/10 pt-2 space-y-1.5">
                <div className="flex justify-between text-white/70">
                  <span>Avg connections</span>
                  <span className="text-white font-medium">
                    {networkStats.avgDegree}
                  </span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Max connections</span>
                  <span className="text-white font-medium">
                    {networkStats.maxDegree}
                  </span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Network density</span>
                  <span className="text-white font-medium">
                    {networkStats.density}%
                  </span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Largest cluster</span>
                  <span className="text-white font-medium">
                    {networkStats.largestCluster} people
                  </span>
                </div>
              </div>

              {/* activity sparkline */}
              {activityData.length > 1 && (
                <div className="border-t border-white/10 pt-2">
                  <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">
                    Activity (last 10 min)
                  </div>
                  <div className="h-10 flex items-end gap-[2px]">
                    {activityData.map((val, i) => {
                      const max = Math.max(1, ...activityData);
                      const h = Math.max(2, (val / max) * 36);
                      const recency = i / Math.max(1, activityData.length - 1);
                      return (
                        <div
                          key={i}
                          className="flex-1 rounded-t-sm transition-all duration-300"
                          style={{
                            height: h,
                            backgroundColor: `rgba(255, 255, 255, ${0.25 + recency * 0.6})`,
                            minWidth: 3,
                          }}
                          title={`${val} connections`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* ── leaderboard ── */}
      {showLeaderboard && !kiosk && (
        <aside className="absolute right-3 top-14 z-10 hidden xl:block mt-4">
          <div className="w-[260px] rounded-xl border border-white/10 bg-[#1c1c1c]/90 backdrop-blur-sm p-3">
            <div className="flex items-center justify-between text-white/90 mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-medium">Top connectors</span>
              </div>
              <span className="text-[10px] text-white/40">L to toggle</span>
            </div>
            <ol className="space-y-1 text-white/85 text-sm">
              {Object.entries(degree)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([id, d], i) => (
                  <li key={id}>
                    <button
                      onClick={() => navigateToNode(id)}
                      className="w-full flex items-center justify-between hover:bg-white/5 rounded px-1 py-0.5 transition-colors"
                    >
                      <span className="truncate flex items-center">
                        {i < 3 && <MedalBadge rank={i} />}
                        <span className="text-white/50 mr-1.5 text-xs">
                          {i + 1}.
                        </span>
                        {firstName(nodesByIdRef.current[id]?.name, id)}
                      </span>
                      <span className="text-white/50 text-xs ml-2 shrink-0">
                        {d}
                      </span>
                    </button>
                  </li>
                ))}
              {Object.keys(degree).length === 0 && (
                <li className="text-white/40 text-xs py-2">
                  No connections yet
                </li>
              )}
            </ol>
          </div>
        </aside>
      )}

      {/* ── node detail panel ── */}
      {detailNode && !kiosk && (
        <aside className="absolute right-3 bottom-20 z-20 hidden md:block">
          <div className="w-[280px] rounded-xl border border-white/10 bg-[#1c1c1c]/90 backdrop-blur-sm p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    ARCHETYPE_ICON[
                      nodeArchetype(detailNode.node, detailNodeId!)
                    ]
                  }
                  alt=""
                  className="w-6 h-6 shrink-0"
                />
                <h3 className="text-white font-bold text-sm truncate">
                  {fullName(detailNode.node.name, detailNode.node.id)}
                </h3>
                {rankMap[detailNodeId!] !== undefined && (
                  <MedalBadge rank={rankMap[detailNodeId!]} />
                )}
              </div>
              <button
                onClick={() => {
                  setDetailNodeId(null);
                  setFocusedId(null);
                  const g = fgRef.current as any;
                  g?.zoomToFit?.(800, 80);
                }}
                className="text-white/40 hover:text-white shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-[11px] font-bold lowercase"
                style={{
                  color:
                    ARCHETYPE_COLOR[
                      nodeArchetype(detailNode.node, detailNodeId!)
                    ],
                }}
              >
                {nodeArchetype(detailNode.node, detailNodeId!).toLowerCase()}
              </span>
              <span className="text-xs text-white/60">
                {detailNode.degree} connection
                {detailNode.degree !== 1 ? "s" : ""}
              </span>
            </div>

            {detailNode.connections.length > 0 && (
              <div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">
                  Connected to
                </div>
                <div className="max-h-40 overflow-y-auto space-y-0.5">
                  {detailNode.connections.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => navigateToNode(c.id)}
                      className="w-full flex items-center justify-between px-2 py-1 rounded hover:bg-white/10 transition-colors text-left"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              ARCHETYPE_COLOR[nodeArchetype(c, c.id)],
                          }}
                        />
                        <span className="text-white/80 text-xs truncate">
                          {firstName(c.name, c.id)}
                        </span>
                      </span>
                      <span className="text-white/30 text-[10px] shrink-0 ml-1">
                        {c.degree}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {detailNode.mutuals.length > 0 && (
              <div className="mt-3 pt-2 border-t border-white/10">
                <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">
                  Mutual connections
                </div>
                <div className="flex flex-wrap gap-1">
                  {detailNode.mutuals.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => navigateToNode(m.id)}
                      className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/25 transition-colors"
                    >
                      {firstName(m.name, m.id)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* ── path finder panel ── */}
      {pathMode && !kiosk && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 mt-1">
          <div className="rounded-xl border-2 border-violet-400/40 bg-[#1c1c1c]/95 backdrop-blur-md px-4 py-2.5 flex items-center gap-3 text-sm">
            <Route className="w-4 h-4 text-violet-300 shrink-0" />
            {!pathStart && (
              <span className="text-white/80">
                Click a person to set the{" "}
                <strong className="text-violet-300">start</strong>
              </span>
            )}
            {pathStart && !pathResult && !pathNotFound && (
              <span className="text-white/80">
                From{" "}
                <strong className="text-violet-300">
                  {firstName(nodesByIdRef.current[pathStart]?.name, pathStart)}
                </strong>
                {" → click another person"}
              </span>
            )}
            {pathResult && pathResult.length > 0 && (
              <span className="text-white/80">
                <strong className="text-violet-300">
                  {pathResult.length - 1}
                </strong>{" "}
                degree{pathResult.length - 1 !== 1 ? "s" : ""} of separation
                <span className="ml-2 text-white/50">
                  (
                  {pathResult
                    .map((id) => firstName(nodesByIdRef.current[id]?.name, id))
                    .join(" → ")}
                  )
                </span>
              </span>
            )}
            {pathNotFound && (
              <span className="text-rose-300">
                No path found — different groups
              </span>
            )}
            <button
              onClick={() => {
                clearPath();
                setPathMode(false);
              }}
              className="text-white/40 hover:text-white ml-1 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {(pathResult || pathNotFound) && (
              <button
                onClick={clearPath}
                className="text-violet-300/60 hover:text-violet-300 text-xs underline ml-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── milestone celebration ── */}
      {milestone && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
          <div className="animate-[milestoneIn_6s_ease-out_forwards] flex flex-col items-center gap-3">
            <div className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#5B3FD6]/10 via-[#28B45A]/10 to-[#5B3FD6]/10 border border-white/20 shadow-2xl backdrop-blur-md">
              <PartyPopper className="w-8 h-8 text-yellow-400" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {milestone.value.toLocaleString()}
                </div>
                <div className="text-white/70 text-sm font-medium">
                  {milestone.type === "connections"
                    ? "Connections Made!"
                    : "People Connected!"}
                </div>
              </div>
              <PartyPopper className="w-8 h-8 text-yellow-400 scale-x-[-1]" />
            </div>
          </div>
        </div>
      )}

      {/* ── spotlight banner ── */}
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-3 z-20 space-y-2">
        {spotlights.slice(0, 2).map((s) => (
          <div
            key={s.id}
            className="mt-20 px-4 py-2 rounded-full bg-emerald-400/15 border border-white/20 text-white text-lg font-semibold shadow-lg animate-[fadeSlide_6s_ease-out_forwards]"
          >
            {s.from} <span className="opacity-70">connected with</span> {s.to}
          </div>
        ))}
      </div>

      {/* ── achievement toasts ── */}
      <div className="pointer-events-none absolute left-3 bottom-20 z-20 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white text-sm shadow-md animate-[toastIn_5s_ease-in-out_forwards]"
          >
            🏅 {t.text}
          </div>
        ))}
      </div>

      {/* ── graph ── */}
      <div className="relative z-10 h-[75vh] sm:h-[85vh] pb-16">
        <ForceGraph2D
          ref={fgRef as any}
          graphData={graphDataMemo as any}
          backgroundColor="rgba(0,0,0,0)"
          // idle bob/flip needs a frame every tick, not just while the
          // simulation is hot — force-graph otherwise parks the render loop
          autoPauseRedraw={false}
          nodeRelSize={9 * VIS}
          warmupTicks={400}
          cooldownTicks={1200}
          d3AlphaDecay={0.008}
          // 0.75 was near-total damping: nodes stopped a tick after they
          // started, so repulsion never had time to open the graph out
          d3VelocityDecay={0.42}
          linkCurvature={0}
          linkDirectionalParticles={(l: any) =>
            isRecent(l.createdAt || 0) ? 1 : 0
          }
          linkDirectionalParticleWidth={(l: any) =>
            isRecent(l.createdAt || 0) ? 1.6 * VIS : 0
          }
          linkDirectionalParticleSpeed={0.006}
          onRenderFramePre={(
            ctx: CanvasRenderingContext2D,
            globalScale: number,
          ) => {
            try {
              const arr: any[] = graphDataRef.current.nodes || [];
              const nodeIndex: Record<string, any> = {};
              for (const n of arr) nodeIndex[n.id] = n;
              const now = Date.now();

              // trails
              ctx.save();
              ctx.lineWidth = TRAIL_LINE_WIDTH;
              ctx.setLineDash(TRAIL_DASH);
              for (const tr of trails) {
                const s = nodeIndex[tr.s];
                const t = nodeIndex[tr.t];
                if (!s || !t) continue;
                if (
                  !isFiniteNum(s.x) ||
                  !isFiniteNum(s.y) ||
                  !isFiniteNum(t.x) ||
                  !isFiniteNum(t.y)
                )
                  continue;
                const age = now - tr.createdAt;
                if (age > TRAIL_WINDOW_MS) continue;
                const k = 1 - age / TRAIL_WINDOW_MS;
                ctx.strokeStyle = `rgba(255,255,255,${0.25 * k})`;
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(t.x, t.y);
                ctx.stroke();
              }
              ctx.restore();

              // heatmap
              if (heatmapEnabled) {
                ctx.save();
                ctx.globalCompositeOperation = "lighter";
                const hot: Array<{
                  n: WallNode;
                  x: number;
                  y: number;
                  heatK: number;
                }> = [];
                for (const n of arr) {
                  if (!isFiniteNum(n.x) || !isFiniteNum(n.y)) continue;
                  const ago = lastSeen.current[n.id]
                    ? now - lastSeen.current[n.id]
                    : Infinity;
                  if (ago > HEATMAP_WINDOW_MS) continue;
                  hot.push({
                    n,
                    x: n.x,
                    y: n.y,
                    heatK: 1 - ago / HEATMAP_WINDOW_MS,
                  });
                }
                const budgetK = Math.min(1, HEATMAP_HOT_BUDGET / hot.length);
                for (const { x, y, heatK } of hot) {
                  const inner = Math.max(0.0001, HEATMAP_RADIUS * 0.1);
                  const outer = Math.max(inner + 0.0001, HEATMAP_RADIUS);
                  const grad = ctx.createRadialGradient(
                    x,
                    y,
                    inner,
                    x,
                    y,
                    outer,
                  );
                  grad.addColorStop(
                    0,
                    `rgba(255,255,255,${HEATMAP_INTENSITY * heatK * budgetK})`,
                  );
                  grad.addColorStop(1, "rgba(255,255,255,0)");
                  ctx.fillStyle = grad;
                  ctx.beginPath();
                  ctx.arc(x, y, outer, 0, 2 * Math.PI);
                  ctx.fill();
                }
                ctx.restore();
              }
            } catch {}
          }}
          onEngineStop={() => {
            const g = fgRef.current as any;
            if (!g || zoomFitDone.current) return;
            try {
              g.zoomToFit?.(800, 120);
              zoomFitDone.current = true;
            } catch {}
          }}
          onNodeHover={(n: any) => setHoverId(n ? n.id : null)}
          onNodeClick={(n: any) => {
            if (pathMode) {
              handlePathNodeClick(n.id);
              return;
            }
            setFocusedId(n.id);
            setDetailNodeId(n.id);
            const g = fgRef.current as any;
            if (
              !g ||
              typeof g.centerAt !== "function" ||
              typeof g.zoom !== "function"
            )
              return;
            const dist = 120;
            const ratio = 1 + dist / Math.hypot(n.x || 1, n.y || 1);
            g.centerAt(n.x * ratio, n.y * ratio, 800);
            g.zoom(3, 800);
          }}
          onNodeDrag={(n: any) => {
            if (draggingIdRef.current !== n.id) {
              draggingIdRef.current = n.id;
              setDragMode(true);
            }
            setDraggingId(n.id);
            (n as any).fx = n.x;
            (n as any).fy = n.y;
          }}
          onNodeDragEnd={(n: any) => {
            (n as any).fx = n.x;
            (n as any).fy = n.y;
            setTimeout(() => {
              delete (n as any).fx;
              delete (n as any).fy;
            }, 80);
            draggingIdRef.current = null;
            setDraggingId(null);
            setDragMode(false);
          }}
          onBackgroundClick={() => {
            setFocusedId(null);
            setDetailNodeId(null);
            const g = fgRef.current as any;
            g?.zoomToFit?.(800, 80);
          }}
          linkCanvasObjectMode={() => "replace"}
          linkCanvasObject={(
            link: any,
            ctx: CanvasRenderingContext2D,
            globalScale: number,
          ) => {
            const s: any = link.source;
            const t: any = link.target;
            if (
              !s ||
              !t ||
              s.x == null ||
              s.y == null ||
              t.x == null ||
              t.y == null
            )
              return;

            const recent = isRecent(link.createdAt || 0);
            const born = link.__born as number | undefined;
            const age = born ? Date.now() - born : Infinity;
            const revealK = born
              ? Math.min(1, Math.max(0, age / LINK_REVEAL_MS))
              : 1;
            const ix = s.x + (t.x - s.x) * revealK;
            const iy = s.y + (t.y - s.y) * revealK;

            let alpha = recent ? 0.95 : 0.46;
            let lw = (recent ? 1.2 : 0.6) * VIS;

            const hasHighlight = highlightSet.size > 0;
            if (hasHighlight) {
              const sHi = highlightSet.has(s.id);
              const tHi = highlightSet.has(t.id);
              if (sHi || tHi) {
                alpha = 0.95;
                lw = 1.4 * VIS;
              } else {
                alpha = 0.12;
                lw = 0.3 * VIS;
              }
            }

            if (hoverId) {
              const nh = neighborsRef.current.get(hoverId) || new Set<string>();
              const on =
                s.id === hoverId ||
                t.id === hoverId ||
                nh.has(s.id) ||
                nh.has(t.id);
              if (on) {
                lw = 1.9;
                alpha = 0.95;
              } else if (!hasHighlight) {
                lw = 0.5;
                alpha = 0.16;
              }
            }

            let color = `rgba(255,255,255,${alpha})`;

            /* path finder highlight */
            if (pathEdgeSet.size > 0) {
              const eid = s.id < t.id ? `${s.id}|${t.id}` : `${t.id}|${s.id}`;
              if (pathEdgeSet.has(eid)) {
                color = "rgba(196, 148, 255, 0.95)";
                lw = 3 * VIS;
                alpha = 1;
              } else if (!pathNodeSet.has(s.id) && !pathNodeSet.has(t.id)) {
                alpha = 0.08;
                lw = 0.2 * VIS;
                color = `rgba(255,255,255,${alpha})`;
              }
            } else if (clusterMode && clusterMap.has(s.id)) {
              const ci = clusterMap.get(s.id)!;
              const hsl = CLUSTER_PALETTE[ci % CLUSTER_PALETTE.length];
              const match = hsl.match(/hsl\((\d+),?\s*(\d+)%,?\s*(\d+)%\)/);
              if (match) {
                color = `hsla(${match[1]}, ${match[2]}%, ${match[3]}%, ${alpha})`;
              }
            }

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(ix, iy);
            ctx.strokeStyle = color;
            ctx.lineWidth = lw;
            ctx.stroke();

            if (revealK < 1) {
              ctx.beginPath();
              ctx.arc(ix, iy, 2.2 * VIS, 0, 2 * Math.PI);
              ctx.fillStyle = "rgba(255,255,255,0.85)";
              ctx.fill();
            }
            ctx.restore();
          }}
          nodeCanvasObject={(
            node: any,
            ctx: CanvasRenderingContext2D,
            globalScale: number,
          ) => {
            if (!isFiniteNum(node.x) || !isFiniteNum(node.y)) return;

            const id = node.id as string;
            const arche = nodeArchetype(node, id);
            const name = firstName(node.name, id);

            const born = node.__born as number | undefined;
            const age = born ? Date.now() - born : Infinity;
            const introT =
              born != null ? Math.min(1, Math.max(0, age / INTRO_MS)) : 1;
            const kRaw = easeOutBack(Number.isFinite(introT) ? introT : 1);
            const pop = Number.isFinite(kRaw) ? 0.4 + 0.6 * kRaw : 1;

            const m = cardMetrics(name);
            const w = m.w * pop;
            const h = m.h * pop;
            const x = node.x - w / 2;
            const y = node.y - h / 2;

            const { bobY, sx, sy } = idleMotion(id, CARD_ICON / 2, Date.now());

            // accent: cluster mode or archetype
            let base: string;
            if (clusterMode && clusterMap.has(id)) {
              base =
                CLUSTER_PALETTE[clusterMap.get(id)! % CLUSTER_PALETTE.length];
            } else {
              base = ARCHETYPE_COLOR[arche];
            }

            // dim cards outside the current highlight
            const hasHighlight = highlightSet.size > 0;
            let nodeAlpha = 1;
            if (pathNodeSet.size > 0) {
              if (pathNodeSet.has(id)) {
                nodeAlpha = 1;
                base = "#5B4BF0";
              } else {
                nodeAlpha = 0.12;
              }
            } else if (hasHighlight && !highlightSet.has(id)) {
              let neighbour = false;
              Array.from(highlightSet).some((hid) => {
                if (neighborsRef.current.get(hid)?.has(id)) {
                  neighbour = true;
                  return true;
                }
                return false;
              });
              nodeAlpha = neighbour ? 0.45 : 0.15;
            }

            // whoever just tapped in wears their archetype colour, so you can
            // pick yourself out of a full wall the moment you scan
            const ts = lastSeen.current[id];
            const ago = ts ? Date.now() - ts : Infinity;
            const recent = ago < CARD_RECENT_MS;

            ctx.save();
            ctx.globalAlpha = nodeAlpha;

            // the card
            roundRect(ctx, x, y, w, h, CARD_CORNER * pop);
            ctx.fillStyle = CARD_FILL;
            ctx.fill();

            let edge = CARD_EDGE;
            let edgeW = CARD_EDGE_W;
            if (rankMap[id] !== undefined) {
              edge = CROWN_COLORS[rankMap[id]];
              edgeW = CARD_EDGE_W_ACTIVE;
            }
            if (recent) {
              edge = base;
              edgeW = CARD_EDGE_W_ACTIVE;
            }
            if (highlightSet.has(id) || pathNodeSet.has(id)) {
              edge = pathNodeSet.has(id) ? "#947FFE" : "rgba(255,255,255,0.9)";
              edgeW = CARD_EDGE_W_ACTIVE;
            }
            ctx.strokeStyle = edge;
            ctx.lineWidth = edgeW * pop;
            ctx.stroke();

            // the character, inside its own square on the left
            const iconBox = CARD_ICON * pop;
            const cxIcon = x + CARD_PAD * pop + iconBox / 2;
            const cyIcon = y + h / 2;
            const icon = getArchetypeImage(arche);
            if (icon) {
              const fit = fitIcon(icon, arche, iconBox);
              ctx.save();
              // sx sweeps +1 → 0 → -1 for the flip, sy squashes on the way
              ctx.translate(cxIcon, cyIcon + bobY * pop);
              ctx.scale(sx, sy);
              ctx.drawImage(icon, -fit.w / 2, -fit.h / 2, fit.w, fit.h);
              ctx.restore();
            } else {
              ctx.beginPath();
              ctx.arc(cxIcon, cyIcon, iconBox * 0.35, 0, 2 * Math.PI);
              ctx.fillStyle = base;
              ctx.fill();
            }

            // the name
            ctx.font = `${CARD_WEIGHT} ${CARD_NAME * pop}px ${WALL_FONT}`;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillStyle = CARD_INK;
            ctx.fillText(
              name,
              x + (CARD_PAD + CARD_ICON + CARD_GAP) * pop,
              cyIcon + CARD_NAME * pop * 0.06,
            );

            ctx.restore();

            // a card that just lit up pulses its edge outward once
            if (ago < HALO_RECENT_MS) {
              const p = 1 - ago / HALO_RECENT_MS;
              const g = 5 * (1 - p);
              ctx.save();
              ctx.globalAlpha = nodeAlpha * p * 0.7;
              roundRect(
                ctx,
                x - g,
                y - g,
                w + g * 2,
                h + g * 2,
                (CARD_CORNER + g) * pop,
              );
              ctx.strokeStyle = base;
              ctx.lineWidth = 0.9;
              ctx.stroke();
              ctx.restore();
            }
          }}
          nodePointerAreaPaint={(
            node: any,
            color: string,
            ctx: CanvasRenderingContext2D,
          ) => {
            const m = cardMetrics(firstName(node.name, node.id));
            ctx.fillStyle = color;
            ctx.fillRect(node.x - m.w / 2, node.y - m.h / 2, m.w, m.h);
          }}
        />
      </div>

      {/* ── footer: ticker ── */}
      {showTicker && (
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-[#1c1c1c] border-t border-white/10 px-4 sm:px-6 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full">
              {ticker.length === 0 ? (
                <div className="text-white/50 text-sm py-1">
                  Connections appear in real-time. Use NFC Cards to light up the
                  wall. Press S to search, H for heatmap.
                </div>
              ) : (
                <div
                  className="ticker"
                  ref={tickerContainerRef}
                  style={
                    {
                      "--ticker-fs": "16px",
                      "--ticker-dur": `${tickerDurSec}s`,
                      "--ticker-start": `${tickerStartPx}px`,
                      "--ticker-width": `${tickerContentPx}px`,
                    } as React.CSSProperties
                  }
                >
                  <div className="ticker__inner" ref={tickerTrackRef}>
                    {ticker.map((e) => (
                      <span key={e.id} className="ticker__item">
                        <span className="ticker__time">
                          {new Date(e.t).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          —{" "}
                        </span>
                        <strong>{e.from}</strong> ↔ <strong>{e.to}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!!QR_URL && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-2 bg-white/8 border border-white/15 rounded-lg px-2 py-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={QR_URL}
                    alt="Join"
                    width={52}
                    height={52}
                    style={{ width: 52, height: 52 }}
                  />
                  <div className="text-white/90 text-xs leading-tight pr-1">
                    <div className="font-semibold">Scan to join</div>
                    <div className="text-white/60">
                      Make a connection, see it live
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── styles ── */}
      <style jsx>{`
        .ticker {
          position: relative;
          width: 100%;
          overflow: hidden;
          height: calc(var(--ticker-fs, 16px) * 1.9);
        }
        .ticker__inner {
          display: inline-block;
          white-space: nowrap;
          padding-left: var(--ticker-start, 100%);
          will-change: transform;
          animation: tickerScroll var(--ticker-dur, 16s) linear infinite;
        }
        .ticker__item {
          display: inline-block;
          margin-right: 1.5rem;
          font-size: var(--ticker-fs, 16px);
          line-height: 1.25;
          color: rgba(255, 255, 255, 0.9);
        }
        .ticker__time {
          color: rgba(255, 255, 255, 0.5);
        }
        @keyframes tickerScroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(
              calc(-1 * (var(--ticker-start, 100%) + var(--ticker-width, 0px)))
            );
          }
        }
        @keyframes fadeSlide {
          0% {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
          10% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          85% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
        }
        @keyframes toastIn {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          10% {
            opacity: 1;
            transform: translateY(0);
          }
          80% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(6px);
          }
        }
        @keyframes milestoneIn {
          0% {
            opacity: 0;
            transform: scale(0.6);
          }
          8% {
            opacity: 1;
            transform: scale(1.08);
          }
          14% {
            transform: scale(1);
          }
          80% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.95) translateY(-12px);
          }
        }
      `}</style>
    </div>
  );
}

/* ── mini stat card for analytics panel ── */
function StatMini({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-2">
      <div className="flex items-center gap-1.5 text-white/50 mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-white font-semibold text-base">{value}</div>
    </div>
  );
}
