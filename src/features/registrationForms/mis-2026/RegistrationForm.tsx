import { useEffect, useReducer } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import MISBackground from "@/assets/2026/mis-night/background.svg";
import type { RegistrationFormProps } from "@/features/registrationForms/types";
import type { RegistrationPayload } from "@/lib/registrationStrategy/registrationStrategy";
import {
  MIS_CAREER_INTERESTS,
  MISRegistrationSchema,
  type MISCareerInterest,
  type MISRegistrationValues,
} from "./Definition";
import {
  INITIAL_MIS_FLOW_STATE,
  MIS_QUIZ_QUESTIONS,
  misFlowReducer,
} from "./flow";
import { AnalyzingPage } from "./pages/AnalyzingPage";
import { ChooseBlockPage } from "./pages/ChooseBlockPage";
import { ChooseModePage } from "./pages/ChooseModePage";
import { InfoPage } from "./pages/InfoPage";
import { QuizPage } from "./pages/QuizPage";
import { RecommendationPage } from "./pages/RecommendationPage";
import { RSVPPage } from "./pages/RSVPPage";
import { SuccessPage } from "./pages/SuccessPage";
import { WelcomePage } from "./pages/WelcomePage";

const RSVP_FIELDS = [
  ["firstName", "First name"],
  ["lastName", "Last name"],
  ["email", "Email"],
  ["studentId", "Student ID"],
  ["year", "Year"],
  ["faculty", "Faculty"],
  ["major", "Major / specialization"],
] as const;

export function MISRegistrationForm({
  user,
  submitting,
  onSubmit,
}: RegistrationFormProps) {
  const [flow, dispatch] = useReducer(misFlowReducer, INITIAL_MIS_FLOW_STATE);
  const form = useForm<MISRegistrationValues>({
    resolver: zodResolver(MISRegistrationSchema),
    defaultValues: {
      email: user.email ?? user.id,
      firstName: user.fname ?? "",
      lastName: user.lname ?? "",
      studentId: user.studentId?.toString() ?? "",
      year: user.year?.toString() ?? "",
      faculty: user.faculty ?? "",
      major: user.major ?? "",
    },
  });
  const { setValue } = form;
  const selectedBlock = form.watch("careerInterest");

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
    };
  }, []);

  useEffect(() => {
    if (flow.step !== "analyzing" || !flow.recommendation) return;

    setValue("careerInterest", flow.recommendation, {
      shouldDirty: true,
      shouldValidate: true,
    });

    const timeoutId = window.setTimeout(() => {
      dispatch({ type: "ANALYSIS_COMPLETE" });
    }, 1400);

    return () => window.clearTimeout(timeoutId);
  }, [flow.recommendation, flow.step, setValue]);

  function selectBlock(block: MISCareerInterest) {
    setValue("careerInterest", block, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function continueFromBlockSelection() {
    if (!selectedBlock) return;
    dispatch({ type: "CHOOSE_BLOCK", block: selectedBlock });
  }

  async function handleValidSubmit(values: MISRegistrationValues) {
    if (flow.step !== "rsvp") return;

    const payload: RegistrationPayload = {
      email: values.email,
      fname: values.firstName,
      studentId: values.studentId || undefined,
      basicInformation: {
        fname: values.firstName,
        lname: values.lastName,
        year: values.year,
        faculty: values.faculty,
        major: values.major,
      },
      dynamicResponses: {
        careerInterest: values.careerInterest,
      },
    };

    if (await onSubmit(payload)) {
      dispatch({ type: "SUBMISSION_SUCCEEDED" });
    }
  }

  function renderPage() {
    switch (flow.step) {
      case "welcome":
        return <WelcomePage onContinue={() => dispatch({ type: "START" })} />;

      case "info":
        return (
          <InfoPage
            onBack={() => dispatch({ type: "BACK" })}
            onContinue={() => dispatch({ type: "CONTINUE_FROM_INFO" })}
          />
        );

      case "choose-mode":
        return (
          <ChooseModePage
            onBack={() => dispatch({ type: "BACK" })}
            onChooseBlock={() =>
              dispatch({ type: "CHOOSE_MODE", mode: "self-select" })
            }
            onChooseQuiz={() =>
              dispatch({ type: "CHOOSE_MODE", mode: "guided" })
            }
          />
        );

      case "choose-block":
        return (
          <ChooseBlockPage
            blocks={MIS_CAREER_INTERESTS}
            selectedBlock={selectedBlock}
            onBack={() => dispatch({ type: "BACK" })}
            onSelectBlock={selectBlock}
            onContinue={continueFromBlockSelection}
          />
        );

      case "quiz": {
        const question = MIS_QUIZ_QUESTIONS[flow.quizIndex];

        return (
          <QuizPage
            question={question}
            questionNumber={flow.quizIndex + 1}
            questionCount={MIS_QUIZ_QUESTIONS.length}
            onBack={() => dispatch({ type: "BACK" })}
            onAnswer={(answer) =>
              dispatch({
                type: "ANSWER_QUIZ",
                questionId: question.id,
                answer,
              })
            }
          />
        );
      }

      case "analyzing":
        return <AnalyzingPage />;

      case "recommendation":
        return (
          <RecommendationPage
            recommendation={flow.recommendation}
            onBack={() => dispatch({ type: "BACK" })}
            onContinue={() => dispatch({ type: "CONTINUE_TO_RSVP" })}
          />
        );

      case "rsvp":
        return (
          <RSVPPage
            submitting={submitting}
            onBack={() => dispatch({ type: "BACK" })}
          >
            <div>
              {RSVP_FIELDS.map(([name, label]) => (
                <label key={name}>
                  <span>{label}</span>
                  <input {...form.register(name)} />
                  {form.formState.errors[name]?.message ? (
                    <span role="alert">
                      {form.formState.errors[name]?.message}
                    </span>
                  ) : null}
                </label>
              ))}
            </div>
          </RSVPPage>
        );

      case "success":
        return <SuccessPage />;
    }
  }

  return (
    <div className="fixed inset-y-0 left-0 right-0 z-20 isolate overflow-x-hidden overflow-y-auto overscroll-contain bg-black text-white md:left-[250px]">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 left-0 right-0 overflow-hidden md:left-[250px]"
      >
        <MISBackground
          focusable="false"
          preserveAspectRatio="xMidYMid slice"
          className="block h-full w-full max-w-none"
        />
      </div>

      <form
        className="relative z-10 h-full w-full"
        onSubmit={form.handleSubmit(handleValidSubmit)}
      >
        {renderPage()}
      </form>
    </div>
  );
}
