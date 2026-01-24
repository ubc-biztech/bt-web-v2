import { fetchBackend } from "@/lib/db";
import { Connection } from "@/pages/connections";
import { useQuery, useMutation } from "@tanstack/react-query";

export async function getConnections(): Promise<Connection[]> {
  const response = await fetchBackend({
    endpoint: "/interactions/journal",
    method: "GET",
  });

  return response.data as Connection[];
}

export function useConnections() {
  return useQuery({
    queryKey: ["connections"],
    queryFn: () => getConnections(),
    staleTime: 60 * 1000,
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
