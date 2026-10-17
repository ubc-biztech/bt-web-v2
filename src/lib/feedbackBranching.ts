import type { FeedbackQuestion } from "@/types";
import { getFeedbackAnswerFields } from "./feedbackGrid";

export type FeedbackPage = {
  id: string;
  label: string;
  questions: FeedbackQuestion[];
};

export function getFeedbackPages(
  questions: FeedbackQuestion[],
  responses: Record<string, unknown>,
): FeedbackPage[] {
  const pages: FeedbackPage[] = [];
  let page: FeedbackPage = { id: "", label: "Your feedback", questions: [] };
  let visible = true;
  const finishPage = () => {
    if (visible && page.questions.length) pages.push(page);
  };

  for (const question of questions) {
    if (question.type === "SECTION") {
      finishPage();
      page = {
        id: question.questionId,
        label: question.label,
        questions: [],
      };
      const condition = question.showWhen;
      const answer = condition && responses[condition.questionId];
      visible =
        !condition ||
        (typeof answer === "string" && condition.values.includes(answer));
    } else {
      page.questions.push(question);
    }
  }
  finishPage();
  return pages;
}

export function getVisibleFeedbackQuestions(
  questions: FeedbackQuestion[],
  responses: Record<string, unknown>,
): FeedbackQuestion[] {
  return getFeedbackPages(questions, responses).flatMap(
    (page) => page.questions,
  );
}

export function pruneFeedbackResponses(
  questions: FeedbackQuestion[],
  responses: Record<string, unknown>,
): Record<string, unknown> {
  const fields = getFeedbackAnswerFields(
    getVisibleFeedbackQuestions(questions, responses),
  );
  return Object.fromEntries(
    fields
      .filter(({ questionId }) => Object.hasOwn(responses, questionId))
      .map(({ questionId }) => [questionId, responses[questionId]]),
  );
}

// Only shared earlier questions can route pages, so dependencies cannot cycle
// or read a stale answer from a branch that has disappeared.
export function getFeedbackConditionSources(
  questions: FeedbackQuestion[],
  beforeIndex: number,
): FeedbackQuestion[] {
  let shared = true;
  return questions.slice(0, beforeIndex).filter((question) => {
    if (question.type === "SECTION") {
      shared = !question.showWhen;
      return false;
    }
    return shared && question.type === "MULTIPLE_CHOICE";
  });
}

export function validateFeedbackBranching(
  questions: FeedbackQuestion[],
): string | null {
  for (let index = 0; index < questions.length; index++) {
    const question = questions[index];
    if (question.type !== "SECTION") continue;
    const title = question.label || "Untitled section";
    if (!question.label.trim()) return "Each section needs a title.";
    if (question.required) return `${title}: sections cannot be required.`;
    if (!questions[index + 1] || questions[index + 1].type === "SECTION") {
      return `${title}: add at least one question to this section.`;
    }
    if (
      questions.slice(index + 1).some((q) => q.questionId === "overall-rating")
    ) {
      return "Keep the default overall rating before all sections.";
    }
    if (!question.showWhen) continue;
    const source = getFeedbackConditionSources(questions, index).find(
      (q) => q.questionId === question.showWhen!.questionId,
    );
    if (!source) {
      return `${title}: choose an earlier multiple-choice question from a shared section.`;
    }
    const choices =
      source.choices?.split(",").map((choice) => choice.trim()) ?? [];
    const values = question.showWhen.values;
    if (!values.length || values.some((value) => !choices.includes(value))) {
      return `${title}: select at least one existing answer. Check any removed or renamed options.`;
    }
  }
  return null;
}
