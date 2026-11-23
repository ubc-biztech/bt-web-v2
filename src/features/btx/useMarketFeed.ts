import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import type { Market, PricePoint } from "./seedApi";

const socketUrl = process.env.NEXT_PUBLIC_BTX_WS_URL;
const snapshotKey = ["btx", "snapshot"];

type Connection = "online" | "reconnecting" | "offline" | "balance-error";
type Prices = Record<string, PricePoint>;

export function useMarketFeed(userId: string, eventId?: string) {
  const client = useQueryClient();
  const retry = useRef<() => void>(() => {});
  const [connection, setConnection] = useState<Connection>("online");
  const [quoteVersion, setQuoteVersion] = useState(0);
  const [backOnline, setBackOnline] = useState(false);
  const [prices, setPrices] = useState<Prices>({});

  useEffect(() => {
    if (!eventId) return;
    let socket: WebSocket | undefined;
    let retryTimer: number | undefined;
    let connectTimer: number | undefined;
    let toastTimer: number | undefined;
    let interrupted = false;
    let failures = 0;
    let stopped = false;
    let recoveryId = 0;
    const received: Prices = {};

    function disconnect() {
      retry.current = connect;
      recoveryId++;
      window.clearTimeout(retryTimer);
      window.clearTimeout(connectTimer);
      const previous = socket;
      socket = undefined;
      previous?.close();
    }

    function markInterrupted(status: Connection) {
      if (!interrupted) setQuoteVersion((version) => version + 1);
      interrupted = true;
      setBackOnline(false);
      setConnection(status);
    }

    function refreshSnapshot() {
      return client.refetchQueries(
        { queryKey: snapshotKey, type: "active" },
        { throwOnError: true, cancelRefetch: false },
      );
    }

    async function recover() {
      const id = ++recoveryId;
      try {
        await refreshSnapshot();
        if (stopped || id !== recoveryId || !navigator.onLine) return;

        await Promise.all([
          client.invalidateQueries({ queryKey: ["btx", "prices"] }),
          client.invalidateQueries({
            predicate: ({ queryKey }) =>
              queryKey[0] === "btx-seed" &&
              queryKey[1] === eventId &&
              (queryKey[3] === "order" || queryKey[3] === "history"),
          }),
        ]);
        if (stopped || id !== recoveryId || !navigator.onLine) return;

        try {
          await client.invalidateQueries(
            {
              queryKey: ["btx-seed", eventId, userId, "portfolio"],
              exact: true,
            },
            { throwOnError: true },
          );
        } catch {
          if (stopped || id !== recoveryId) return;
          markInterrupted("balance-error");
          retry.current = recover;
          return;
        }
        if (stopped || id !== recoveryId || !navigator.onLine) return;
        retry.current = connect;
        failures = 0;
        setConnection("online");
        if (interrupted) {
          interrupted = false;
          setBackOnline(true);
          window.clearTimeout(toastTimer);
          toastTimer = window.setTimeout(() => setBackOnline(false), 4000);
        }
      } catch {
        if (stopped || id !== recoveryId) return;
        disconnect();
        scheduleRetry();
      }
    }

    function scheduleRetry() {
      failures++;
      markInterrupted(
        navigator.onLine && failures < 3 ? "reconnecting" : "offline",
      );
      if (navigator.onLine) {
        retryTimer = window.setTimeout(
          connect,
          Math.min(1000 * 2 ** (failures - 1), 15000),
        );
      }
    }

    function connect() {
      disconnect();
      if (!navigator.onLine) {
        markInterrupted("offline");
        return;
      }
      if (!socketUrl) {
        if (interrupted) void recover();
        return;
      }

      try {
        const current = new WebSocket(socketUrl);
        socket = current;
        const failed = () => {
          if (socket !== current) return;
          disconnect();
          scheduleRetry();
        };
        connectTimer = window.setTimeout(failed, 8000);
        current.onopen = () => {
          if (socket !== current) return;
          window.clearTimeout(connectTimer);
          void recover();
        };
        current.onclose = failed;
        current.onerror = failed;
        current.onmessage = ({ data }) => {
          if (socket !== current || typeof data !== "string") return;
          try {
            const message = JSON.parse(data);
            const update = message?.data;
            if (
              message?.type !== "MARKET_UPDATE" ||
              update?.eventId !== eventId
            )
              return;
            const { projectId, priceCents, asOf } = update;
            if (
              typeof projectId !== "string" ||
              !Number.isSafeInteger(priceCents) ||
              priceCents <= 0 ||
              !Number.isSafeInteger(asOf) ||
              asOf <= 0
            ) {
              if (update.phase === "LIVE" || update.seedStatus)
                void refreshSnapshot().catch(() => {});
              return;
            }

            const market = client.getQueryData<Market>(snapshotKey);
            const project = market?.projects.find(
              (row) => row.projectId === projectId,
            );
            if (!project || market?.phase !== "LIVE") {
              void refreshSnapshot().catch(() => {});
              return;
            }
            if (
              asOf <=
              Math.max(project.lastPriceTs ?? 0, received[projectId]?.ts ?? 0)
            )
              return;
            const point = { ts: asOf, priceCents };
            received[projectId] = point;
            setPrices((previous) => ({ ...previous, [projectId]: point }));
            client.setQueriesData<PricePoint[]>(
              { queryKey: ["btx", "prices", projectId], type: "active" },
              (points) =>
                points?.some(({ ts }) => ts === asOf)
                  ? points
                  : [...(points ?? []), point],
            );
          } catch {
            // Ignore malformed messages.
          }
        };
      } catch {
        scheduleRetry();
      }
    }

    function offline() {
      disconnect();
      markInterrupted("offline");
    }

    retry.current = connect;
    window.addEventListener("online", connect);
    window.addEventListener("offline", offline);
    connect();
    return () => {
      stopped = true;
      disconnect();
      window.clearTimeout(toastTimer);
      window.removeEventListener("online", connect);
      window.removeEventListener("offline", offline);
    };
  }, [client, eventId, userId]);

  return {
    connection,
    quoteVersion: connection === "online" ? quoteVersion : null,
    retry: () => retry.current(),
    backOnline,
    prices,
  };
}

export function applyLivePrices(market: Market, prices: Prices): Market {
  if (market.phase !== "LIVE" || !Object.keys(prices).length) return market;
  let changed = false;
  const projects = market.projects.map((project) => {
    const point = prices[project.projectId];
    if (!point || point.ts <= (project.lastPriceTs ?? 0)) return project;
    changed = true;
    return {
      ...project,
      lastPriceTs: point.ts,
      currentPriceCents: point.priceCents,
    };
  });
  return changed ? { ...market, projects } : market;
}
