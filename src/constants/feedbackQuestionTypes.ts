export enum FeedbackQuestionTypes {
  SHORT_TEXT = "SHORT_TEXT",
  LONG_TEXT = "LONG_TEXT",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  CHECKBOXES = "CHECKBOXES",
  LINEAR_SCALE = "LINEAR_SCALE",
}

export const FEEDBACK_FORM_TYPES = {
  attendee: "attendee",
  partner: "partner",
} as const;

export type FeedbackFormType =
  (typeof FEEDBACK_FORM_TYPES)[keyof typeof FEEDBACK_FORM_TYPES];

// default question id
export const OVERALL_RATING_QUESTION_ID = "overall-rating";

export const DEFAULT_OVERALL_RATING_QUESTION = {
  questionId: OVERALL_RATING_QUESTION_ID,
  type: FeedbackQuestionTypes.LINEAR_SCALE as const,
  label: "How would you rate this event overall?",
  required: true,
  scaleMin: 1,
  scaleMax: 10,
  scaleMinLabel: "Poor",
  scaleMaxLabel: "Excellent",
};
