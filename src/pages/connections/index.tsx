import { useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Search } from "lucide-react";
import { ConnectionCard } from "@/components/Connections/ConnectionCard";
import { ConnectionFilters } from "@/components/Connections/ConnectionFilters";
import { ConnectionsSummary } from "@/components/Connections/ConnectionsSummary";
import {
  connectionMatchesSearch,
  getConnectionType,
} from "@/lib/connectionHelpers";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ConnectionTypeFilter } from "@/constants/connectionTypes";
import { useConnections, type ConnectionsScope } from "@/queries/connections";
import { useEvents } from "@/queries/events";

const ALL_EVENTS_VALUE = "all";

function getRouteParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function eventValueFromQuery(query: {
  eventId?: string | string[];
  year?: string | string[];
}) {
  const eventId = getRouteParam(query.eventId);
  const year = getRouteParam(query.year);
  if (!eventId || !year) return ALL_EVENTS_VALUE;
  return `${eventId};${year}`;
}

function ConnectionsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-[92px] rounded-lg border border-bt-blue-300 bg-bt-blue-500"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-[180px] rounded-lg border border-bt-blue-200 bg-bt-blue-500"
          />
        ))}
      </div>
    </div>
  );
}

export default function ConnectionsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<ConnectionTypeFilter>("ALL");
  const selectedEventValue = router.isReady
    ? eventValueFromQuery(router.query)
    : ALL_EVENTS_VALUE;

  const { data: events = [] } = useEvents();

  const selectedScope = useMemo<ConnectionsScope | undefined>(() => {
    if (selectedEventValue === ALL_EVENTS_VALUE) return undefined;
    const [eventId, year] = selectedEventValue.split(";");
    if (!eventId || !year) return undefined;
    return { eventId, year, registeredOnly: true };
  }, [selectedEventValue]);

  const {
    data: connections = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useConnections(selectedScope, { enabled: router.isReady });

  const filteredConnections = useMemo(
    () =>
      connections.filter((connection) => {
        const matchesSearch = connectionMatchesSearch(connection, searchQuery);
        const matchesRole =
          roleFilter === "ALL" || getConnectionType(connection) === roleFilter;
        return matchesSearch && matchesRole;
      }),
    [connections, roleFilter, searchQuery],
  );

  const totalCount = connections.length;
  const filteredCount = filteredConnections.length;
  const showInitialLoading = isLoading && connections.length === 0;
  const emptyMessage =
    searchQuery || roleFilter !== "ALL"
      ? "No connections match your current filters."
      : selectedScope
        ? "No connections found for this event."
        : "No connections found.";

  return (
    <>
      <Head>
        <title>My Connections</title>
        <meta
          name="description"
          content="Manage your networking connections and NFC interactions"
        />
      </Head>

      <main className="w-full text-white">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-xl font-800 text-white lg:text-[40px] lg:leading-tight">
                My Connections
              </h1>
              <p className="mt-1 text-bt-blue-0">
                {showInitialLoading
                  ? "Loading connections..."
                  : totalCount === 1
                    ? "1 connection made"
                    : `${totalCount} connections made`}
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:min-w-[460px]">
              <Select
                value={selectedEventValue}
                onValueChange={(value) => {
                  if (value === ALL_EVENTS_VALUE) {
                    void router.replace("/connections", undefined, {
                      shallow: true,
                    });
                    return;
                  }

                  const [eventId, year] = value.split(";");
                  void router.replace(
                    { pathname: "/connections", query: { eventId, year } },
                    undefined,
                    { shallow: true },
                  );
                }}
              >
                <SelectTrigger className="h-11 w-full text-white sm:w-48">
                  <SelectValue placeholder="All Events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_EVENTS_VALUE}>All Events</SelectItem>
                  {events.map((event) => (
                    <SelectItem
                      key={`${event.id};${event.year}`}
                      value={`${event.id};${event.year}`}
                    >
                      {event.ename}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bt-blue-0"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search connections..."
                  className="h-11 pl-10 text-white placeholder:text-bt-blue-0"
                />
              </div>
            </div>
          </div>

          {isError ? (
            <div className="rounded-lg border border-bt-red-300/30 bg-bt-red-300/10 p-6 text-center">
              <p className="font-medium text-white">
                Couldn&apos;t load connections.
              </p>
              <p className="mt-2 text-sm text-bt-blue-0">
                Please try again in a moment.
              </p>
              <Button className="mt-4" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : showInitialLoading ? (
            <ConnectionsPageSkeleton />
          ) : (
            <>
              <div className={isFetching ? "opacity-80" : undefined}>
                <ConnectionsSummary connections={connections} />
              </div>

              <ConnectionFilters
                value={roleFilter}
                onChange={setRoleFilter}
                filteredCount={filteredCount}
                totalCount={totalCount}
              />

              {filteredCount === 0 ? (
                <div className="rounded-lg border border-bt-blue-300 bg-bt-blue-500 py-12 text-center">
                  <p className="text-bt-blue-0">{emptyMessage}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredConnections.map((connection) => (
                    <ConnectionCard
                      key={connection.compositeID || connection.connectionID}
                      connection={connection}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
