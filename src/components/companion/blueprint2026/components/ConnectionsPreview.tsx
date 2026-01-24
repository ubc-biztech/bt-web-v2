import BluePrintCard from "./BluePrintCard";
import BluePrintButton from "./BluePrintButton";
import { Connection } from "@/pages/connections";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function ConnectionsPreview({
  connections,
}: {
  connections: Connection[] | undefined;
}) {
  const recentConnections = connections
    ? [...connections].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3)
    : [];

  return (
    <BluePrintCard>
      <div className="flex flex-row items-center justify-between">
        <div className="text-md font-medium">Your Connections</div>
        <Link href="/events/blueprint/2026/companion/connections">
          <BluePrintButton className="text-xs px-3 py-2">
            VIEW ALL
          </BluePrintButton>
        </Link>
      </div>
      <div className="h-[0.5px] mt-2 w-full bg-gradient-to-r from-transparent via-white to-transparent" />

      {recentConnections.length === 0 ? (
        <div className="my-4 text-center text-sm text-white/70 rounded-lg bg-black/30 py-4 px-6">
          No connections yet. Tap someone&apos;s NFC to get started!
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-4">
          {recentConnections.map((connection) => (
            <ConnectionCard
              key={connection.connectionID}
              connection={connection}
            />
          ))}
        </div>
      )}
    </BluePrintCard>
  );
}

function ConnectionCard({ connection }: { connection: Connection }) {
  const initials = `${connection.fname[0]?.toUpperCase() || ""}${connection.lname[0]?.toUpperCase() || ""}`;
  const connectionType = connection.connectionType || "ATTENDEE";

  const timeAgo = getTimeAgo(connection.createdAt);

  const profileId = connection.type?.split("#")[1] || connection.connectionID;

  return (
    <Link href={`/events/blueprint/2026/companion/profile/${profileId}`}>
      <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/15 hover:bg-black/50 hover:border-white/25 transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6299ff] to-[#EAE5D4] flex items-center justify-center">
            <span className="text-[#0A1428] font-medium text-sm">
              {initials}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-white font-medium text-sm">
              {connection.fname} {connection.lname}
            </span>
            <span className="text-white/70 text-xs">
              {connection.pronouns && `${connection.pronouns} · `}
              {connection.major || connectionType}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white/60 text-xs">{timeAgo}</span>
          <ArrowUpRight size={16} className="text-[#6299ff]" />
        </div>
      </div>
    </Link>
  );
}

function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
