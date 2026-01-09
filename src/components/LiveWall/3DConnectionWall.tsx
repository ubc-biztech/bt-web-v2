"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { WS_URL, EVENT_ID } from "@/lib/dbconfig";
import { fetchBackend } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { RefreshCw, Zap, Trophy, Radio } from "lucide-react";
// @ts-ignore
import { forceManyBody, forceCollide } from "d3-force-3d";
import * as THREE from "three";
import SpriteText from "three-spritetext";
import type { ForceGraphMethods } from "react-force-graph-3d";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

// Tunables
const VIS = 0.52;
const SNAPSHOT_WINDOW_SEC = 86_400;
const RECENT_EDGE_WINDOW_MS = 5 * 60_000;
const TICKER_MAX = 24;

// physics
const CHARGE_BASE = -2100;
const CHARGE_PER_DEG = -85;
const CHARGE_DIST_MAX = 9000;
const COLLIDE_BASE = 18 * VIS;
const COLLIDE_PER_DEG = 4 * VIS;

const SPOTLIGHT_MS = 6000;
const HALO_RECENT_MS = 18_000;
const AUTOPAN_ENABLED_DEFAULT = true;
const AUTOPAN_INTERVAL_MS = 12_000;
const AUTOPAN_DIST = 320;
const DEDUPE_GRACE_MS = 4000;

// spawns
const INTRO_MS = 900;
const LINK_REVEAL_MS = 650;

// streaks
const STREAK_WINDOW_MS = 2 * 60_000;
const STREAK_THRESHOLD = 3;

// crowns
const CROWN_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];
const CROWN_RING_WIDTH = 1.2;

// heatmap
const HEATMAP_WINDOW_MS = 4 * 60_000;
const HEATMAP_ENABLED_DEFAULT = true;
const HEATMAP_INTENSITY = 0.12;
const HEATMAP_RADIUS_BASE = 18;
const HEATMAP_RADIUS_PER_DEG = 6;

// trails
const TRAIL_WINDOW_MS = 80_000;
const TRAIL_MAX = 180;

type WallNode = {
  id: string;
  name: string;
  avatar?: string;
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  __born?: number;
};
type WallLink = { source: string; target: string; createdAt: number };
type WallLinkLive = WallLink & { __born?: number };
type SnapshotResponse = { nodes: WallNode[]; links: WallLink[] };
type Spotlight = { id: string; from: string; to: string; t: number };
type Trail = { s: string; t: string; createdAt: number };

const isFiniteNum = (v: any) => typeof v === "number" && Number.isFinite(v);
const asString = (v: any, fb: string) =>
  typeof v === "string" ? v : (v?.S ?? v?.value ?? fb);
const normalizeNode = (n: any): WallNode => ({
  id: asString(n.id, String(n.id)),
  name: asString(n.name, String(n.id)),
  avatar: n.avatar ? asString(n.avatar, "") : undefined,
});
const firstName = (raw: string | undefined, fb: string) => {
  const name = (raw ?? "").trim();
  if (!name) return fb;
  const cleaned = name.includes(",")
    ? name.split(",")[1]?.trim() || name
    : name;
  return cleaned.split(/\s+/)[0] || fb;
};
const endId = (e: any) => (e && typeof e === "object" ? e.id : String(e));
const idToColor = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return `hsl(${hue} 70% 66%)`;
};
const easeOutBack = (t: number, s = 1.10158) =>
  1 + s * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);

export default function ConnectionWall3D() {
  const fgRef = useRef<ForceGraphMethods>();
  const pairRecentlySeen = useRef<Map<string, number>>(new Map());

  // data
  const [nodes, setNodes] = useState<Record<string, WallNode>>({});
  const [links, setLinks] = useState<WallLinkLive[]>([]);

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

  const lastSeen = useRef<Record<string, number>>({});
  const streakMap = useRef<Record<string, number[]>>({});

  const [trails, setTrails] = useState<Trail[]>([]);
  const [heatmapEnabled, setHeatmapEnabled] = useState(HEATMAP_ENABLED_DEFAULT);

  const tickerContainerRef = useRef<HTMLDivElement | null>(null);
  const tickerTrackRef = useRef<HTMLDivElement | null>(null);
  const [tickerDurSec, setTickerDurSec] = useState(16);
  const [tickerStartPx, setTickerStartPx] = useState(0);
  const [tickerContentPx, setTickerContentPx] = useState(0);

  // derived
  const graphData = useMemo(
    () => ({ nodes: Object.values(nodes), links }),
    [nodes, links],
  );

  const degree = useMemo(() => {
    const d: Record<string, number> = {};
    for (const l of links) {
      const s = endId((l as any).source);
      const t = endId((l as any).target);
      d[s] = (d[s] || 0) + 1;
      d[t] = (d[t] || 0) + 1;
    }
    return d;
  }, [links]);

  const degreeRef = useRef<Record<string, number>>({});
  useEffect(() => {
    degreeRef.current = degree;
  }, [degree]);

  const topRanks = useMemo(
    () =>
      Object.entries(degree)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id], i) => ({ id, rank: i })),
    [degree],
  );

  const rankMap = useMemo(() => {
    const m: Record<string, number> = {};
    topRanks.forEach(({ id, rank }) => (m[id] = rank));
    return m;
  }, [topRanks]);

  const neighbors = useMemo(() => {
    const map = new Map<string, Set<string>>();
    const get = (id: string) =>
      map.get(id) ?? (map.set(id, new Set()), map.get(id)!);
    for (const l of links) {
      const s = endId((l as any).source);
      const t = endId((l as any).target);
      get(s).add(t);
      get(t).add(s);
    }
    return map;
  }, [links]);

  // helpers

  const getGraphNode = (id: string): any | null => {
    const g = fgRef.current as any;
    const arr: any[] | undefined = g?.graphData?.()?.nodes;
    if (!arr) return null;
    return arr.find((n) => n.id === id) || null;
  };

  const alphaKick = (durationMs = 900, peak = 0.22) => {
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
        } else g.d3AlphaTarget(peak * (1 - t));
      }, 120);
    } catch {}
  };

  const spawnNodeNear = (nn: WallNode, nearId?: string): WallNode => {
    const born = Date.now();
    if (!nearId) return { ...nn, __born: born };
    const anchor = getGraphNode(nearId);
    if (anchor && [anchor.x, anchor.y, anchor.z].every(isFiniteNum)) {
      const jitter = 10 * VIS;
      const dx = (Math.random() - 0.5) * jitter;
      const dy = (Math.random() - 0.5) * jitter;
      const dz = (Math.random() - 0.5) * jitter;
      return {
        ...nn,
        x: anchor.x,
        y: anchor.y,
        z: anchor.z,
        vx: dx * 0.02,
        vy: dy * 0.02,
        vz: dz * 0.02,
        __born: born,
      };
    }
    return { ...nn, __born: born };
  };

  const upsertNode = (n: WallNode | any, spawnNearId?: string) => {
    const base = normalizeNode(n);
    setNodes((prev) => {
      if (prev[base.id]) return prev;
      return { ...prev, [base.id]: spawnNodeNear(base, spawnNearId) };
    });
  };

  const linkKey = (l: WallLink | any) =>
    `${endId(l.source)}|${endId(l.target)}|${l.createdAt}`;
  const addLink = (l: WallLink, bornTs?: number) =>
    setLinks((prev) => {
      const kset = new Set(prev.map(linkKey));
      if (kset.has(linkKey(l))) return prev;
      return [...prev, { ...l, __born: bornTs ?? Date.now() }];
    });

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
              text: `${firstName(nodes[id]?.name, id)} is on a streak!`,
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
      setNodes((prev) => {
        const merged = { ...prev };
        res.nodes.forEach((raw) => {
          const n = normalizeNode(raw);
          if (!merged[n.id]) merged[n.id] = n;
        });
        return merged;
      });
      setLinks((prev) => {
        const have = new Set(prev.map(linkKey));
        const out = [...prev];
        for (const l of res.links)
          if (!have.has(linkKey(l))) out.push({ ...l, __born: 0 });
        return out;
      });
      setTotalToday(res.links.length);
      setLastError(null);
    } catch {
      setLastError("Snapshot fetch failed");
    }
  };

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

  // websocket
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
              eventId: EVENT_ID,
            }),
          );
        };
        ws.onmessage = (ev) => {
          if (cancelled) return;
          try {
            const msg = JSON.parse(ev.data);
            if (msg.type === "snapshot") {
              const { nodes: ns, links: ls } = msg as SnapshotResponse;
              setNodes((prev) => {
                const merged = { ...prev };
                ns.forEach((raw) => {
                  const n = normalizeNode(raw);
                  if (!merged[n.id]) merged[n.id] = n;
                });
                return merged;
              });
              setLinks((prev) => {
                const have = new Set(prev.map(linkKey));
                const out = [...prev];
                for (const l of ls)
                  if (!have.has(linkKey(l))) out.push({ ...l, __born: 0 });
                return out;
              });
              return;
            }
            if (msg.type === "connection" || msg.type === "edge") {
              const { from, to, createdAt } = msg;
              if (from?.id) upsertNode(from, to?.id);
              if (to?.id) upsertNode(to, from?.id);
              if (from?.id && to?.id) {
                const ts = createdAt || Date.now();
                const key = [from.id, to.id].sort().join("|");
                const last = pairRecentlySeen.current.get(key) || 0;
                if (ts - last < DEDUPE_GRACE_MS) return;
                pairRecentlySeen.current.set(key, ts);
                addLink(
                  {
                    source: from.id,
                    target: to.id,
                    createdAt: ts,
                  },
                  ts,
                );
                setTrails((prev) =>
                  [...prev, { s: from.id, t: to.id, createdAt: ts }].slice(
                    Math.max(0, prev.length - (TRAIL_MAX - 1)),
                  ),
                );
                pushTicker(from, to, ts);
                alphaKick();
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

  useEffect(() => {
    fetchSnapshot();
    const t = setInterval(fetchSnapshot, 60_000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setTrails((prev) =>
        prev.filter((tr) => now - tr.createdAt <= TRAIL_WINDOW_MS),
      );
    }, 2000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const g = fgRef.current as any;
    if (!g) return;

    // d3 forces
    const charge = (g.d3Force && g.d3Force("charge")) || forceManyBody();
    charge
      .strength(
        (n: any) =>
          CHARGE_BASE + (degreeRef.current[n.id] || 0) * CHARGE_PER_DEG,
      )
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

    // scene beautify — only if accessors exist
    const sceneFn = typeof g.scene === "function" ? g.scene : undefined;
    const rendererFn =
      typeof g.renderer === "function" ? g.renderer : undefined;
    const cameraFn = typeof g.camera === "function" ? g.camera : undefined;
    const controlsFn =
      typeof g.controls === "function" ? g.controls : undefined;

    if (sceneFn && !(sceneFn() as any).__styled) {
      const scene: THREE.Scene = sceneFn();
      scene.background = new THREE.Color("#0b1020");
      (scene as any).fog = new THREE.FogExp2(0x0b1020, 0.002);
      const hemi = new THREE.HemisphereLight(0xffffff, 0x0b1020, 0.6);
      const dir = new THREE.DirectionalLight(0xffffff, 0.5);
      dir.position.set(200, 300, 200);
      const amb = new THREE.AmbientLight(0xffffff, 0.25);
      scene.add(hemi);
      scene.add(dir);
      scene.add(amb);
      (scene as any).__styled = true;
    }
    if (rendererFn) {
      const renderer: THREE.WebGLRenderer = rendererFn();
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1.5));
    }
    if (cameraFn) {
      const cam: THREE.PerspectiveCamera = cameraFn();
      cam.fov = 55;
      cam.near = 0.1;
      cam.far = 6000;
      cam.updateProjectionMatrix();
    }
    if (controlsFn) {
      const ctrls: any = controlsFn();
      if (ctrls) {
        ctrls.enableDamping = true;
        ctrls.dampingFactor = 0.08;
        ctrls.minDistance = 140;
        ctrls.maxDistance = 1200;
        ctrls.rotateSpeed = 0.5;
      }
    }

    try {
      g.d3AlphaTarget?.(0.15);
      g.d3ReheatSimulation?.();
      setTimeout(() => g.d3AlphaTarget?.(0), 800);
    } catch {}
  }, []);

  useEffect(() => {
    if (!autoPan) return;
    const id = setInterval(() => {
      const g: any = fgRef.current;
      if (!g) return;
      const recent = ticker.slice(-5);
      const pick =
        recent[Math.floor(Math.random() * Math.max(1, recent.length))];
      const targetName = pick?.to || pick?.from;
      const targetId = Object.values(nodes).find(
        (n) => firstName(n.name, n.id) === targetName,
      )?.id;
      if (!targetId) {
        try {
          g.zoomToFit?.(800, 80);
        } catch {}
        return;
      }
      const n = g.graphData().nodes.find((x: any) => x.id === targetId);
      if (!n || n.x == null) return;

      const dist = AUTOPAN_DIST;
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI * 0.35 + Math.PI * 0.25;
      const pos = new THREE.Vector3(
        n.x + dist * Math.sin(theta) * Math.cos(phi),
        n.y + dist * Math.cos(theta),
        n.z + dist * Math.sin(theta) * Math.sin(phi),
      );
      try {
        g.cameraPosition?.(pos, n, 1100);
        setTimeout(
          () => g.zoomToFit?.(800, 60),
          Math.max(2600, AUTOPAN_INTERVAL_MS - 2200),
        );
      } catch {}
    }, AUTOPAN_INTERVAL_MS);
    return () => clearInterval(id);
  }, [autoPan, ticker, nodes]);

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

  const isRecent = (t: number) => Date.now() - t <= RECENT_EDGE_WINDOW_MS;

  const buildNodeObject = (node: any) => {
    const id = node.id as string;
    const deg = Number.isFinite((degree as any)[id]) ? degree[id] : 1;

    const born = node.__born as number | undefined;
    const age = born ? Date.now() - born : Infinity;
    const introT = born != null ? Math.min(1, Math.max(0, age / INTRO_MS)) : 1;
    const k = easeOutBack(introT);

    const baseR = (3 + Math.min(7, Math.sqrt(Math.max(1, deg)) * 1.4)) * VIS;
    const r = baseR * (0.5 + 0.6 * k);

    const color = new THREE.Color(idToColor(id));

    // core
    const mat = new THREE.MeshPhongMaterial({
      color,
      emissive: color.clone().multiplyScalar(0.18),
      shininess: 28,
      transparent: true,
      opacity: 0.0,
    });
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(Math.max(0.0001, r), 20, 20),
      mat,
    );

    // halo
    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        color,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    halo.scale.set(r * 6, r * 6, 1);

    const group = new THREE.Group();
    group.add(halo);
    group.add(sphere);

    // recent ring
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(r + 1.2, r + 1.2 + 0.8, 48),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      }),
    );
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
    (group as any).__ring = ring;
    (group as any).__r = r;

    // crown
    if (rankMap[id] !== undefined) {
      const crownColor = new THREE.Color(CROWN_COLORS[rankMap[id]]);
      const crown = new THREE.Mesh(
        new THREE.RingGeometry(r + 4.5, r + 4.5 + CROWN_RING_WIDTH, 64),
        new THREE.MeshBasicMaterial({
          color: crownColor,
          transparent: true,
          opacity: 0.9,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
        }),
      );
      crown.rotation.x = Math.PI / 2;

      group.add(crown);
    }

    // label
    const label = new SpriteText(firstName(node.name, id), 10, "#ffffff");
    label.fontFace = "Inter, system-ui, Segoe UI, Roboto, sans-serif";
    label.material.depthTest = false;
    label.material.transparent = true;
    label.position.set(r + 6, 0, 0);
    label.center.set(0, 0.5);
    group.add(label);
    (group as any).__label = label;

    return group;
  };

  const handleRenderFrame = () => {
    const g: any = fgRef.current;
    if (!g) return;

    if (heatmapEnabled && typeof g.scene === "function") {
      const scene: THREE.Scene = g.scene();
      const now = Date.now();
      const arr: any[] | undefined = g?.graphData?.()?.nodes;
      if (arr) {
        let pool: THREE.Sprite[] = (scene as any).__heatPool || [];
        let idx = 0;
        for (const n of arr) {
          if (![n.x, n.y, n.z].every(isFiniteNum)) continue;
          const ago = lastSeen.current[n.id]
            ? now - lastSeen.current[n.id]
            : Infinity;
          if (ago > HEATMAP_WINDOW_MS) continue;
          const k = 1 - ago / HEATMAP_WINDOW_MS;
          const deg = Number.isFinite((degree as any)[n.id]) ? degree[n.id] : 1;
          const size =
            HEATMAP_RADIUS_BASE +
            Math.sqrt(Math.max(1, deg)) * HEATMAP_RADIUS_PER_DEG;

          let spr: THREE.Sprite;
          if (idx < pool.length) spr = pool[idx++];
          else {
            spr = new THREE.Sprite(
              new THREE.SpriteMaterial({
                color: 0xffffff,
                opacity: 0,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
              }),
            );
            pool.push(spr);
            scene.add(spr);
          }
          spr.position.set(n.x, n.y, n.z);
          spr.scale.set(size, size, 1);
          (spr.material as THREE.SpriteMaterial).opacity =
            HEATMAP_INTENSITY * k;
        }
        for (let i = idx; i < pool.length; i++)
          (pool[i].material as THREE.SpriteMaterial).opacity = 0;
        (scene as any).__heatPool = pool;
      }
    }

    // ring + label updates
    const arr: any[] | undefined = g?.graphData?.()?.nodes;
    if (arr && typeof g.camera === "function") {
      const cam: THREE.PerspectiveCamera = g.camera();
      for (const n of arr) {
        const obj = g.getObject3D?.(n);
        if (!obj) continue;
        const ring: THREE.Mesh = (obj as any).__ring;
        const label: SpriteText = (obj as any).__label;

        const ts = lastSeen.current[n.id];
        const ago = ts ? Date.now() - ts : Infinity;
        if (ring) {
          if (ago < HALO_RECENT_MS) {
            const prog = 1 - ago / HALO_RECENT_MS;
            (ring.material as THREE.MeshBasicMaterial).opacity = 0.18 * prog;
            ring.scale.setScalar(1 + 0.2 * prog);
          } else (ring.material as THREE.MeshBasicMaterial).opacity = 0;
        }
        if (label && cam) {
          const d = cam.position.distanceTo(obj.position);
          let vis = d < 420 ? 1 : d < 720 ? (720 - d) / 300 : 0;
          if (hoverId === n.id || focusedId === n.id) vis = Math.max(vis, 1);
          (label.material as THREE.SpriteMaterial).opacity = vis;
        }
      }
    }

    // trails (only if scene() exists)
    if (typeof g.scene === "function") {
      const scene: THREE.Scene = g.scene();
      let group: THREE.Group = (scene as any).__trailsGroup;
      if (!group) {
        group = new THREE.Group();
        (scene as any).__trailsGroup = group;
        scene.add(group);
      }
      group.children = [];

      const arr2: any[] | undefined = g?.graphData?.()?.nodes;
      if (!arr2) return;
      const nodeIndex: Record<string, any> = {};
      for (const n of arr2) nodeIndex[n.id] = n;

      const now = Date.now();
      for (const tr of trails) {
        const s = nodeIndex[tr.s];
        const t = nodeIndex[tr.t];
        if (!s || !t) continue;
        if (![s.x, s.y, s.z, t.x, t.y, t.z].every(isFiniteNum)) continue;
        const age = now - tr.createdAt;
        if (age > TRAIL_WINDOW_MS) continue;
        const k = 1 - age / TRAIL_WINDOW_MS;
        const geom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(s.x, s.y, s.z),
          new THREE.Vector3(t.x, t.y, t.z),
        ]);
        const mat = new THREE.LineDashedMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.22 * k,
          dashSize: 3,
          gapSize: 5,
          depthWrite: false,
        });
        const line = new THREE.Line(geom, mat);
        (line as any).computeLineDistances?.();
        group.add(line);
      }
    }
  };

  return (
    <div
      className={`min-h-[70vh] rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden relative ${kiosk ? "cursor-none" : ""}`}
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
                    <span className="truncate">
                      {i + 1}. {firstName(nodes[id]?.name, id)}
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
            className="px-4 py-2 rounded-full bg-emerald-400/15 border border-emerald-300/30 text-emerald-100 text-lg font-semibold shadow-lg animate-[fadeSlide_6s_ease-out_forwards]"
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

      <div className="h-[60vh] sm:h-[70vh]">
        <ForceGraph3D
          ref={fgRef as any}
          graphData={graphData}
          backgroundColor="#0b1020"
          nodeRelSize={9 * VIS}
          warmupTicks={200}
          cooldownTicks={400}
          d3AlphaDecay={0.01}
          d3VelocityDecay={0.25}
          // links
          linkWidth={(l: any) => (isRecent(l.createdAt || 0) ? 1.1 : 0.35)}
          linkOpacity={0.5}
          linkColor={(l: any) =>
            isRecent(l.createdAt || 0)
              ? "rgba(255,255,255,0.9)"
              : "rgba(255,255,255,0.35)"
          }
          linkDirectionalParticles={(l: any) =>
            isRecent(l.createdAt || 0) ? 1 : 0
          }
          linkDirectionalParticleWidth={1.4}
          linkDirectionalParticleSpeed={0.0035}
          linkCurvature={0}
          // nodes
          nodeThreeObject={buildNodeObject}
          nodeThreeObjectExtend={true}
          // events
          onNodeHover={(n: any) => setHoverId(n ? n.id : null)}
          onNodeClick={(n: any) => {
            setFocusedId(n.id);
            const g: any = fgRef.current;
            if (!g) return;
            const dist = AUTOPAN_DIST;
            const pos = new THREE.Vector3(
              n.x + dist * 0.45,
              n.y + dist * 0.38,
              n.z + dist * 0.45,
            );
            g.cameraPosition?.(pos, n, 800);
          }}
          onBackgroundClick={() => {
            setFocusedId(null);
            const g: any = fgRef.current;
            try {
              g.zoomToFit?.(800, 80);
            } catch {}
          }}
          onEngineStop={() => {
            const g: any = fgRef.current;
            if (!g || zoomFitDone.current) return;
            try {
              g.zoomToFit?.(800, 120);
              zoomFitDone.current = true;
            } catch {}
          }}
        />
      </div>

      {/* Footer ticker */}
      {showTicker && (
        <div className="px-4 sm:px-6 py-2 border-t border-white/10">
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
          </div>
        </div>
      )}

      {/* Styles */}
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
              calc(-1 * (var(--ticker-start, 100%)+var(--ticker-width, 0px)))
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
