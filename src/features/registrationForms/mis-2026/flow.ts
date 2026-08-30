import { MIS_CAREER_INTERESTS, type MISCareerInterest } from "./Definition";

export type MISFlowStep =
  | "welcome"
  | "info"
  | "choose-mode"
  | "choose-block"
  | "quiz"
  | "analyzing"
  | "recommendation"
  | "rsvp"
  | "success";

export type MISFlowMode = "self-select" | "guided";

export type MISQuizOption = {
  label: string;
  value: MISCareerInterest;
};

export type MISQuizQuestion = {
  id: string;
  prompt: string;
  options: readonly MISQuizOption[];
};

export const MIS_QUIZ_QUESTIONS = [
  {
    id: "challenge",
    prompt:
      "When picking a restaurant to go to with friends, what matters most to you?",
    options: [
      {
        label: "Whether it sounds different from places you usually go.",
        value: "The Visionary",
      },
      {
        label: "The atmosphere, aesthetic, and vibe.",
        value: "The Designer",
      },
      {
        label: "Whether it`s convenient and reliable.",
        value: "The Architect",
      },
      {
        label: "Beli or Google Maps reviews.",
        value: "The Logician",
      },
      {
        label: "Whether everyone will agree to go and enjoy their time.",
        value: "The Strategist",
      },
    ],
  },
  {
    id: "team-role",
    prompt:
      "You`re about to buy something just a bit too expensive online. What`s your typical habit?",
    options: [
      {
        label: "Prioritize whether it looks and feels the nicest.",
        value: "The Designer",
      },
      {
        label: "Check whether it seems durable and reliable.",
        value: "The Architect",
      },
      {
        label:
          "Compare specifications and reviews until you know way too much.",
        value: "The Logician",
      },
      {
        label:
          "Look at what influencers and community groups are recommending.",
        value: "The Strategist",
      },
      {
        label: "Keep looking because there might be an even better option.",
        value: "The Visionary",
      },
    ],
  },
  {
    id: "outcome",
    prompt:
      "Someone gives you IKEA furniture with no instructions. What happens?",
    options: [
      {
        label:
          "You sort all the pieces first and figure out how everything connects.",
        value: "The Architect",
      },
      {
        label: "You try to reverse-engineer how it`s supposed to work.",
        value: "The Logician",
      },
      {
        label: "You convince someone else to help you.",
        value: "The Strategist",
      },
      {
        label: "You start experimenting and assume you`ll figure it out.",
        value: "The Visionary",
      },
      {
        label: "You piece it together based on what feels most natural to use.",
        value: "The Designer",
      },
    ],
  },
  {
    id: "growth",
    prompt:
      "You`re watching a bad movie with friends. What would bother you most?",
    options: [
      {
        label:
          "The characters keep making illogical decisions that make zero sense.",
        value: "The Logician",
      },
      {
        label: "The movie doesn`t connect with you.",
        value: "The Strategist",
      },
      {
        label: "The movie had a great concept but wasted its potential.",
        value: "The Visionary",
      },
      {
        label: "The cinematography, pacing, or visuals just feel off.",
        value: "The Designer",
      },
      {
        label:
          "The world-building keeps changing when it`s convenient for the plot.",
        value: "The Architect",
      },
    ],
  },
] as const satisfies readonly MISQuizQuestion[];

export type MISFlowState = {
  step: MISFlowStep;
  mode?: MISFlowMode;
  returnToChooseBlock?: boolean;
  quizIndex: number;
  quizAnswers: Record<string, MISCareerInterest>;
  recommendation?: MISCareerInterest;
};

export const INITIAL_MIS_FLOW_STATE: MISFlowState = {
  step: "welcome",
  quizIndex: 0,
  quizAnswers: {},
};

export type MISFlowAction =
  | { type: "START" }
  | { type: "CONTINUE_FROM_INFO" }
  | { type: "VIEW_INFO" }
  | { type: "CHOOSE_MODE"; mode: MISFlowMode }
  | { type: "CHOOSE_BLOCK"; block: MISCareerInterest }
  | {
      type: "ANSWER_QUIZ";
      questionId: string;
      answer: MISCareerInterest;
    }
  | { type: "ANALYSIS_COMPLETE" }
  | { type: "CONTINUE_TO_RSVP" }
  | { type: "SUBMISSION_SUCCEEDED" }
  | { type: "BACK" };

function calculateRecommendation(
  answers: Record<string, MISCareerInterest>,
): MISCareerInterest {
  const scores = Object.fromEntries(
    MIS_CAREER_INTERESTS.map((interest) => [interest, 0]),
  ) as Record<MISCareerInterest, number>;

  for (const answer of Object.values(answers)) {
    scores[answer] += 1;
  }

  return MIS_CAREER_INTERESTS.reduce((best, interest) =>
    scores[interest] > scores[best] ? interest : best,
  );
}

export function misFlowReducer(
  state: MISFlowState,
  action: MISFlowAction,
): MISFlowState {
  switch (action.type) {
    case "START":
      return state.step === "welcome" ? { ...state, step: "info" } : state;

    case "CONTINUE_FROM_INFO":
      if (state.step !== "info") return state;

      return state.returnToChooseBlock
        ? { ...state, step: "choose-block", returnToChooseBlock: undefined }
        : { ...state, step: "choose-mode" };

    case "VIEW_INFO":
      return state.step === "choose-block"
        ? { ...state, step: "info", returnToChooseBlock: true }
        : state;

    case "CHOOSE_MODE":
      if (state.step !== "choose-mode") return state;

      return action.mode === "self-select"
        ? {
            ...state,
            step: "choose-block",
            mode: action.mode,
            recommendation: undefined,
          }
        : {
            ...state,
            step: "quiz",
            mode: action.mode,
            quizIndex: 0,
            quizAnswers: {},
            recommendation: undefined,
          };

    case "CHOOSE_BLOCK":
      return state.step === "choose-block"
        ? {
            ...state,
            step: "recommendation",
            mode: "self-select",
            recommendation: action.block,
          }
        : state;

    case "ANSWER_QUIZ": {
      if (state.step !== "quiz") return state;

      const quizAnswers = {
        ...state.quizAnswers,
        [action.questionId]: action.answer,
      };
      const isLastQuestion = state.quizIndex === MIS_QUIZ_QUESTIONS.length - 1;

      return isLastQuestion
        ? {
            ...state,
            step: "analyzing",
            quizAnswers,
            recommendation: calculateRecommendation(quizAnswers),
          }
        : {
            ...state,
            quizIndex: state.quizIndex + 1,
            quizAnswers,
          };
    }

    case "ANALYSIS_COMPLETE":
      return state.step === "analyzing"
        ? { ...state, step: "recommendation" }
        : state;

    case "CONTINUE_TO_RSVP":
      return state.step === "recommendation"
        ? { ...state, step: "rsvp" }
        : state;

    case "SUBMISSION_SUCCEEDED":
      return state.step === "rsvp" ? { ...state, step: "success" } : state;

    case "BACK":
      switch (state.step) {
        case "info":
          return state.returnToChooseBlock
            ? {
                ...state,
                step: "choose-block",
                returnToChooseBlock: undefined,
              }
            : { ...state, step: "welcome" };
        case "choose-mode":
          return { ...state, step: "info" };
        case "choose-block":
          return { ...state, step: "choose-mode" };
        case "quiz":
          return state.quizIndex > 0
            ? { ...state, quizIndex: state.quizIndex - 1 }
            : { ...state, step: "choose-mode" };
        case "recommendation":
          return { ...state, step: "choose-block", mode: "self-select" };
        case "rsvp":
          return { ...state, step: "recommendation" };
        default:
          return state;
      }

    default:
      return state;
  }
}
