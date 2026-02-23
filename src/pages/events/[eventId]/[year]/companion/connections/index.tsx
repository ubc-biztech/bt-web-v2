import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Search,
  ArrowLeft,
  ArrowUpRight,
  BookUser,
  ArrowUpDown,
} from "lucide-react";
import BluePrintLayout from "@/components/companion/blueprint2026/layout/BluePrintLayout";
import BluePrintCard from "@/components/companion/blueprint2026/components/BluePrintCard";
import BluePrintButton from "@/components/companion/blueprint2026/components/BluePrintButton";
import { useConnections } from "@/queries/connections";
import { Connection } from "@/pages/connections";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

type SortOption = "recent" | "name-asc" | "name-desc" | "year";

const ConnectionsPage = () => {
  const router = useRouter();
  const { eventId, year } = router.query;
  const [searchQuery, setSearchQuery] = useState("");
  const [connectionType, setConnectionType] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const { data: connections, isLoading, isError } = useConnections();

  // Filter and sort connections
  const filteredConnections = connections
    ? [...connections]
        .filter((connection) => {
          const searchLower = searchQuery.toLowerCase();
          const matchesSearch =
            !searchQuery ||
            [
              connection.fname,
              connection.lname,
              `${connection.fname} ${connection.lname}`,
              connection.major,
              connection.year,
            ].some((field) => field?.toLowerCase().includes(searchLower));

          const currType = connection.connectionType || "ATTENDEE";
          const matchesType =
            connectionType === "ALL" || connectionType === currType;

          return matchesSearch && matchesType;
        })
        .sort((a, b) => {
          switch (sortBy) {
            case "name-asc":
              return `${a.fname} ${a.lname}`.localeCompare(
                `${b.fname} ${b.lname}`,
              );
            case "name-desc":
              return `${b.fname} ${b.lname}`.localeCompare(
                `${a.fname} ${a.lname}`,
              );
            case "year":
              return (a.year || "").localeCompare(b.year || "");
            default:
              return b.createdAt - a.createdAt;
          }
        })
    : [];

  const connectionTypes = [
    { value: "ALL", label: "All" },
    { value: "PARTNER", label: "Partners" },
    { value: "EXEC", label: "Execs" },
    { value: "ATTENDEE", label: "Attendees" },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "recent", label: "Most Recent" },
    { value: "name-asc", label: "Name A-Z" },
    { value: "name-desc", label: "Name Z-A" },
    { value: "year", label: "Year" },
  ];

  return (
    <BluePrintLayout>
      <div className="flex flex-col gap-3 pb-6">
        {/* Header with Title */}
        <div className="flex items-center justify-between mt-4">
          <Link href={`/events/${eventId}/${year}/companion`}>
            <BluePrintButton className="text-xs px-3 py-1.5">
              <ArrowLeft size={14} />
              Back
            </BluePrintButton>
          </Link>
          <div className="flex items-center gap-2">
            <BookUser className="text-[#6299ff]" size={18} />
            <h1 className="text-lg font-medium text-white">Your Connections</h1>
            <span className="text-xs text-[#778191]">
              ({connections?.length || 0})
            </span>
          </div>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>

        <div className="h-[0.5px] w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* Search & Filter */}
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-white/50" />
            </div>
            <input
              type="text"
              placeholder="Search by name, major, or year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#6299ff]/50 focus:border-[#6299ff]/50 text-sm"
            />
          </div>

          {/* Filter & Sort Row */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {connectionTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setConnectionType(type.value)}
                  className={`px-4 py-2 rounded-full text-xs font-mono whitespace-nowrap transition-all ${
                    connectionType === type.value
                      ? "bg-[#6299ff] text-white"
                      : "bg-black/40 text-white/70 border border-white/20 hover:bg-black/50"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white text-xs hover:bg-black/50 transition-all"
                onClick={() => {
                  const currentIndex = sortOptions.findIndex(
                    (opt) => opt.value === sortBy,
                  );
                  const nextIndex = (currentIndex + 1) % sortOptions.length;
                  setSortBy(sortOptions[nextIndex].value);
                }}
              >
                <ArrowUpDown size={14} className="text-white/50" />
                <span>
                  {sortOptions.find((opt) => opt.value === sortBy)?.label}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6299ff]" />
          </div>
        )}

        {/* Error State */}
        {isError && (
          <BluePrintCard>
            <div className="text-center py-8">
              <p className="text-red-400">Failed to load connections</p>
              <p className="text-[#778191] text-sm mt-2">
                Please try again later
              </p>
            </div>
          </BluePrintCard>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredConnections.length === 0 && (
          <BluePrintCard>
            <div className="text-center py-8">
              <BookUser className="mx-auto text-[#778191] mb-3" size={48} />
              {searchQuery || connectionType !== "ALL" ? (
                <>
                  <p className="text-white">No connections found</p>
                  <p className="text-[#778191] text-sm mt-2">
                    Try adjusting your search or filter
                  </p>
                </>
              ) : (
                <>
                  <p className="text-white">No connections yet</p>
                  <p className="text-[#778191] text-sm mt-2">
                    Tap someone&apos;s NFC card to connect!
                  </p>
                </>
              )}
            </div>
          </BluePrintCard>
        )}

        {/* Connections List */}
        {!isLoading && !isError && filteredConnections.length > 0 && (
          <motion.div
            className="flex flex-col gap-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredConnections.map((connection) => (
              <motion.div key={connection.connectionID} variants={itemVariants}>
                <ConnectionCard connection={connection} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </BluePrintLayout>
  );
};

function ConnectionCard({ connection }: { connection: Connection }) {
  const initials = `${connection.fname[0]?.toUpperCase() || ""}${connection.lname[0]?.toUpperCase() || ""}`;
  const connectionType = connection.connectionType || "ATTENDEE";
  const timeAgo = getTimeAgo(connection.createdAt);

  // Extract profile ID from connection.type (format: "prefix#profileId")
  const profileId = connection.type?.split("#")[1] || connection.connectionID;

  const typeColors: Record<string, string> = {
    PARTNER: "bg-[#A78BFA]/20 text-[#A78BFA] border-[#A78BFA]/30",
    EXEC: "bg-[#EAE5D4]/20 text-[#EAE5D4] border-[#EAE5D4]/30",
    ATTENDEE: "bg-white/10 text-white/70 border-white/20",
  };

  return (
    <Link href={`/events/blueprint/2026/companion/profile/${profileId}`}>
      <div className="p-3 rounded-xl bg-black/40 border border-white/15 cursor-pointer hover:bg-black/50 hover:border-white/25 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6299ff] to-[#EAE5D4] flex items-center justify-center flex-shrink-0">
              <span className="text-[#0A1428] font-medium text-sm">
                {initials}
              </span>
            </div>

            {/* Info */}
            <div className="flex flex-col min-w-0">
              <span className="text-white font-medium truncate">
                {connection.fname} {connection.lname}
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {connection.pronouns && (
                  <span className="text-white/70 text-xs">
                    {connection.pronouns}
                  </span>
                )}
                {connection.major && (
                  <>
                    {connection.pronouns && (
                      <span className="text-white/60 text-xs">·</span>
                    )}
                    <span className="text-white/70 text-xs truncate">
                      {connection.major.length > 30
                        ? `${connection.major.slice(0, 25)}...`
                        : connection.major}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Type Badge */}
            <span
              className={`px-2 py-1 text-[10px] font-mono rounded-full border ${typeColors[connectionType]}`}
            >
              {connectionType}
            </span>

            {/* Time */}
            <span className="text-white/50 text-xs hidden sm:block">
              {timeAgo}
            </span>

            {/* Arrow */}
            <ArrowUpRight size={18} className="text-[#6299ff]" />
          </div>
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

export default ConnectionsPage;
