import { PRODUCT_PLUS_EVENT_ID, PRODUCT_PLUS_YEAR } from "./access";
import {
  useCreateEventTeam,
  useEventTeam,
  useJoinEventTeam,
  useLeaveEventTeam,
  useRemoveEventTeamMember,
  type TeamQueryOptions,
} from "@/features/events/teams";

export {
  errorStatus,
  type Team,
  type TeamMember,
} from "@/features/events/teams";

/** The caller's team for Product+ 2026, or null when they are not on one. */
export function useProductPlusTeam(
  email: string | undefined,
  options: TeamQueryOptions = {},
) {
  return useEventTeam(PRODUCT_PLUS_EVENT_ID, PRODUCT_PLUS_YEAR, email, options);
}

// The backend reads are eventually consistent, so each mutation writes its
// result straight into the cache rather than refetching.

export function useCreateTeam(email: string | undefined) {
  return useCreateEventTeam(PRODUCT_PLUS_EVENT_ID, PRODUCT_PLUS_YEAR, email);
}

export function useJoinTeam(email: string | undefined) {
  return useJoinEventTeam(PRODUCT_PLUS_EVENT_ID, PRODUCT_PLUS_YEAR, email);
}

export function useLeaveTeam(email: string | undefined) {
  return useLeaveEventTeam(PRODUCT_PLUS_EVENT_ID, PRODUCT_PLUS_YEAR, email);
}

export function useRemoveTeamMember(email: string | undefined) {
  return useRemoveEventTeamMember(
    PRODUCT_PLUS_EVENT_ID,
    PRODUCT_PLUS_YEAR,
    email,
  );
}
