import type { RegistrationQuestion } from "@/types";
import {
  REGISTRATION_FORMS,
  type RegistrationFormDefinition,
  type RegistrationFormKey,
} from "./registry";

type EventFormQuestion = {
  id: string;
  type: string;
  question: string;
  required: boolean;
  options: string[];
  charLimit?: number;
  questionImageUrl?: string;
  participantCap?: number;
};

export function transformEventFormQuestion(
  question: EventFormQuestion,
): RegistrationQuestion {
  return {
    type: question.type,
    questionId: question.id,
    label: question.question,
    choices: question.options.join(","),
    required: question.required,
    charLimit: question.charLimit || undefined,
    questionImageUrl: question.questionImageUrl || "",
    participantCap:
      question.type === "WORKSHOP_SELECTION"
        ? question.participantCap
        : undefined,
    isSkillsQuestion: question.type === "SKILLS" ? true : undefined,
  };
}

export function transformEventFormQuestions(
  questions: EventFormQuestion[],
): RegistrationQuestion[] {
  return questions.map(transformEventFormQuestion);
}

export function getRegistrationQuestions(
  key: RegistrationFormKey,
  defaultQuestions: RegistrationQuestion[],
): RegistrationQuestion[] {
  const definition: RegistrationFormDefinition = REGISTRATION_FORMS[key];

  return definition.questions ? [...definition.questions] : defaultQuestions;
}
