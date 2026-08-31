import Link from "next/link";
import { Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CONNECTION_TYPES,
  type ConnectionType,
} from "@/constants/connectionTypes";
import type { Connection } from "@/types/companion";
import { ensureAbsoluteUrl } from "@/util/profile";
import {
  getConnectionFullName,
  getConnectionInitials,
  getConnectionLinkedIn,
  getConnectionProfileId,
  getConnectionSubtitle,
  getConnectionType,
  getConnectionTypeLabel,
} from "@/lib/connectionHelpers";

type ConnectionCardProps = {
  connection: Connection;
};

const roleBadgeClasses: Record<ConnectionType, string> = {
  [CONNECTION_TYPES.ATTENDEE]:
    "border-bt-blue-200 bg-bt-blue-400 text-bt-blue-0",
  [CONNECTION_TYPES.PARTNER]:
    "border-amber-400/40 bg-amber-400/10 text-amber-200",
  [CONNECTION_TYPES.EXEC]:
    "border-purple-400/40 bg-purple-400/10 text-purple-200",
};

export function ConnectionCard({ connection }: ConnectionCardProps) {
  const role = getConnectionType(connection);
  const profileId = getConnectionProfileId(connection);
  const linkedIn = getConnectionLinkedIn(connection);
  const subtitle = getConnectionSubtitle(connection);

  return (
    <article className="flex h-full flex-col rounded-lg border border-bt-blue-200 bg-bt-blue-500 p-4 shadow-[inset_0_0_20px_rgba(255,255,255,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bt-blue-0 text-sm font-800 text-bt-blue-600">
            {getConnectionInitials(connection)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-white font-medium">
              {getConnectionFullName(connection) || "Unknown"}
            </h3>
            {connection.pronouns && (
              <p className="truncate text-sm text-bt-blue-0">
                {connection.pronouns}
              </p>
            )}
            {subtitle && (
              <p className="truncate text-sm text-bt-blue-0">{subtitle}</p>
            )}
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${roleBadgeClasses[role]}`}
        >
          {getConnectionTypeLabel(connection)}
        </span>
      </div>

      <div className="mt-4 flex flex-1 items-end gap-2 border-t border-bt-blue-300 pt-4">
        {profileId ? (
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/profile/${profileId}`}>View Profile</Link>
          </Button>
        ) : (
          <Button variant="outline" className="flex-1" disabled>
            View Profile
          </Button>
        )}
        {linkedIn && (
          <Button
            asChild
            className="flex-1 gap-1.5 bg-[#4C8DFF] text-white hover:bg-[#3B7AE0]"
          >
            <a
              href={ensureAbsoluteUrl(linkedIn)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="h-4 w-4" aria-hidden="true" />
              Follow up
            </a>
          </Button>
        )}
      </div>
    </article>
  );
}
