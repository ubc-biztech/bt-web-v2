import { useEffect, useReducer, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ChevronDown } from "lucide-react";
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
import { RSVP_CONTROL_CLASS, RSVPPage, type RSVPField } from "./pages/RSVPPage";
import { SuccessPage } from "./pages/SuccessPage";
import { WelcomePage } from "./pages/WelcomePage";

const RSVP_FIELDS = [
  ["faculty", "Faculty"],
  ["email", "Email address"],
  ["major", "Major / specialization"],
  ["year", "Year level"],
  ["dietaryRestrictions", "Dietary restrictions"],
  ["studentId", "Student ID"],
] as const;

const DIETARY_OPTIONS = ["None", "Vegetarian", "Vegan", "Gluten-free", "Other"];
const STEP_LABEL = "Step 3 of 3";

function normalizeDietaryRestriction(value?: string) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) return "None";

  return (
    DIETARY_OPTIONS.find(
      (option) => option.toLowerCase() === trimmedValue.toLowerCase(),
    ) ?? trimmedValue
  );
}

export function MISRegistrationForm({
  user,
  submitting,
  onSubmit,
}: RegistrationFormProps) {
  const [flow, dispatch] = useReducer(misFlowReducer, INITIAL_MIS_FLOW_STATE);
  const authedEmail = user.email ?? user.id;
  const initialDietaryRestriction = normalizeDietaryRestriction(user.diet);
  const dietaryOptions = DIETARY_OPTIONS.some(
    (option) =>
      option.toLowerCase() === initialDietaryRestriction.toLowerCase(),
  )
    ? DIETARY_OPTIONS
    : [initialDietaryRestriction, ...DIETARY_OPTIONS];
  const form = useForm<MISRegistrationValues>({
    resolver: zodResolver(MISRegistrationSchema),
    defaultValues: {
      email: authedEmail,
      firstName: user.fname ?? "",
      lastName: user.lname ?? "",
      studentId: user.studentId?.toString() ?? "",
      year: user.year?.toString() ?? "",
      faculty: user.faculty ?? "",
      major: user.major ?? "",
      dietaryRestrictions: initialDietaryRestriction,
    },
  });
  const { setValue } = form;
  const selectedBlock = form.watch("careerInterest");
  const [fullName, setFullName] = useState(
    `${user.fname ?? ""} ${user.lname ?? ""}`.trim(),
  );

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

  function handleFullNameChange(value: string) {
    setFullName(value);

    const [firstName = "", ...lastNameParts] = value.trim().split(/\s+/);
    setValue("firstName", firstName, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("lastName", lastNameParts.join(" "), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function buildRSVPFields(): RSVPField[] {
    const fullNameError =
      form.formState.errors.firstName || form.formState.errors.lastName
        ? "Please enter your first and last name"
        : undefined;

    return [
      {
        id: "mis-rsvp-full-name",
        label: "Full name",
        error: fullNameError,
        control: (
          <input
            id="mis-rsvp-full-name"
            value={fullName}
            onChange={(event) => handleFullNameChange(event.target.value)}
            className={RSVP_CONTROL_CLASS}
            autoComplete="name"
          />
        ),
      },
      ...RSVP_FIELDS.map(([name, label]) => ({
        id: `mis-rsvp-${name}`,
        label,
        error: form.formState.errors[name]?.message,
        control:
          name === "dietaryRestrictions" ? (
            <span className="relative block">
              <select
                id={`mis-rsvp-${name}`}
                {...form.register(name)}
                className={`${RSVP_CONTROL_CLASS} appearance-none pr-11`}
              >
                {dietaryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-[#DBDBDB]"
              />
            </span>
          ) : (
            <input
              id={`mis-rsvp-${name}`}
              {...form.register(name)}
              readOnly={name === "email"}
              aria-readonly={name === "email"}
              className={`${RSVP_CONTROL_CLASS} ${
                name === "email" ? "cursor-default" : ""
              }`}
              autoComplete={name === "email" ? "email" : undefined}
            />
          ),
      })),
    ];
  }

  async function handleValidSubmit(values: MISRegistrationValues) {
    if (flow.step !== "rsvp") return;

    const payload: RegistrationPayload = {
      email: authedEmail,
      fname: values.firstName,
      studentId: values.studentId || undefined,
      basicInformation: {
        fname: values.firstName,
        lname: values.lastName,
        year: values.year,
        faculty: values.faculty,
        major: values.major,
        diet: values.dietaryRestrictions || "None",
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
            fields={buildRSVPFields()}
            profileName={fullName}
            careerInterest={selectedBlock}
            stepLabel={STEP_LABEL}
            submitting={submitting}
            onBack={() => dispatch({ type: "BACK" })}
          />
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
