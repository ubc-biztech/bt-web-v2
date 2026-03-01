"use client";

import { useEffect, useState } from "react";
import { fetchBackend } from "@/lib/db";
import { GenericCard } from "../Common/Cards";
import SuggestedConnectionsCard from "./SuggestedConnectionsCard";
import type { Suggested } from "@/lib/recs"; // ← use the shared type

export default function SuggestedConnectionsSection() {
  const [items, setItems] = useState<Suggested[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSuggestions() {
      setLoading(true);
      setErr(null);

      let attempt = 0;
      while (!cancelled && attempt < 6) {
        // ~1s,2s,4s,5s,5s,5s = ~22s worst-case
        try {
          const res = await fetchBackend({
            endpoint: `/profiles/recommendations/self`,
            method: "GET",
            authenticatedCall: true,
          });

          if (cancelled) return;
          const raw: any[] = res?.results ?? [];
          setItems(raw.map((r) => ({ ...r, email: r.email ?? "" })));
          setLoading(false);
          return; // done
        } catch (e: any) {
          const msg = e?.message?.toLowerCase?.() || "";
          const status = e?.status || e?.statusCode;

          // treat 504 / timeout as transient and keep waiting
          const transient = status === 504 || msg.includes("timeout");
          if (!transient) {
            if (!cancelled) {
              setErr(e?.message ?? "Failed to load suggestions");
              setLoading(false);
            }
            return;
          }

          // backoff
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          await new Promise((r) => setTimeout(r, delay));
          attempt++;
        }
      }

      if (!cancelled) {
        setErr("Still cooking—try again in a moment.");
        setLoading(false);
      }
    }

    fetchSuggestions();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <GenericCard title="Suggested Connections" className="w-full">
      {loading ? (
        <SkeletonGrid />
      ) : items && items.length > 0 ? (
        <SuggestedConnectionsCard items={items} />
      ) : (
        <EmptyState error={err} />
      )}
    </GenericCard>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {["skeleton-1", "skeleton-2", "skeleton-3"].map((key) => (
        <div
          key={key}
          className="rounded-xl border border-white/10 bg-white/5 p-4 animate-pulse"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-white/10" />
            <div className="flex-1">
              <div className="h-3 bg-white/10 rounded w-2/3 mb-2" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
            </div>
            <div className="h-5 w-10 bg-white/10 rounded-full" />
          </div>
          <div className="h-3 bg-white/10 rounded mb-2" />
          <div className="h-3 bg-white/10 rounded w-5/6" />
          <div className="mt-3 h-8 w-28 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ error }: { error: string | null }) {
  return (
    <div className="text-sm text-bt-blue-0">
      {error ? "Couldn’t load suggestions right now." : "No suggestions yet."}
    </div>
  );
}
