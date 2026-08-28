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
    prompt: "What kind of challenge do you find most satisfying?",
    options: [
      {
        label: "Starting with a blank page to shape a brand-new concept.",
        value: "The Visionary",
      },
      {
        label: "Taking something confusing and making it effortless to use.",
        value: "The Designer",
      },
      {
        label:
          "Setting up a reliable system that runs smoothly without maintenance.",
        value: "The Architect",
      },
      {
        label: "Digging into complex patterns to figure out the “so what?”",
        value: "The Logician",
      },
      {
        label:
          "Figuring out how to get people genuinely excited about something.",
        value: "The Strategist",
      },
    ],
  },
  {
    id: "team-role",
    prompt: "What is your biggest pet peeve when working on a project?",
    options: [
      {
        label:
          "Wasting time building something without knowing why it matters.",
        value: "The Visionary",
      },
      {
        label:
          "Poorly thought-out experiences that frustrate the person using them.",
        value: "The Designer",
      },
      {
        label: "Fragile setups that break the moment you scale them.",
        value: "The Architect",
      },
      {
        label: "Gut decisions made with zero evidence or rationale.",
        value: "The Logician",
      },
      {
        label:
          "Great work that gets completely ignored because nobody knows how to deliver it.",
        value: "The Strategist",
      },
    ],
  },
  {
    id: "outcome",
    prompt:
      "You`re handed a messy, disorganized project. What is your immediate instinct?",
    options: [
      {
        label: "Step back to define the core objective.",
        value: "The Visionary",
      },
      {
        label:
          "Walk through it from the end-user`s perspective to identify friction.",
        value: "The Designer",
      },
      {
        label: "Rebuild the parts that are actively failing.",
        value: "The Architect",
      },
      {
        label: "Gather all available inputs to pinpoint the exact root cause.",
        value: "The Logician",
      },
      {
        label: "Realign the team and divide responsibilities.",
        value: "The Strategist",
      },
    ],
  },
  {
    id: "growth",
    prompt:
      "You’re planning a trip with friends. What part do you naturally take over?",
    options: [
      {
        label: "Pitching the overall vibe and destination ideas.",
        value: "The Visionary",
      },
      {
        label: "Planning the aesthetic spots and cafes for taking breaks.",
        value: "The Designer",
      },
      {
        label:
          "Figuring out the transit routes and coordinating what everyone is bringing.",
        value: "The Architect",
      },
      {
        label:
          "Digging through Reddit threads and Beli reviews to find the hidden gems.",
        value: "The Logician",
      },
      {
        label:
          "Getting everyone to show up on time and keeping the group on schedule.",
        value: "The Strategist",
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
