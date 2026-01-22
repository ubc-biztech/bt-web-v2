import { useQuery } from "@tanstack/react-query";
import { fetchBackend } from "@/lib/db";

interface QuestDefinition {
  id: string;
  type: "COUNTER" | "UNIQUE_SET";
  target: number | null;
  description: string;
  eventTypes: string[];
}

export interface QuestProgress {
  progress: number;
  target: number | null;
  startedAt: number;
  completedAt: number | null;
  updatedAt?: number;
  description?: string;
  items?: string[];
}

interface QuestEntry {
  quest: QuestDefinition;
  progress: QuestProgress;
}

export type Quests = Record<string, QuestProgress>;

export type QuestEventType = "connection" | "company";

export type QuestEvent =
  | {
      type: "connection";
      argument: {
        recommended?: boolean;
        profileId?: string;
      };
    }
  | {
      type: "company";
      argument: {
        company: string;
      };
    };

function mapQuestEntries(entries: QuestEntry[]): Quests {
  return entries.reduce((acc: Quests, entry: QuestEntry) => {
    if (!entry?.quest?.id || !entry.progress) {
      return acc;
    }

    const target =
      entry.progress.target ?? entry.quest.target ?? (null as number | null);
    const startedAt = entry.progress.startedAt ?? Date.now();

    acc[entry.quest.id] = {
      progress: entry.progress.progress ?? 0,
      target,
      startedAt,
      completedAt: entry.progress.completedAt ?? null,
      updatedAt: entry.progress.updatedAt ?? startedAt,
      description: entry.progress.description ?? entry.quest.description,
      items: entry.progress.items,
    };

    return acc;
  }, {} as Quests);
}

export async function getQuests(
  eventId?: string,
  year?: string | number,
): Promise<Quests> {
  if (!eventId || !year) {
    console.warn("Missing eventId/year for quest fetch.");
    return {};
  }

  const response = await fetchBackend({
    endpoint: `/quests/${eventId}/${year}`,
    method: "GET",
  });

  if (response?.data?.quests && typeof response.data.quests === "object") {
    return response.data.quests as Quests;
  }

  if (response?.quests && typeof response.quests === "object") {
    return response.quests as Quests;
  }

  const entries = Array.isArray(response?.data) ? response.data : [];
  return mapQuestEntries(entries);
}

export async function postQuestEvent(
  event: QuestEvent,
  eventId?: string,
  year?: string | number,
) {
  if (!eventId || !year) {
    console.warn("Missing eventId/year for quest event.");
    return null;
  }

  return fetchBackend({
    endpoint: `/quests/${eventId}/${year}`,
    method: "PATCH",
    data: event,
  });
}

export function useQuests(eventId?: string, year?: string | number) {
  return useQuery({
    queryKey: ["quests", eventId, year],
    queryFn: () => getQuests(eventId, year),
    enabled: !!eventId && !!year,
    staleTime: 60 * 1000,
  });
}
