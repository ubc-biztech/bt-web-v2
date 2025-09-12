"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { WS_URL, EVENT_ID } from "@/lib/dbconfig";
import { fetchBackend } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { RefreshCw, Zap, Trophy, Radio } from "lucide-react";
import { forceManyBody, forceCollide, forceX, forceY } from "d3-force";
import type { ForceGraphMethods } from "react-force-graph-2d";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

// Tunables
const VIS = 0.5; // graph visuals scale
const SNAPSHOT_WINDOW_SEC = 86_400;
const RECENT_EDGE_WINDOW_MS = 5 * 60_000;
const TICKER_MAX = 24;

// Layout (physics stays familiar)
const CHARGE_BASE = -2000;
const CHARGE_PER_DEG = -80;
const CHARGE_DIST_MAX = 9000;
const COLLIDE_BASE = 18 * VIS;
const COLLIDE_PER_DEG = 4 * VIS;

// Cool effects and stuff
const SPOTLIGHT_MS = 6000;
const HALO_RECENT_MS = 20_000;
const AUTOPAN_ENABLED_DEFAULT = false;
const AUTOPAN_INTERVAL_MS = 12_000;
const AUTOPAN_ZOOM = 2.6;
const AUTOPAN_PAN_MS = 1200;
const AUTOPAN_ZOOM_MS = 1200;
const DEDUPE_GRACE_MS = 4000;

// Smoother spawns
const isFiniteNum = (v: any) => typeof v === "number" && Number.isFinite(v);
const INTRO_MS = 1200; // node pop-in duration
const LINK_REVEAL_MS = 700; // link grow duration

// Streaks
const STREAK_WINDOW_MS = 2 * 60_000;
const STREAK_THRESHOLD = 3;

// Optional QR
const QR_URL = process.env.NEXT_PUBLIC_WALL_QR_URL || "";

// Crowns
const CROWN_COUNT = 3; // top-N nodes to crown
const CROWN_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];
const CROWN_GLOW = 108 * VIS;

// Heatmap
const HEATMAP_WINDOW_MS = 5 * 60_000; // recent activity window
const HEATMAP_ENABLED_DEFAULT = true;
const HEATMAP_INTENSITY = 0.12; // alpha multiplier
const HEATMAP_RADIUS_BASE = 90 * VIS; // base radius per node
const HEATMAP_RADIUS_PER_DEG = 12 * VIS;

// Trails
const TRAIL_WINDOW_MS = 90_000; // how long trails linger
const TRAIL_MAX = 2000; // limit objects for perf
const TRAIL_LINE_WIDTH = 1 * VIS;
const TRAIL_DASH: [number, number] = [4 * VIS, 6 * VIS];

// zoom stuff

const LABEL_ZOOM_THRESHOLD = 0.8 / VIS;
const LABEL_MIN_PX = 10 * VIS;
const LABEL_BASE_PX = 11 * VIS;

// Types

type WallNode = {
  id: string;
  name: string;
  avatar?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  // timestamp when added live
  __born?: number;
  __pinUntil?: number;
};

type WallLink = { source: string; target: string; createdAt: number };
type WallLinkLive = WallLink & { __born?: number }; // for reveal animation
type SnapshotResponse = { nodes: WallNode[]; links: WallLink[] };
type Spotlight = { id: string; from: string; to: string; t: number };

type Trail = { s: string; t: string; createdAt: number };

// Utils
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

export default function ConnectionWall() {
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const pairRecentlySeen = useRef<Map<string, number>>(new Map());

  // data
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

  // ws + errors
  const [wsStatus, setWsStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [lastError, setLastError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // ui
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [showTicker, setShowTicker] = useState(true);
  const [autoPan, setAutoPan] = useState(AUTOPAN_ENABLED_DEFAULT);
  const [kiosk, setKiosk] = useState(false);
  const zoomFitDone = useRef(false);

  // overlays
  const [spotlights, setSpotlights] = useState<Spotlight[]>([]);
  const [toasts, setToasts] = useState<
    Array<{ id: string; text: string; t: number }>
  >([]);

  // ticker + analytics
  const [ticker, setTicker] = useState<
    Array<{ id?: string; from: string; to: string; t: number }>
  >([]);
  const [totalToday, setTotalToday] = useState(0);
  const [perMinute, setPerMinute] = useState(0);

  // recency maps
  const lastSeen = useRef<Record<string, number>>({});
  const streakMap = useRef<Record<string, number[]>>({});

  // trails & heatmap state
  const [trails, setTrails] = useState<Trail[]>([]);
  const [heatmapEnabled, setHeatmapEnabled] = useState(HEATMAP_ENABLED_DEFAULT);

  // ticker measure
  const tickerContainerRef = useRef<HTMLDivElement | null>(null);
  const tickerTrackRef = useRef<HTMLDivElement | null>(null);
  const [tickerDurSec, setTickerDurSec] = useState(16);
  const [tickerStartPx, setTickerStartPx] = useState(0);
  const [tickerContentPx, setTickerContentPx] = useState(0);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragModeRef = useRef(false);

  // derived
  const [degree, setDegree] = useState<Record<string, number>>({});
  const degreeRef = useRef<Record<string, number>>({});
  useEffect(() => {
    degreeRef.current = degree;
  }, [degree]);

  const topRanks = useMemo(() => {
    return Object.entries(degree)
      .sort((a, b) => b[1] - a[1]) // sort by degree desc
      .slice(0, 3)
      .map(([id], i) => ({ id, rank: i })); // rank: 0=gold,1=silver,2=bronze
  }, [degree]);

  const rankMap = useMemo(() => {
    const m: Record<string, number> = {};
    topRanks.forEach(({ id, rank }) => (m[id] = rank));
    return m;
  }, [topRanks]);

  // helpers to make it spawn it nicely
  const getGraphNode = (id: string): WallNode | null =>
    nodesByIdRef.current[id] || null;

  // spring-like alpha kick
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
          const damp = 1 - t; // linear decay of target
          g.d3AlphaTarget(peak * damp);
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
        // @ts-ignore
        (n as any).fx = n.x;
        // @ts-ignore
        (n as any).fy = n.y;
      }
    }
    setTimeout(() => {
      const tnow = Date.now();
      for (const n of graphDataRef.current.nodes) {
        if ((n.__pinUntil || 0) <= tnow) {
          // @ts-ignore
          delete (n as any).fx;
          // @ts-ignore
          delete (n as any).fy;
          n.__pinUntil = 0;
        }
      }
    }, ms + 20);
  };

  const linkKey = (l: WallLink | any) =>
    `${endId(l.source)}|${endId(l.target)}|${l.createdAt}`;

  const ensureNode = (raw: WallNode | any, spawnNearId?: string): WallNode => {
    const base = normalizeNode(raw);
    const existing = nodesByIdRef.current[base.id];
    if (existing) return existing;
    const seeded = spawnNodeNear(base, spawnNearId);

    // mutate arrays/indices in place
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
      // spawn literally at anchor and drift out a bit
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

    const live: WallLinkLive = { ...l, __born: bornTs ?? Date.now() };
    graphDataRef.current.links.push(live);
    pairKeySetRef.current.add(pk);

    const sId = endId(l.source);
    const tId = endId(l.target);

    if (!neighborsRef.current.has(sId))
      neighborsRef.current.set(sId, new Set());
    if (!neighborsRef.current.has(tId))
      neighborsRef.current.set(tId, new Set());

    const sNeigh = neighborsRef.current.get(sId)!;
    const tNeigh = neighborsRef.current.get(tId)!;

    const wasNewNeighbor = !sNeigh.has(tId);

    sNeigh.add(tId);
    tNeigh.add(sId);

    if (wasNewNeighbor) {
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

  // fetch snapshot
  const fetchSnapshot = async () => {
    try {
      const qs = new URLSearchParams({
        eventId: EVENT_ID,
        sinceSec: String(SNAPSHOT_WINDOW_SEC),
      });
      const res: SnapshotResponse = await fetchBackend({
        endpoint: `/interactions/wall?${qs.toString()}`,
        method: "GET",
        authenticatedCall: false,
      });

      // merge nodes
      for (const raw of res.nodes) {
        const n = normalizeNode(raw);
        if (!nodesByIdRef.current[n.id]) {
          const seeded = { ...n, __born: 0 };
          nodesByIdRef.current[seeded.id] = seeded;
          graphDataRef.current.nodes.push(seeded);
        }
      }

      // merge links
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

      // recompute degree once for snapshot to sync UI
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
  };

  // URL toggles
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

  // keyboard toggles
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "l") setShowLeaderboard((v) => !v);
      if (e.key.toLowerCase() === "t") setShowTicker((v) => !v);
      if (e.key.toLowerCase() === "a") setAutoPan((v) => !v);
      if (e.key.toLowerCase() === "h") setHeatmapEnabled((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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

  // compute current graph center and max radius (rough bounding circle)
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

  // push a new 2-node component to an empty ring outside existing clusters
  const placeNewClusterAway = (a: WallNode, b: WallNode) => {
    const { cx, cy, r } = getGraphExtent();
    // how far from center to spawn the new mini-cluster
    const margin = 140 * VIS;
    const targetR = (r || 220 * VIS) + margin;

    // choose a deterministic angle using ids to spread clusters around the ring
    const hash = (s: string) => {
      let h = 0;
      for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
      return h;
    };
    const θ = ((hash(a.id + "|" + b.id) % 360) * Math.PI) / 180;

    const tx = cx + targetR * Math.cos(θ);
    const ty = cy + targetR * Math.sin(θ);

    // small separation so their edge has length > 0 at start
    const sep = 22 * VIS;
    a.x = tx - sep;
    a.y = ty;
    b.x = tx + sep;
    b.y = ty;

    const kick = 0.02;
    a.vx = Math.cos(θ) * kick;
    a.vy = Math.sin(θ) * kick;
    b.vx = Math.cos(θ) * kick;
    b.vy = Math.sin(θ) * kick;

    // @ts-ignore
    (a as any).fx = a.x; // pin for a moment
    // @ts-ignore
    (a as any).fy = a.y;
    // @ts-ignore
    (b as any).fx = b.x;
    // @ts-ignore
    (b as any).fy = b.y;
    setTimeout(() => {
      // @ts-ignore
      delete (a as any).fx;
      // @ts-ignore
      delete (a as any).fy;
      // @ts-ignore
      delete (b as any).fx;
      // @ts-ignore
      delete (b as any).fy;
    }, 600);
  };

  // websocket lifecycle
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
          ws.send(JSON.stringify({ action: "subscribe", eventId: EVENT_ID }));
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
                // If both are new or currently isolated (degree 0), it's a new mini-component
                const isIsolated = (id: string) =>
                  (neighborsRef.current.get(id)?.size || 0) === 0;

                if (isIsolated(nf.id) && isIsolated(nt.id)) {
                  // Seed this 2-node component outside the current graph envelope
                  placeNewClusterAway(nf, nt);
                }

                // (optional) lightly freeze others so this doesn’t jostle existing clusters
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
                    { s: nf.id, t: nt.id, createdAt: ts },
                  ]);
                  pushTicker(nf, nt, ts);
                }
              }

              if (nf?.id && nt?.id) {
                freezeExisting(450, [nf.id, nt.id]);

                const ts = createdAt || Date.now();
                const key = [nf.id, nt.id].sort().join("|");
                const last = pairRecentlySeen.current.get(key) || 0;

                if (ts - last < DEDUPE_GRACE_MS) return;
                pairRecentlySeen.current.set(key, ts);

                addLinkInPlace(
                  { source: nf.id, target: nt.id, createdAt: ts },
                  ts,
                );
                setTrails((prev) => {
                  const next = [
                    ...prev,
                    { s: nf!.id, t: nt!.id, createdAt: ts },
                  ].slice(Math.max(0, prev.length - (TRAIL_MAX - 1)));
                  return next;
                });

                pushTicker(nf, nt, ts);
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
  }, []);

  // initial + periodic snapshot
  useEffect(() => {
    fetchSnapshot();
    const t = setInterval(fetchSnapshot, 600_000);
    return () => clearInterval(t);
  }, []);

  // prune old trails periodically
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setTrails((prev) =>
        prev.filter((tr) => now - tr.createdAt <= TRAIL_WINDOW_MS),
      );
    }, 2000);
    return () => clearInterval(id);
  }, []);

  // dedupe map cleanup
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      pairRecentlySeen.current.forEach((t, k) => {
        if (now - t > DEDUPE_GRACE_MS * 5) pairRecentlySeen.current.delete(k);
      });
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  const setDragMode = (on: boolean) => {
    const g = fgRef.current as any;
    if (!g) return;

    if (on && !dragModeRef.current) {
      dragModeRef.current = true;

      const charge = (g.d3Force && g.d3Force("charge")) || forceManyBody();
      charge
        .strength((n: any) => {
          if (n.id === draggingId) return 0;
          const d = degreeRef.current[n.id] || 0;
          return -220 - d * 25;
        })
        .distanceMax(300)
        .distanceMin(2);
      g.d3Force?.("charge", charge);

      const gx = forceX(0).strength(0.02);
      const gy = forceY(0).strength(0.02);
      g.d3Force?.("gx", gx);
      g.d3Force?.("gy", gy);

      const link = g.d3Force && g.d3Force("link");
      if (link && typeof link.distance === "function") {
        link.distance((l: any) => 60).strength(0.9);
        g.d3Force?.("link", link);
      }

      const collide = forceCollide()
        .radius((n: any) => {
          const d = degreeRef.current[n.id] || 1;
          return (COLLIDE_BASE + Math.sqrt(d) * COLLIDE_PER_DEG) * 1.15;
        })
        .strength(1)
        .iterations(4);
      g.d3Force?.("collide", collide);

      try {
        g.d3VelocityDecay?.(0.86);
        g.d3AlphaTarget?.(0.08);
        g.d3ReheatSimulation?.();
      } catch {}
    }

    if (!on && dragModeRef.current) {
      dragModeRef.current = false;

      const charge = (g.d3Force && g.d3Force("charge")) || forceManyBody();
      charge
        .strength((n: any) => {
          const d = degreeRef.current[n.id] || 0;
          return CHARGE_BASE + d * CHARGE_PER_DEG;
        })
        .distanceMax(CHARGE_DIST_MAX)
        .distanceMin(2);
      g.d3Force?.("charge", charge);

      g.d3Force?.("gx", null);
      g.d3Force?.("gy", null);

      const link = g.d3Force && g.d3Force("link");
      if (link && typeof link.distance === "function") {
        link.distance(null).strength(0.7);
        g.d3Force?.("link", link);
      }

      const collide = forceCollide()
        .radius((n: any) => {
          const d = degreeRef.current[n.id] || 1;
          return COLLIDE_BASE + Math.sqrt(d) * COLLIDE_PER_DEG;
        })
        .strength(0.9)
        .iterations(2);
      g.d3Force?.("collide", collide);

      try {
        g.d3VelocityDecay?.(0.75);
        g.d3AlphaTarget?.(0);
        g.d3ReheatSimulation?.();
      } catch {}
    }
  };

  // camera tour
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

  // ticker size/duration
  useEffect(() => {
    const measure = () => {
      const c = tickerContainerRef.current;
      const t = tickerTrackRef.current;
      if (!c || !t) return;
      const cw = c.offsetWidth;
      const tw = t.scrollWidth;
      setTickerStartPx(cw);
      setTickerContentPx(tw);
      const PX_PER_SEC = 120;
      setTickerDurSec((cw + tw) / PX_PER_SEC);
    };

    measure();

    const ro = new ResizeObserver(measure);
    if (tickerContainerRef.current) ro.observe(tickerContainerRef.current);
    if (tickerTrackRef.current) ro.observe(tickerTrackRef.current);
    return () => ro.disconnect();
  }, [ticker]);

  // helpers
  const isRecent = (t: number) => Date.now() - t <= RECENT_EDGE_WINDOW_MS;
  const seenAgo = (id: string) => {
    const ts = lastSeen.current[id];
    return ts ? Date.now() - ts : Infinity;
  };

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

  // UI
  return (
    <div
      className={`min-h-[95vh] rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden relative ${kiosk ? "cursor-none" : ""}`}
    >
      {/* Header */}
      {!kiosk && (
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full ${
                wsStatus === "connected"
                  ? "bg-emerald-400"
                  : wsStatus === "connecting"
                    ? "bg-yellow-400"
                    : "bg-red-400"
              }`}
            />
            <div className="text-white/90 text-sm sm:text-base">
              Live Connection Wall
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

          <div className="hidden md:flex items-center gap-4 text-xs text-white">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-white">
              <Zap className="w-3 h-3" />
              <span className="font-medium">{totalToday.toLocaleString()}</span>
              <span className="text-white/60">today</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-white">
              <Radio className="w-3 h-3" />
              <span className="font-medium">{perMinute}</span>
              <span className="text-white/60">last min</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
              onClick={fetchSnapshot}
              title="Refresh snapshot"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {showLeaderboard && (
        <aside className="absolute right-3 top-14 z-10 hidden xl:block mt-4">
          <div className="w-[280px] rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-3">
            <div className="flex items-center justify-between text-white/90 mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-medium">Top connectors</span>
              </div>
              <span className="text-[10px] text-white/50">
                press “L” to hide
              </span>
            </div>
            <ol className="space-y-1 text-white/85 text-sm">
              {Object.entries(degree)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([id, d], i) => (
                  <li key={id} className="flex items-center justify-between">
                    <span className="truncate flex items-center">
                      {i < 3 && <MedalBadge rank={i} />}
                      {i + 1}. {firstName(nodesByIdRef.current[id]?.name, id)}
                    </span>
                    <span className="text-white/60">{d}</span>
                  </li>
                ))}
              {Object.keys(degree).length === 0 && (
                <li className="text-white/60">—</li>
              )}
            </ol>
          </div>
        </aside>
      )}

      {/* Spotlight banner */}
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

      {/* Achievement toasts */}
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

      {/* Graph */}
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
          // Heatmap + Trails: draw PRE layer
          onRenderFramePre={(
            ctx: CanvasRenderingContext2D,
            globalScale: number,
          ) => {
            try {
              // trails (faint dashed, fade by age)
              const arr: any[] = (graphDataRef.current.nodes as any[]) || [];
              const nodeIndex: Record<string, any> = {};
              for (const n of arr) nodeIndex[n.id] = n;

              const now = Date.now();
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

                const k = 1 - age / TRAIL_WINDOW_MS; // 1 -> 0
                const alpha = 0.25 * k;
                ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
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
                const now2 = Date.now();

                for (const n of arr) {
                  if (!isFiniteNum(n.x) || !isFiniteNum(n.y)) continue;

                  // activity weight from lastSeen and recent links window
                  const ago = lastSeen.current[n.id]
                    ? now2 - lastSeen.current[n.id]
                    : Infinity;
                  if (ago > HEATMAP_WINDOW_MS) continue;

                  const heatK = 1 - ago / HEATMAP_WINDOW_MS; // 1 -> 0
                  const deg = Number.isFinite((degree as any)[n.id])
                    ? degree[n.id]
                    : 1;
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
            setFocusedId(n.id);
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
            setDraggingId(n.id);
            setDragMode(true);

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

            setDraggingId(null);
            setDragMode(false);
          }}
          onBackgroundClick={() => {
            setFocusedId(null);
            const g = fgRef.current as any;
            g?.zoomToFit?.(800, 80);
          }}
          // Custom link draw: reveal + pulse
          linkCanvasObjectMode={() => "replace"}
          linkCanvasObject={(link: any, ctx, globalScale) => {
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
            const baseColor = recent
              ? "rgba(255,255,255,0.65)"
              : "rgba(255,255,255,0.22)";

            const born = link.__born as number | undefined;
            const age = born ? Date.now() - born : Infinity;
            const revealK = born
              ? Math.min(1, Math.max(0, age / LINK_REVEAL_MS))
              : 1;

            // interpolate endpoint during reveal
            const ix = s.x + (t.x - s.x) * revealK;
            const iy = s.y + (t.y - s.y) * revealK;

            // line
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(ix, iy);
            ctx.strokeStyle = baseColor;
            const hovered = !!hoverId;
            if (hovered) {
              const nh =
                neighborsRef.current.get(hoverId!) || new Set<string>();
              const on =
                s.id === hoverId ||
                t.id === hoverId ||
                nh.has(s.id) ||
                nh.has(t.id);
              ctx.lineWidth = (on ? 1.6 : 0.4) * VIS;
            } else {
              ctx.lineWidth = (recent ? 1.2 : 0.6) * VIS;
            }
            ctx.stroke();

            // traveling pulse dot during reveal
            if (revealK < 1) {
              ctx.beginPath();
              ctx.arc(ix, iy, 2.2 * VIS, 0, 2 * Math.PI);
              ctx.fillStyle = "rgba(255,255,255,0.85)";
              ctx.fill();
            }
            ctx.restore();
          }}
          // sustom (amongus) node draw: pop-in + bloom + halos + crowns + im crashing out
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            if (!isFiniteNum(node.x) || !isFiniteNum(node.y)) return;

            const id = node.id as string;
            const deg = Number.isFinite((degree as any)[id]) ? degree[id] : 1;

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

            const base = idToColor(id);

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
              grad.addColorStop(0, base.replace("68%)", "80%)"));
              grad.addColorStop(1, "rgba(255,255,255,0)");
              ctx.save();
              ctx.globalAlpha = 0.35 * k;
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

            // core
            ctx.save();
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
            ctx.shadowColor = base;
            const glow = 12 + Math.min(18, Math.sqrt(Math.max(1, deg)) * 1.4);
            ctx.shadowBlur = glow * VIS * (0.8 + 0.2 * k);
            ctx.globalAlpha = 0.85;
            ctx.fillStyle = base;
            ctx.fill();
            ctx.restore();

            // crown/badge for tryhards ===
            if (rankMap[id] !== undefined) {
              const rank = rankMap[id];
              const color = CROWN_COLORS[rank];
              ctx.save();
              ctx.shadowColor = color;
              ctx.shadowBlur = CROWN_GLOW;
              ctx.strokeStyle = color;
              ctx.lineWidth = 2.4 * VIS;
              ctx.beginPath();
              ctx.arc(node.x, node.y, r + 5 * VIS, 0, 2 * Math.PI);
              ctx.stroke();
              ctx.restore();
            }

            // label
            const show =
              globalScale > LABEL_ZOOM_THRESHOLD ||
              hoverId === id ||
              focusedId === id;
            if (show) {
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
          nodePointerAreaPaint={(node: any, color, ctx) => {
            const id = node.id as string;
            const r = (4 + Math.min(7, Math.sqrt(degree[id] || 1) * 1.4)) * VIS;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, r + 2 * VIS, 0, 2 * Math.PI);
            ctx.fill();
          }}
        />
      </div>

      {/* Footer: single-track ticker */}
      {showTicker && (
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-bt-blue-500 border-t border-white/10 px-4 sm:px-6 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full">
              {ticker.length === 0 ? (
                <div className="text-white/60 text-sm py-1">
                  Tip: connections appear in real-time. Use your NFC BizCards to
                  light up the wall. Press H to toggle heatmap.
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

      {/* Animations / Styles */}
      <style jsx>{`
        /* Ticker */
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
      `}</style>
    </div>
  );
}
