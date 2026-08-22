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
    prompt: "What kind of challenge sounds the most energizing?",
    options: [
      { label: "Imagining what could come next", value: "The Visionary" },
      { label: "Shaping how people experience it", value: "The Designer" },
      { label: "Building the system behind it", value: "The Architect" },
      { label: "Finding the pattern in the data", value: "The Logician" },
      {
        label: "Turning the idea into a winning plan",
        value: "The Strategist",
      },
    ],
  },
  {
    id: "team-role",
    prompt: "Which role do you naturally take in a team?",
    options: [
      { label: "I set the direction", value: "The Visionary" },
      { label: "I advocate for the user", value: "The Designer" },
      { label: "I connect all the moving parts", value: "The Architect" },
      { label: "I test assumptions with evidence", value: "The Logician" },
      { label: "I decide how we get there", value: "The Strategist" },
    ],
  },
  {
    id: "outcome",
    prompt: "What outcome feels the most satisfying?",
    options: [
      { label: "A bold idea people believe in", value: "The Visionary" },
      { label: "An experience people love using", value: "The Designer" },
      { label: "A solution that works reliably", value: "The Architect" },
      { label: "An answer supported by evidence", value: "The Logician" },
      { label: "A plan that creates real impact", value: "The Strategist" },
    ],
  },
  {
    id: "growth",
    prompt: "Which skill would you most like to strengthen?",
    options: [
      { label: "Communicating a compelling vision", value: "The Visionary" },
      { label: "Designing with empathy", value: "The Designer" },
      { label: "Creating scalable systems", value: "The Architect" },
      { label: "Making sense of complex information", value: "The Logician" },
      { label: "Choosing the strongest path forward", value: "The Strategist" },
    ],
  },
] as const satisfies readonly MISQuizQuestion[];

export type MISFlowState = {
  step: MISFlowStep;
  mode?: MISFlowMode;
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
      return state.step === "info" ? { ...state, step: "choose-mode" } : state;

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
          return { ...state, step: "welcome" };
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
