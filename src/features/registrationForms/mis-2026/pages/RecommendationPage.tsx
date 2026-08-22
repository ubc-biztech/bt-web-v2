import type { MISCareerInterest } from "../Definition";
import { ActionButton } from "../components/ActionButton";
import { BackButton } from "../components/BackButton";

type RecommendationPageProps = {
  recommendation?: MISCareerInterest;
  onBack: () => void;
  onContinue: () => void;
};

export function RecommendationPage({
  recommendation,
  onBack,
  onContinue,
}: RecommendationPageProps) {
  return (
    <section data-step="recommendation">
      <BackButton onClick={onBack} />
      <h1>Recommendation</h1>
      <p>{recommendation ?? "Recommendation pending"}</p>
      <ActionButton onClick={onContinue}>Continue</ActionButton>
    </section>
  );
}
