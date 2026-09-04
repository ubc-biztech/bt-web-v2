import { Handshake, Star, User, Users } from "lucide-react";
import {
  CONNECTION_TYPES,
  type ConnectionType,
} from "@/constants/connectionTypes";
import type { Connection } from "@/types/companion";
import { getConnectionType } from "@/lib/connectionHelpers";

type ConnectionsSummaryProps = {
  connections: Connection[];
};

const summaryCards: {
  key: "total" | ConnectionType;
  label: string;
  icon: typeof Users;
}[] = [
  { key: "total", label: "Total Connections", icon: Users },
  { key: CONNECTION_TYPES.ATTENDEE, label: "Attendees", icon: User },
  { key: CONNECTION_TYPES.PARTNER, label: "Partners", icon: Handshake },
  { key: CONNECTION_TYPES.EXEC, label: "Execs", icon: Star },
];

export function ConnectionsSummary({ connections }: ConnectionsSummaryProps) {
  const counts = {
    total: connections.length,
    [CONNECTION_TYPES.ATTENDEE]: 0,
    [CONNECTION_TYPES.PARTNER]: 0,
    [CONNECTION_TYPES.EXEC]: 0,
  };

  for (const connection of connections) {
    counts[getConnectionType(connection)] += 1;
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {summaryCards.map(({ key, label, icon: Icon }) => (
        <div
          key={key}
          className="rounded-lg border border-bt-blue-300 bg-bt-blue-500 p-4"
        >
          <div className="flex items-center gap-2 text-bt-blue-0">
            <Icon className="h-4 w-4" aria-hidden="true" />
            <p className="text-[11px] font-800 uppercase tracking-[0.08em]">
              {label}
            </p>
          </div>
          <p className="mt-3 text-2xl font-800 text-white">{counts[key]}</p>
        </div>
      ))}
    </div>
  );
}
