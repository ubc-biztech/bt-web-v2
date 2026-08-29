import { useState } from "react";

import type { MISCareerInterest } from "../Definition";
import { BackButton } from "../components/BackButton";
import type { MISQuizQuestion } from "../flow";

type QuizPageProps = {
  question: MISQuizQuestion;
  questionNumber: number;
  questionCount: number;
  onBack: () => void;
  onAnswer: (answer: MISCareerInterest) => void;
};

type QuizSelection = {
  questionId: string;
  answer: MISCareerInterest;
};

export function QuizPage({
  question,
  questionNumber,
  questionCount,
  onBack,
  onAnswer,
}: QuizPageProps) {
  const [selection, setSelection] = useState<QuizSelection>();
  const selectedAnswer =
    selection?.questionId === question.id ? selection.answer : undefined;
  const progressPercentage = Math.round(
    ((questionNumber - 1) / questionCount) * 100,
  );

  const handleNext = () => {
    if (selectedAnswer) {
      onAnswer(selectedAnswer);
    }
  };

  return (
    <section
      data-step="quiz"
      className="flex min-h-[100dvh] w-full flex-col px-6 pb-[clamp(2rem,5dvh,3.5rem)] pt-[clamp(2.75rem,7dvh,4.5rem)] md:h-[100dvh] md:min-h-0 md:overflow-hidden md:px-10 md:py-[clamp(2rem,7dvh,3.75rem)]"
    >
      <div className="mx-auto flex w-full max-w-[422px] flex-1 flex-col md:max-w-[890px]">
        <div className="flex items-center justify-between">
          <BackButton onClick={onBack} />

          <span className="text-[14px] font-medium leading-none text-[#98F3FF]/70">
            Step 2 of 3
          </span>
        </div>

        <div className="mt-[clamp(2.75rem,6dvh,4rem)] md:mt-10">
          <div className="mb-2 flex items-center justify-between text-[15px] font-bold leading-none">
            <span className="text-white/80">
              Question {questionNumber} of {questionCount}
            </span>
            <span className="text-[#A7F2FC]">{progressPercentage}%</span>
          </div>

          <div
            role="progressbar"
            aria-label="Quiz progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercentage}
            className="h-5 overflow-hidden rounded-full border border-[#393939] bg-[#202020]"
          >
            <div
              className="h-full rounded-full bg-[#A7F2FC] transition-[width] duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <h1 className="mt-[clamp(3.5rem,8dvh,5rem)] text-[28px] font-bold leading-[1.22] tracking-[-0.015em] text-white md:mt-10 md:text-[28px]">
          {question.prompt}
        </h1>

        <div
          role="group"
          aria-label={question.prompt}
          className="mt-[clamp(2.5rem,7dvh,4rem)] flex flex-col gap-3 md:mt-8 md:gap-[10px]"
        >
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option.value;

            return (
              <button
                key={option.label}
                type="button"
                aria-pressed={isSelected}
                onClick={() =>
                  setSelection({
                    questionId: question.id,
                    answer: option.value,
                  })
                }
                className={`min-h-[50px] w-full rounded-[18px] border px-4 py-3 text-left text-[14px] leading-[1.3] text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A7F2FC] focus-visible:ring-offset-2 focus-visible:ring-offset-[#202020] md:min-h-[48px] ${
                  isSelected
                    ? "border-[#A7F2FC] bg-[#263336]"
                    : "border-[#323232] bg-[#1A1A1A] hover:border-[#A7F2FC]/60 hover:bg-[#202526]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="mt-auto flex items-center justify-center gap-8 pt-[clamp(2.5rem,7dvh,5rem)] md:justify-end md:gap-12 md:pt-6">
          <p className="whitespace-nowrap text-[16px] font-bold text-white/80">
            Choose one answer
          </p>

          <button
            type="button"
            disabled={!selectedAnswer}
            onClick={handleNext}
            className="h-[66px] w-[171px] shrink-0 rounded-[25px] bg-[#8D7CF4] text-[22px] font-bold text-white transition-colors hover:bg-[#9C8CFA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#202020] disabled:cursor-not-allowed disabled:bg-[#6D63AB] disabled:text-white/60 md:h-[60px] md:w-[156px] md:text-[20px]"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
