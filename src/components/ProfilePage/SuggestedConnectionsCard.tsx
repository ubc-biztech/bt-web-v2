// components/ProfilePage/SuggestedConnectionsCard.tsx
import Link from "next/link";
import { Suggested } from "../../lib/recs";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

export default function SuggestedConnectionsCard({
  items,
}: {
  items: Suggested[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((p) => {
        const initials =
          `${p.fname?.[0] ?? ""}${p.lname?.[0] ?? ""}`.toUpperCase();
        return (
          <div
            key={p.profileID}
            className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-bt-blue-100 flex items-center justify-center text-bt-blue-500 font-semibold">
                {initials || "?"}
              </div>
              <div className="min-w-0">
                <div className="text-white font-medium truncate">
                  {p.fname} {p.lname}
                </div>
                <div className="text-xs text-bt-blue-0 truncate">
                  {[p.major, p.faculty, p.year].filter(Boolean).join(" • ") ||
                    "—"}
                </div>
              </div>
              <span className="ml-auto text-xs px-2 py-1 rounded-full bg-white/10 text-white shrink-0">
                {p.score}
              </span>
            </div>

            <div className="text-sm text-white/80 line-clamp-2">{p.reason}</div>

            <div className="pt-1">
              <Link href={`/profile/${p.profileID}`} className="inline-flex">
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  View Profile <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
