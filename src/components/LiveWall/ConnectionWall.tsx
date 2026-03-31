"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { WS_URL, EVENT_ID } from "@/lib/dbconfig";
import { fetchBackend } from "@/lib/db";
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
import { forceManyBody, forceCollide } from "d3-force";
import type { ForceGraphMethods } from "react-force-graph-2d";
import type { BiztechEvent } from "@/types";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

/* ───────────────────────── tunables ───────────────────────── */
const VIS = 0.5;
const SNAPSHOT_WINDOW_SEC = 860_400;
const RECENT_EDGE_WINDOW_MS = 5 * 60_000;
const TICKER_MAX = 24;

const CHARGE_BASE = -2000;
const CHARGE_PER_DEG = -80;
const CHARGE_DIST_MAX = 300;
const COLLIDE_BASE = 18 * VIS;
const COLLIDE_PER_DEG = 4 * VIS;

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

const CROWN_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];
const CROWN_GLOW = 108 * VIS;

const HEATMAP_WINDOW_MS = 5 * 60_000;
const HEATMAP_ENABLED_DEFAULT = true;
const HEATMAP_INTENSITY = 0.12;
const HEATMAP_RADIUS_BASE = 90 * VIS;
const HEATMAP_RADIUS_PER_DEG = 12 * VIS;

const TRAIL_WINDOW_MS = 90_000;
const TRAIL_MAX = 2000;
const TRAIL_LINE_WIDTH = 1 * VIS;
const TRAIL_DASH: [number, number] = [4 * VIS, 6 * VIS];

const LABEL_ZOOM_THRESHOLD = 0.8 / VIS;

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

const SIM_FIRST_NAMES = [
  "Alex",
  "Jordan",
  "Taylor",
  "Morgan",
  "Casey",
  "Riley",
  "Avery",
  "Quinn",
  "Harper",
  "Sage",
  "Kai",
  "Rowan",
  "Emery",
  "Dakota",
  "Skyler",
  "Phoenix",
  "Jamie",
  "Drew",
  "Blair",
  "Reese",
  "Cameron",
  "Hayden",
  "Peyton",
  "Charlie",
  "Finley",
  "Remy",
  "Eden",
  "Oakley",
  "Lennox",
  "Sutton",
  "Ari",
  "Noel",
  "Spencer",
  "Elliot",
  "Jesse",
  "River",
  "Devon",
  "Lane",
  "Sydney",
  "Tatum",
  "Kendall",
  "Shay",
  "Milan",
  "London",
  "Marley",
  "Kiran",
  "Jude",
  "Micah",
  "Luca",
  "Atlas",
  "Mika",
  "Zion",
  "Ellis",
  "Wren",
  "Cove",
  "Indigo",
  "Briar",
  "Harley",
  "Jaylen",
  "Robin",
  "Soren",
  "Ash",
  "Lake",
  "Raven",
];

const SIM_LAST_NAMES = [
  "Chen",
  "Kim",
  "Patel",
  "Lee",
  "Wang",
  "Singh",
  "Zhang",
  "Li",
  "Liu",
  "Park",
  "Yang",
  "Huang",
  "Wu",
  "Choi",
  "Lin",
  "Nguyen",
  "Ma",
  "Xu",
  "Sun",
  "Zhao",
  "Zhou",
  "Liang",
  "Guo",
  "Jiang",
  "Sharma",
  "Shah",
  "Kumar",
  "Das",
  "Malik",
  "Gupta",
  "Tanaka",
  "Yamamoto",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Martinez",
  "Davis",
  "Lopez",
  "Smith",
  "Taylor",
  "Anderson",
  "Thomas",
  "Jackson",
  "White",
  "Harris",
  "Martin",
];

const SIM_MAJORS = [
  "Computer Science",
  "Business",
  "Engineering",
  "Data Science",
  "Economics",
  "Mathematics",
  "Statistics",
  "Finance",
  "Marketing",
  "Design",
  "Psychology",
  "Biology",
  "Physics",
  "Chemistry",
  "Arts",
  "Philosophy",
  "Communications",
  "Information Systems",
  "Accounting",
  "Management",
];

const SIM_YEARS = [1, 2, 3, 4, 5];

const SIM_INTERVAL_MIN_MS = 1500;
const SIM_INTERVAL_MAX_MS = 5000;
const SIM_NEW_NODE_CHANCE = 0.45;
const SIM_INITIAL_BURST = 8;
const SIM_BURST_SPACING_MS = 350;

const makeFakeId = () => `sim-${Math.random().toString(36).slice(2, 10)}`;
const pickRandom = <T,>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const makeFakeProfile = () => ({
  id: makeFakeId(),
  name: `${pickRandom(SIM_FIRST_NAMES)} ${pickRandom(SIM_LAST_NAMES)}`,
  major: pickRandom(SIM_MAJORS),
  year: pickRandom(SIM_YEARS),
});

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

const normalizeNode = (n: any): WallNode => ({
  id: asString(n.id, String(n.id)),
  name: asString(n.name, String(n.id)),
  avatar: n.avatar ? asString(n.avatar, "") : undefined,
});

const firstName = (raw: string | undefined, fallbackId: string) => {
  const name = (raw ?? "").trim();
  if (!name) return fallbackId;
  const cleaned = name.includes(",")
    ? name.split(",")[1]?.trim() || name
    : name;
  return cleaned.split(/\s+/)[0] || fallbackId;
};

const fullName = (raw: string | undefined, fallbackId: string) => {
  const name = (raw ?? "").trim();
  return name || fallbackId;
};

const endId = (e: any) => (e && typeof e === "object" ? e.id : String(e));

const idToColor = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return `hsl(${hue} 70% 68%)`;
};

const drawLabel = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSize: number,
) => {
  ctx.font = `${fontSize}px system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif`;
  const padX = 4 * VIS;
  const padY = 2 * VIS;
  const w = ctx.measureText(text).width;
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(
    x - 3 * VIS,
    y - fontSize * 0.85,
    w + padX + 3 * VIS,
    fontSize + padY,
  );
  ctx.fillStyle = "rgba(255,255,255,0.94)";
  ctx.fillText(text, x, y);
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
  const simTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const simPoolRef = useRef<Array<{ id: string; name: string }>>([]);
  const simEmitRef = useRef<() => void>(() => {});

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
      const jitter = 12 * VIS;
      const dx = (Math.random() - 0.5) * jitter;
      const dy = (Math.random() - 0.5) * jitter;
      return {
        ...nn,
        x: anchor.x,
        y: anchor.y,
        vx: dx * 0.018,
        vy: dy * 0.018,
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
  const fetchSnapshot = useCallback(async (eventId?: string) => {
    try {
      const eid = eventId ?? selectedEventIdRef.current;
      const qs = new URLSearchParams({
        eventId: eid,
        sinceSec: String(SNAPSHOT_WINDOW_SEC),
      });
      const res: SnapshotResponse = await fetchBackend({
        endpoint: `/interactions/wall?${qs.toString()}`,
        method: "GET",
        authenticatedCall: false,
      });

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
    const g = fgRef.current as any;
    if (!g) return;

    const charge = (g.d3Force && g.d3Force("charge")) || forceManyBody();
    charge
      .strength((n: any) => {
        const d = degreeRef.current[n.id] || 0;
        return CHARGE_BASE + d * CHARGE_PER_DEG;
      })
      .distanceMax(CHARGE_DIST_MAX)
      .distanceMin(2);
    g.d3Force?.("charge", charge);

    const collide = forceCollide()
      .radius((n: any) => {
        const d = degreeRef.current[n.id] || 1;
        return COLLIDE_BASE + Math.sqrt(d) * COLLIDE_PER_DEG;
      })
      .strength(0.9)
      .iterations(2);
    g.d3Force?.("collide", collide);

    try {
      g.d3AlphaTarget?.(0.12);
      g.d3ReheatSimulation?.();
      setTimeout(() => g.d3AlphaTarget?.(0), 600);
    } catch {}
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
    const t = setInterval(() => fetchSnapshot(), 1800_000);
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

  /* ── simulation (dev only) ── */
  /* simEmit stored in ref to avoid stale closures */
  const simEmit = () => {
    try {
      const pool = simPoolRef.current;

      const pickOrCreate = (): { id: string; name: string } => {
        if (pool.length > 0 && Math.random() > SIM_NEW_NODE_CHANCE) {
          return pickRandom(pool);
        }
        const profile = makeFakeProfile();
        pool.push(profile);
        return profile;
      };

      const from = pickOrCreate();
      let to = pickOrCreate();
      let attempts = 0;
      while (to.id === from.id && attempts < 5) {
        to = pickOrCreate();
        attempts++;
      }
      if (to.id === from.id) return;

      const now = Date.now();

      const nf = ensureNode(from, to.id);
      const nt = ensureNode(to, from.id);

      /* skip cluster placement during initial burst */
      const hasLayout = graphDataRef.current.nodes.some(
        (n) => isFiniteNum(n.x) && isFiniteNum(n.y),
      );
      if (hasLayout) {
        const isIsolated = (id: string) =>
          (neighborsRef.current.get(id)?.size || 0) === 0;
        if (isIsolated(nf.id) && isIsolated(nt.id)) {
          placeNewClusterAway(nf, nt);
        }
        freezeExisting(450, [nf.id, nt.id]);
      }

      const key = [nf.id, nt.id].sort().join("|");
      const last = pairRecentlySeen.current.get(key) || 0;
      if (now - last >= DEDUPE_GRACE_MS) {
        pairRecentlySeen.current.set(key, now);
        addLinkInPlace({ source: nf.id, target: nt.id, createdAt: now }, now);
        setTrails((prev) => [
          ...prev.slice(Math.max(0, prev.length - (TRAIL_MAX - 1))),
          { s: nf.id, t: nt.id, createdAt: now },
        ]);
        pushTicker(nf, nt, now);
      }

      if (hasLayout) alphaKick(600, 0.15);
    } catch (err) {
      console.warn("[SIM] emit error:", err);
    }
  };
  simEmitRef.current = simEmit;

  useEffect(() => {
    if (!IS_DEV || !simActive) return;

    let cancelled = false;
    const burstTimers: ReturnType<typeof setTimeout>[] = [];

    /* initial burst — staggered so the graph can settle */
    for (let i = 0; i < SIM_INITIAL_BURST; i++) {
      burstTimers.push(
        setTimeout(() => {
          if (!cancelled) simEmitRef.current();
        }, i * SIM_BURST_SPACING_MS),
      );
    }

    /* steady-state: recurring ticks via ref */
    const scheduleNext = () => {
      if (cancelled) return;
      const delay =
        SIM_INTERVAL_MIN_MS +
        Math.random() * (SIM_INTERVAL_MAX_MS - SIM_INTERVAL_MIN_MS);
      simTimerRef.current = setTimeout(() => {
        if (cancelled) return;
        simEmitRef.current();
        scheduleNext();
      }, delay);
    };

    /* start the recurring loop after the burst finishes */
    const burstDoneMs = SIM_INITIAL_BURST * SIM_BURST_SPACING_MS + 200;
    const startTimer = setTimeout(() => {
      if (!cancelled) scheduleNext();
    }, burstDoneMs);

    return () => {
      cancelled = true;
      burstTimers.forEach(clearTimeout);
      clearTimeout(startTimer);
      if (simTimerRef.current) {
        clearTimeout(simTimerRef.current);
        simTimerRef.current = null;
      }
    };
  }, [simActive]);

  const toggleSim = useCallback(() => {
    if (!IS_DEV) return;
    setSimActive((v) => !v);
  }, []);

  const clearSim = useCallback(() => {
    setSimActive(false);
    simPoolRef.current = [];
    clearGraph();
  }, [clearGraph]);

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
      className={`min-h-[95vh] rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden relative ${kiosk ? "cursor-none" : ""}`}
    >
      {/* ── header ── */}
      {!kiosk && (
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 gap-2 flex-wrap">
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
                <option value={EVENT_ID} className="bg-[#1a1f3a] text-white">
                  Current Event
                </option>
                {events.map((ev) => (
                  <option
                    key={`${ev.id}-${ev.year}`}
                    value={ev.id}
                    className="bg-[#1a1f3a] text-white"
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
                className={`p-1.5 rounded-md transition-colors ${searchOpen ? "bg-emerald-400/20 text-emerald-300" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                title="Search people (S)"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowAnalytics((v) => !v)}
                className={`p-1.5 rounded-md transition-colors ${showAnalytics ? "bg-emerald-400/20 text-emerald-300" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                title="Network analytics"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setClusterMode((v) => !v)}
                className={`p-1.5 rounded-md transition-colors ${clusterMode ? "bg-emerald-400/20 text-emerald-300" : "text-white/60 hover:text-white hover:bg-white/10"}`}
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
                className={`p-1.5 rounded-md transition-colors ${heatmapEnabled ? "bg-emerald-400/20 text-emerald-300" : "text-white/60 hover:text-white hover:bg-white/10"}`}
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
                  {simActive && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-transparent border-orange-400/30 text-orange-300 hover:bg-orange-400/10 h-7 px-2 text-xs"
                      onClick={clearSim}
                      title="Clear simulated data"
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
          <div className="rounded-xl border border-white/15 bg-[#1a1f3a]/95 backdrop-blur-md shadow-2xl overflow-hidden">
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
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: idToColor(n.id) }}
                      />
                      <div className="min-w-0">
                        <div className="text-white text-sm truncate">
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
          <div className="w-[260px] rounded-xl border border-white/10 bg-[#1a1f3a]/90 backdrop-blur-sm p-3">
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
                            backgroundColor: `rgba(110, 231, 183, ${0.2 + recency * 0.6})`,
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
          <div className="w-[260px] rounded-xl border border-white/10 bg-[#1a1f3a]/90 backdrop-blur-sm p-3">
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
          <div className="w-[280px] rounded-xl border border-white/10 bg-[#1a1f3a]/95 backdrop-blur-md p-3 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      clusterMode && clusterMap.has(detailNodeId!)
                        ? CLUSTER_PALETTE[
                            clusterMap.get(detailNodeId!)! %
                              CLUSTER_PALETTE.length
                          ]
                        : idToColor(detailNodeId!),
                  }}
                />
                <h3 className="text-white font-medium text-sm truncate">
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

            <div className="text-xs text-white/60 mb-3">
              {detailNode.degree} connection{detailNode.degree !== 1 ? "s" : ""}
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
                          style={{ backgroundColor: idToColor(c.id) }}
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
          <div className="rounded-xl border border-violet-400/20 bg-[#1a1f3a]/95 backdrop-blur-md px-4 py-2.5 shadow-2xl flex items-center gap-3 text-sm">
            <Route className="w-4 h-4 text-violet-400 shrink-0" />
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
            <div className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-500/20 via-emerald-500/20 to-violet-500/20 border border-emerald-300/30 shadow-2xl backdrop-blur-md">
              <PartyPopper className="w-8 h-8 text-yellow-400" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {milestone.value.toLocaleString()}
                </div>
                <div className="text-emerald-200 text-sm font-medium">
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
            className="mt-20 px-4 py-2 rounded-full bg-emerald-400/15 border border-emerald-300/30 text-emerald-100 text-lg font-semibold shadow-lg animate-[fadeSlide_6s_ease-out_forwards]"
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
      <div className="relative h-[75vh] sm:h-[85vh] pb-16">
        <ForceGraph2D
          ref={fgRef as any}
          graphData={graphDataMemo as any}
          backgroundColor="rgba(0,0,0,0)"
          nodeRelSize={9 * VIS}
          warmupTicks={200}
          cooldownTicks={400}
          d3AlphaDecay={0.018}
          d3VelocityDecay={0.75}
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
                for (const n of arr) {
                  if (!isFiniteNum(n.x) || !isFiniteNum(n.y)) continue;
                  const ago = lastSeen.current[n.id]
                    ? now - lastSeen.current[n.id]
                    : Infinity;
                  if (ago > HEATMAP_WINDOW_MS) continue;
                  const heatK = 1 - ago / HEATMAP_WINDOW_MS;
                  const deg = Number.isFinite(degree[n.id]) ? degree[n.id] : 1;
                  const radius =
                    HEATMAP_RADIUS_BASE +
                    Math.sqrt(Math.max(1, deg)) * HEATMAP_RADIUS_PER_DEG;
                  const inner = Math.max(0.0001, radius * 0.1);
                  const outer = Math.max(inner + 0.0001, radius);
                  const grad = ctx.createRadialGradient(
                    n.x,
                    n.y,
                    inner,
                    n.x,
                    n.y,
                    outer,
                  );
                  grad.addColorStop(
                    0,
                    `rgba(255,255,255,${HEATMAP_INTENSITY * heatK})`,
                  );
                  grad.addColorStop(1, "rgba(255,255,255,0)");
                  ctx.fillStyle = grad;
                  ctx.beginPath();
                  ctx.arc(n.x, n.y, outer, 0, 2 * Math.PI);
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

            let alpha = recent ? 0.65 : 0.22;
            let lw = (recent ? 1.2 : 0.6) * VIS;

            const hasHighlight = highlightSet.size > 0;
            if (hasHighlight) {
              const sHi = highlightSet.has(s.id);
              const tHi = highlightSet.has(t.id);
              if (sHi || tHi) {
                alpha = 0.7;
                lw = 1.4 * VIS;
              } else {
                alpha = 0.06;
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
                lw = 1.6 * VIS;
                alpha = 0.65;
              } else if (!hasHighlight) {
                lw = 0.4 * VIS;
                alpha = 0.12;
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
                alpha = 0.04;
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
            const deg = Number.isFinite(degree[id]) ? degree[id] : 1;

            const born = node.__born as number | undefined;
            const age = born ? Date.now() - born : Infinity;
            const introTRaw =
              born != null ? Math.min(1, Math.max(0, age / INTRO_MS)) : 1;
            const introT = Number.isFinite(introTRaw) ? introTRaw : 1;
            const kRaw = easeOutBack(introT);
            const k = Number.isFinite(kRaw) ? kRaw : 1;

            const baseR =
              (3 + Math.min(7, Math.sqrt(Math.max(1, deg)) * 1.4)) * VIS;
            const rRaw = baseR * (0.4 + 0.7 * k);
            const r = Number.isFinite(rRaw) ? rRaw : baseR;

            // color: cluster mode or default
            let base: string;
            if (clusterMode && clusterMap.has(id)) {
              base =
                CLUSTER_PALETTE[clusterMap.get(id)! % CLUSTER_PALETTE.length];
            } else {
              base = idToColor(id);
            }

            // dim non-highlighted nodes
            const hasHighlight = highlightSet.size > 0;
            let nodeAlpha = 0.85;
            if (pathNodeSet.size > 0) {
              /* path finder: highlight path, dim rest */
              if (pathNodeSet.has(id)) {
                nodeAlpha = 1;
                base = "hsl(270, 80%, 75%)";
              } else {
                nodeAlpha = 0.08;
              }
            } else if (hasHighlight && !highlightSet.has(id)) {
              let isNeighborOfHighlight = false;
              Array.from(highlightSet).some((hid) => {
                const nbrs = neighborsRef.current.get(hid);
                if (nbrs?.has(id)) {
                  isNeighborOfHighlight = true;
                  return true;
                }
                return false;
              });
              nodeAlpha = isNeighborOfHighlight ? 0.4 : 0.12;
            }

            // bloom
            const innerR = Math.max(0.0001, r * 0.2);
            const outerR = Math.max(innerR + 0.0001, r * 2.2);
            if (
              isFiniteNum(node.x) &&
              isFiniteNum(node.y) &&
              isFiniteNum(innerR) &&
              isFiniteNum(outerR)
            ) {
              const grad = ctx.createRadialGradient(
                node.x,
                node.y,
                innerR,
                node.x,
                node.y,
                outerR,
              );
              grad.addColorStop(
                0,
                base.replace(/68%\)/, "80%)").replace(/\d+%\)$/, "80%)"),
              );
              grad.addColorStop(1, "rgba(255,255,255,0)");
              ctx.save();
              ctx.globalAlpha = 0.35 * k * (nodeAlpha / 0.85);
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(node.x, node.y, outerR, 0, 2 * Math.PI);
              ctx.fill();
              ctx.restore();
            }

            // intro ring
            if (introT < 1) {
              const ringProg = 1 - introT;
              const ringR = r + 12 * ringProg * VIS;
              ctx.save();
              ctx.beginPath();
              ctx.arc(node.x, node.y, ringR, 0, 2 * Math.PI);
              ctx.strokeStyle = `rgba(255,255,255,${0.24 * ringProg})`;
              ctx.lineWidth = 2.2 * VIS * (ringProg + 0.2);
              ctx.stroke();
              ctx.restore();
            }

            // recent halo
            const ts = lastSeen.current[id];
            const ago = ts ? Date.now() - ts : Infinity;
            if (ago < HALO_RECENT_MS) {
              const progress = 1 - ago / HALO_RECENT_MS;
              const haloR = r + 10 * progress * VIS;
              ctx.save();
              ctx.beginPath();
              ctx.arc(node.x, node.y, haloR, 0, 2 * Math.PI);
              ctx.strokeStyle = `rgba(255,255,255,${0.18 * progress})`;
              ctx.lineWidth = 3 * VIS * progress;
              ctx.stroke();
              ctx.restore();
            }

            // search highlight ring
            if (highlightSet.has(id)) {
              ctx.save();
              ctx.beginPath();
              ctx.arc(node.x, node.y, r + 6 * VIS, 0, 2 * Math.PI);
              ctx.strokeStyle = "rgba(110, 231, 183, 0.8)";
              ctx.lineWidth = 2 * VIS;
              ctx.shadowColor = "rgba(110, 231, 183, 0.6)";
              ctx.shadowBlur = 12 * VIS;
              ctx.stroke();
              ctx.restore();
            }

            // path finder: ring for start/path nodes
            if (pathMode && pathStart === id) {
              ctx.save();
              ctx.beginPath();
              ctx.arc(node.x, node.y, r + 8 * VIS, 0, 2 * Math.PI);
              ctx.strokeStyle = "rgba(196, 148, 255, 0.9)";
              ctx.lineWidth = 2.5 * VIS;
              ctx.shadowColor = "rgba(196, 148, 255, 0.7)";
              ctx.shadowBlur = 16 * VIS;
              ctx.stroke();
              ctx.restore();
            } else if (
              pathNodeSet.has(id) &&
              pathResult &&
              pathResult.length > 0
            ) {
              ctx.save();
              ctx.beginPath();
              ctx.arc(node.x, node.y, r + 5 * VIS, 0, 2 * Math.PI);
              ctx.strokeStyle = "rgba(196, 148, 255, 0.6)";
              ctx.lineWidth = 1.5 * VIS;
              ctx.stroke();
              ctx.restore();
            }

            // core
            ctx.save();
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
            ctx.shadowColor = base;
            const glow = 12 + Math.min(18, Math.sqrt(Math.max(1, deg)) * 1.4);
            ctx.shadowBlur = glow * VIS * (0.8 + 0.2 * k);
            ctx.globalAlpha = nodeAlpha;
            ctx.fillStyle = base;
            ctx.fill();
            ctx.restore();

            // crown/badge
            if (rankMap[id] !== undefined) {
              const rank = rankMap[id];
              const color = CROWN_COLORS[rank];
              ctx.save();
              ctx.shadowColor = color;
              ctx.shadowBlur = CROWN_GLOW;
              ctx.strokeStyle = color;
              ctx.lineWidth = 2.4 * VIS;
              ctx.globalAlpha = nodeAlpha;
              ctx.beginPath();
              ctx.arc(node.x, node.y, r + 5 * VIS, 0, 2 * Math.PI);
              ctx.stroke();
              ctx.restore();
            }

            // label
            const show =
              globalScale > LABEL_ZOOM_THRESHOLD ||
              hoverId === id ||
              focusedId === id ||
              highlightSet.has(id);
            if (show && nodeAlpha > 0.3) {
              const label = firstName(node.name, id);
              const fontSize = Math.max(8 * VIS, (9 * VIS) / globalScale);
              drawLabel(
                ctx,
                label,
                node.x + r + 4 * VIS,
                node.y + 0.5,
                fontSize,
              );
            }
          }}
          nodePointerAreaPaint={(
            node: any,
            color: string,
            ctx: CanvasRenderingContext2D,
          ) => {
            const id = node.id as string;
            const r = (4 + Math.min(7, Math.sqrt(degree[id] || 1) * 1.4)) * VIS;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, r + 2 * VIS, 0, 2 * Math.PI);
            ctx.fill();
          }}
        />
      </div>

      {/* ── footer: ticker ── */}
      {showTicker && (
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-[#1a1f3a] border-t border-white/10 px-4 sm:px-6 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full">
              {ticker.length === 0 ? (
                <div className="text-white/50 text-sm py-1">
                  Connections appear in real-time. Use NFC BizCards to light up
                  the wall. Press S to search, H for heatmap.
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
          color: rgba(255, 255, 255, 0.6);
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
