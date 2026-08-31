import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getConnectionFullName,
  getConnectionInitials,
  getConnectionProfilePicture,
} from "@/lib/connectionHelpers";
import { useConnections } from "@/queries/connections";
import { useUserAttributes } from "@/queries/user";
import { cn } from "@/lib/utils";
import type { Connection } from "@/types/companion";
import type { EventHomeEvent } from "./types";

const MAX_VISIBLE_AVATARS = 5;

type EventConnectionsModuleProps = {
  event: EventHomeEvent;
};

function sortNewestFirst(connections: Connection[]) {
  return [...connections].sort(
    (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
  );
}

function getConnectedCountCopy(count: number, eventName: string) {
  const countLabel =
    count === 1 ? "1 person connected" : `${count} people connected`;
  const othersLabel = count === 1 ? "1 other" : `${count} others`;

  return {
    countLabel,
    subtitle: `You and ${othersLabel} attended ${eventName}`,
  };
}

function ConnectionsCard({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <section className="rounded-[14px] border border-[#26314a] bg-[#111a30] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.18)] lg:p-5">
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-white transition hover:text-white/90"
      >
        <h2 className="text-[22px] font-800 leading-none">My Connections</h2>
        <ArrowUpRight
          className="h-6 w-6 shrink-0 text-[#3B93F7]"
          aria-hidden="true"
        />
        <span className="sr-only">Open My Connections</span>
      </Link>
      {children}
    </section>
  );
}

function ConnectionsModuleSkeleton({ href }: { href: string }) {
  return (
    <ConnectionsCard href={href}>
      <div
        className="mt-4 flex flex-col items-center space-y-3"
        aria-hidden="true"
      >
        <div className="flex items-center justify-center">
          {Array.from({ length: MAX_VISIBLE_AVATARS }).map((_, index) => (
            <Skeleton
              key={index}
              className={cn(
                "h-12 w-12 rounded-full border-2 border-[#111a30] bg-[#263451]",
                index > 0 && "-ml-3",
              )}
            />
          ))}
        </div>
        <Skeleton className="h-5 w-44 bg-[#263451]" />
        <Skeleton className="h-4 w-64 max-w-full bg-[#263451]" />
      </div>
    </ConnectionsCard>
  );
}

function ConnectionsEmptyArt() {
  return (
    <Image
      src="/assets/images/connections-empty.png"
      alt=""
      width={96}
      height={95}
      aria-hidden="true"
    />
  );
}

function ConnectionsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-2 py-3 text-center">
      <ConnectionsEmptyArt />
      <p className="mt-2 text-sm font-600 text-white">
        No connections for this event yet!
      </p>
      <p className="mt-1 max-w-[280px] text-xs leading-5 text-bt-blue-0">
        Connections will appear here once attendees are confirmed.
      </p>
    </div>
  );
}

function ConnectionAvatars({ connections }: { connections: Connection[] }) {
  const visible = connections.slice(0, MAX_VISIBLE_AVATARS);
  const overflow = connections.length - visible.length;

  return (
    <div className="flex items-center justify-center" aria-hidden="true">
      {visible.map((connection, index) => {
        const pictureUrl = getConnectionProfilePicture(connection);
        const name = getConnectionFullName(connection);

        return (
          <Avatar
            key={connection.compositeID || connection.connectionID || index}
            className={cn(
              "h-12 w-12 border-2 border-[#111a30]",
              index > 0 && "-ml-3",
            )}
            style={{ zIndex: visible.length - index }}
          >
            {pictureUrl ? (
              <AvatarImage src={pictureUrl} alt={name || "Connection"} />
            ) : null}
            <AvatarFallback className="bg-bt-blue-0 text-sm font-800 text-bt-blue-600">
              {getConnectionInitials(connection)}
            </AvatarFallback>
          </Avatar>
        );
      })}
      {overflow > 0 && (
        <div
          className="-ml-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#111a30] bg-[#263451] text-sm font-800 text-white"
          style={{ zIndex: 0 }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

export function EventConnectionsModule({ event }: EventConnectionsModuleProps) {
  const { data: userAttributes, isLoading: userLoading } = useUserAttributes();
  const signedIn = Boolean(userAttributes?.email);
  const canFetch = signedIn && Boolean(event.id) && event.year != null;
  const connectionsHref =
    event.id && event.year != null
      ? `/connections?eventId=${encodeURIComponent(event.id)}&year=${encodeURIComponent(String(event.year))}`
      : "/connections";

  const { data, isLoading, isError, isPlaceholderData } = useConnections(
    canFetch
      ? { eventId: event.id, year: event.year, registeredOnly: true }
      : undefined,
    { enabled: canFetch },
  );

  if (canFetch && isError && !isPlaceholderData) return null;

  if (
    userLoading ||
    (canFetch && (isPlaceholderData || (isLoading && !data)))
  ) {
    return <ConnectionsModuleSkeleton href={connectionsHref} />;
  }

  const connections = sortNewestFirst(data ?? []);

  if (!signedIn || connections.length === 0) {
    return (
      <ConnectionsCard href={connectionsHref}>
        <ConnectionsEmptyState />
      </ConnectionsCard>
    );
  }

  const { countLabel, subtitle } = getConnectedCountCopy(
    connections.length,
    event.ename,
  );

  return (
    <ConnectionsCard href={connectionsHref}>
      <div className="mt-4 flex flex-col items-center text-center">
        <ConnectionAvatars connections={connections} />
        <p className="mt-3 text-sm font-800 text-white">{countLabel}</p>
        <p className="mt-1 text-xs leading-5 text-bt-blue-0">{subtitle}</p>
      </div>
    </ConnectionsCard>
  );
}
