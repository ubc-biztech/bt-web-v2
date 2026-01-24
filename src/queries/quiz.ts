import { useQuery } from "@tanstack/react-query";
import { fetchBackend } from "@/lib/db";
import { getProfileId, useUserProfile } from "./userProfile";

export interface QuizReport {
  id: string;
  "eventID;year": string;
  domainAvg: number;
  modeAvg: number;
  environmentAvg: number;
  focusAvg: number;
  mbti: string;
  fname?: string;
  lname?: string;
}

export interface QuizScores {
  domain: Record<string, number>;
  mode: Record<string, number>;
  environment: Record<string, number>;
  focus: Record<string, number>;
}

export interface AggregateStats {
  totalResponses: number;
  averages: {
    domainAvg: number;
    modeAvg: number;
    environmentAvg: number;
    focusAvg: number;
  } | null;
  mbtiCount: Record<string, number>;
}

export interface WrappedStats {
  totalResponses: number;
  totalWithMbtiCount: number;
}

/**
 * Upload quiz results for a user
 */
export async function uploadQuizResults(
  id: string,
  scores: QuizScores,
): Promise<{ message: string }> {
  return fetchBackend({
    endpoint: "/quizzes/upload",
    method: "POST",
    data: {
      id,
      ...scores,
    },
  });
}

/**
 * Get a user's quiz report (authenticated - user identified by token)
 */
export async function getQuizReport(
  profile_id: string,
): Promise<QuizReport | null> {
  try {
    const response = await fetchBackend({
      endpoint: `/quizzes/report/${profile_id}`,
      method: "GET",
      authenticatedCall: true,
    });
    return response?.data ?? response ?? null;
  } catch (error: any) {
    // Handle "Quiz report not found" - return null instead of throwing
    // The API returns 400 when no quiz exists for the user
    const status = error?.status;
    const message = error?.message?.message || error?.message;

    if (status === 400 || message === "Quiz report not found") {
      return null;
    }

    console.error("Quiz report fetch error:", error);
    // Return null for any error to gracefully show "no results" UI
    return null;
  }
}

/**
 * Get all quiz reports for an event
 */
export async function getQuizReportsByEvent(
  event: string = "blueprint;2026",
): Promise<QuizReport[]> {
  const response = await fetchBackend({
    endpoint: `/quizzes/${encodeURIComponent(event)}`,
    method: "GET",
    authenticatedCall: false,
  });
  return Array.isArray(response) ? response : [];
}

/**
 * Get aggregate stats for an event
 */
export async function getQuizAggregateStats(
  event: string = "blueprint;2026",
): Promise<AggregateStats> {
  const response = await fetchBackend({
    endpoint: `/quizzes/aggregate/${encodeURIComponent(event)}`,
    method: "GET",
    authenticatedCall: false,
  });
  return response?.data ?? { totalResponses: 0, averages: null, mbtiCount: {} };
}

/**
 * Get MBTI wrapped stats
 */
export async function getWrappedStats(mbti: string): Promise<WrappedStats> {
  const response = await fetchBackend({
    endpoint: "/quizzes/wrapped",
    method: "POST",
    data: { mbti },
    authenticatedCall: false,
  });
  return response;
}

/**
 * React Query hook for fetching a user's quiz report (authenticated)
 */
export function useQuizReport() {
  const { data: userProfile } = useUserProfile();

  const profileId = userProfile?.compositeID
    ? getProfileId(userProfile.compositeID)
    : "";
  return useQuery({
    queryKey: ["quizReport"],
    queryFn: () => getQuizReport(profileId),
    enabled: !!profileId, // only run if profileId exists
    staleTime: 60 * 1000,
  });
}

/**
 * React Query hook for fetching aggregate stats
 */
export function useQuizAggregateStats(event: string = "blueprint;2026") {
  return useQuery({
    queryKey: ["quizAggregateStats", event],
    queryFn: () => getQuizAggregateStats(event),
    staleTime: 60 * 1000,
  });
}

/**
 * React Query hook for fetching wrapped stats for a specific MBTI
 */
export function useWrappedStats(mbti?: string) {
  return useQuery({
    queryKey: ["wrappedStats", mbti],
    queryFn: () => getWrappedStats(mbti!),
    enabled: !!mbti,
    staleTime: 60 * 1000,
  });
}

/**
 * Get quiz reports for a specific MBTI type (for recommendations)
 */
export async function getQuizzesByMbti(mbti: string): Promise<QuizReport[]> {
  const response = await fetchBackend({
    endpoint: `/quizzes/perMbti/${encodeURIComponent(mbti)}`,
    method: "GET",
    authenticatedCall: true,
  });
  // Response shape: { "mbtiQuizzes-{mbti}": [...] }
  const key = `mbtiQuizzes-${mbti}`;
  return response?.[key] ?? [];
}

/**
 * React Query hook for fetching recommendations by MBTI type
 */
export function useRecommendationsByMbti(mbti?: string) {
  return useQuery({
    queryKey: ["recommendationsByMbti", mbti],
    queryFn: () => getQuizzesByMbti(mbti!),
    enabled: !!mbti,
    staleTime: 60 * 1000,
  });
}
