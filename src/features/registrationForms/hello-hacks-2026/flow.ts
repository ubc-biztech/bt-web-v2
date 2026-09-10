/**
 * Linear order of the HelloHacks application. `success` is not part of this
 * list: it is only reachable once a submission comes back successful.
 */
export const HH_FLOW_STEPS = [
  "welcome",
  "avatar",
  "song",
  "role",
  "application",
  "confirm-details",
  "review",
] as const;

export type HHFlowStep = (typeof HH_FLOW_STEPS)[number] | "success";

/** Steps the review screen can jump back into via its per-section "Edit". */
export const HH_EDITABLE_STEPS = [
  "avatar",
  "song",
  "role",
  "application",
  "confirm-details",
] as const;

export type HHEditableStep = (typeof HH_EDITABLE_STEPS)[number];

export type HHFlowState = {
  step: HHFlowStep;
  /**
   * Set when the person reached the current step from the review screen, so
   * continuing (or going back) returns them to review instead of walking the
   * rest of the flow again.
   */
  returnToReview: boolean;
};

export const INITIAL_HH_FLOW_STATE: HHFlowState = {
  step: "welcome",
  returnToReview: false,
};

export type HHFlowAction =
  | { type: "START" }
  | { type: "CONTINUE" }
  | { type: "BACK" }
  | { type: "EDIT"; step: HHEditableStep }
  | { type: "SUBMISSION_SUCCEEDED" };

function stepAt(index: number): HHFlowStep | undefined {
  return HH_FLOW_STEPS[index];
}

function indexOfStep(step: HHFlowStep): number {
  return (HH_FLOW_STEPS as readonly HHFlowStep[]).indexOf(step);
}

export function hhFlowReducer(
  state: HHFlowState,
  action: HHFlowAction,
): HHFlowState {
  switch (action.type) {
    case "START":
      return state.step === "welcome"
        ? { step: "avatar", returnToReview: false }
        : state;

    case "CONTINUE": {
      if (state.step === "review" || state.step === "success") return state;

      if (state.returnToReview) {
        return { step: "review", returnToReview: false };
      }

      const next = stepAt(indexOfStep(state.step) + 1);

      return next ? { ...state, step: next } : state;
    }

    case "BACK": {
      if (state.step === "welcome" || state.step === "success") return state;

      if (state.returnToReview) {
        return { step: "review", returnToReview: false };
      }

      const previous = stepAt(indexOfStep(state.step) - 1);

      return previous ? { ...state, step: previous } : state;
    }

    case "EDIT":
      return state.step === "review"
        ? { step: action.step, returnToReview: true }
        : state;

    case "SUBMISSION_SUCCEEDED":
      return state.step === "review"
        ? { step: "success", returnToReview: false }
        : state;

    default:
      return state;
  }
}
