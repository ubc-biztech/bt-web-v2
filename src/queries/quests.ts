import { useQuery } from "@tanstack/react-query";

interface QuestProgress {
  progress: number;
  target: number;
  startedAt: number;
  completedAt: number | null;
  updatedAt: number;
}

export type Quests = Record<string, QuestProgress>;

export async function getQuests(): Promise<Quests> {
  //   const response = await fetchBackend({
  //     endpoint: "/quests",
  //     method: "GET",
  //   });

  return {
    first_impressions: {
      progress: 0,
      target: 1,
      startedAt: 1700000000000,
      completedAt: null,
      updatedAt: 1700001000000,
    },
    expanding_your_circle: {
      progress: 0,
      target: 5,
      startedAt: 1700000000000,
      completedAt: null,
      updatedAt: 1700001000000,
    },
    finding_your_place: {
      progress: 0,
      target: 1,
      startedAt: 1700000000000,
      completedAt: null,
      updatedAt: 1700001000000,
    },
    smart_match: {
      progress: 0,
      target: 1,
      startedAt: 1700000000000,
      completedAt: null,
      updatedAt: 1700001000000,
    },
    booth_explorer: {
      progress: 0,
      target: 1,
      startedAt: 1700000000000,
      completedAt: null,
      updatedAt: 1700001000000,
    },
  } as Quests;
}

export function useQuests() {
  return useQuery({
    queryKey: ["quests"],
    queryFn: () => getQuests(),
    staleTime: 60 * 1000,
  });
}
