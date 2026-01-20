import { fetchBackend } from "@/lib/db";
import { Connection } from "@/pages/connections";
import { useQuery } from "@tanstack/react-query";

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
