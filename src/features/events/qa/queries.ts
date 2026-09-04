import { fetchBackend } from "@/lib/db";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Question } from "./types";

export async function getQaQuestions(
  eventId: string,
  year: string,
): Promise<Question[]> {
  const res = await fetchBackend({
    endpoint: `/events/${eventId}/${year}/qa`,
    method: "GET",
    authenticatedCall: false,
  });
  return Array.isArray(res) ? res : [];
}

export function useQaQuestions(eventId?: string, year?: string) {
  return useQuery({
    queryKey: ["qa", eventId, year],
    queryFn: () => getQaQuestions(eventId!, year!),
    enabled: !!eventId && !!year,
    staleTime: 30 * 1000,
  });
}

export function useSubmitQuestion(eventId: string, year: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { body: string; category?: string }) =>
      fetchBackend({
        endpoint: `/events/${eventId}/${year}/qa`,
        method: "POST",
        data,
        authenticatedCall: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qa", eventId, year] });
    },
  });
}

export function useUpvoteQuestion(eventId: string, year: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) =>
      fetchBackend({
        endpoint: `/events/${eventId}/${year}/qa/${questionId}/upvote`,
        method: "POST",
        authenticatedCall: true,
      }),
    onMutate: async (questionId: string) => {
      await queryClient.cancelQueries({ queryKey: ["qa", eventId, year] });
      const previous = queryClient.getQueryData<Question[]>([
        "qa",
        eventId,
        year,
      ]);
      queryClient.setQueryData<Question[]>(
        ["qa", eventId, year],
        (old) =>
          old?.map((q) =>
            q.questionId === questionId ? { ...q, upvotes: q.upvotes + 1 } : q,
          ) ?? [],
      );
      return { previous };
    },
    onError: (_err, _questionId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["qa", eventId, year], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["qa", eventId, year] });
    },
  });
}

export type QuestionPatch = Partial<
  Pick<Question, "answer" | "isHidden" | "isPinned" | "body">
>;

export function usePatchQuestion(eventId: string, year: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      questionId,
      patch,
    }: {
      questionId: string;
      patch: QuestionPatch;
    }) =>
      fetchBackend({
        endpoint: `/events/${eventId}/${year}/qa/${questionId}`,
        method: "PATCH",
        data: patch,
        authenticatedCall: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qa", eventId, year] });
    },
  });
}
