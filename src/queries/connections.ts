import { fetchBackend } from "@/lib/db";
import { Connection } from "@/types/companion";
import { keepPreviousData, useQuery, useMutation } from "@tanstack/react-query";

export type ConnectionsScope = {
  eventId: string;
  year: string | number;
  registeredOnly?: boolean;
};

function journalEndpoint(scope?: ConnectionsScope): string {
  if (!scope?.eventId || scope.year == null || scope.year === "") {
    return "/interactions/journal";
  }

  const params = new URLSearchParams({
    eventId: scope.eventId,
    year: String(scope.year),
  });

  if (scope.registeredOnly) {
    params.set("registeredOnly", "true");
  }

  return `/interactions/journal?${params.toString()}`;
}

export async function getConnections(
  scope?: ConnectionsScope,
): Promise<Connection[]> {
  const response = await fetchBackend({
    endpoint: journalEndpoint(scope),
    method: "GET",
  });

  return (response?.data as Connection[]) || [];
}

export function useConnections(
  scope?: ConnectionsScope,
  options?: { enabled?: boolean },
) {
  const eventId = scope?.eventId;
  const year = scope?.year;
  const registeredOnly = scope?.registeredOnly ?? false;

  return useQuery({
    queryKey: [
      "connections",
      eventId ?? "all",
      year ?? null,
      registeredOnly ? "registered" : "all",
    ],
    queryFn: () =>
      eventId && year != null
        ? getConnections({ eventId, year, registeredOnly })
        : getConnections(),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

export interface SearchResult {
  name: string;
  companiesWorkedAt?: string;
  rolesInterested?: string;
  industriesInterested?: string;
  resumeText?: string;
  objectID: string; // email
  _highlightResult?: {
    name?: { value: string; matchLevel: string; matchedWords: string[] };
    companiesWorkedAt?: {
      value: string;
      matchLevel: string;
      matchedWords: string[];
    };
    rolesInterested?: {
      value: string;
      matchLevel: string;
      matchedWords: string[];
    };
    industriesInterested?: {
      value: string;
      matchLevel: string;
      matchedWords: string[];
    };
    resumeText?: { value: string; matchLevel: string; matchedWords: string[] };
  };
}

/**
 * Semantic search for connections/profiles
 */
export async function semanticSearchProfiles(
  query: string,
): Promise<SearchResult[]> {
  const response = await fetchBackend({
    endpoint: "/interactions/search",
    method: "POST",
    data: { query },
    authenticatedCall: true,
  });
  return response?.data ?? response ?? [];
}

/**
 * React Query mutation hook for semantic search
 */
export function useSemanticSearch() {
  return useMutation({
    mutationFn: (query: string) => semanticSearchProfiles(query),
  });
}
