import type { MISCareerInterest } from "../Definition";
import type { MISQuizQuestion } from "../flow";
import { BackButton } from "../components/BackButton";

type QuizPageProps = {
  question: MISQuizQuestion;
  questionNumber: number;
  questionCount: number;
  onBack: () => void;
  onAnswer: (answer: MISCareerInterest) => void;
};

export function QuizPage({
  question,
  questionNumber,
  questionCount,
  onBack,
  onAnswer,
}: QuizPageProps) {
  return (
    <section data-step="quiz">
      <BackButton onClick={onBack} />
      <p>
        Question {questionNumber} of {questionCount}
      </p>
      <h1>{question.prompt}</h1>
      <div>
        {question.options.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => onAnswer(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}
