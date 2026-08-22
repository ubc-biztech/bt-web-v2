import { ActionButton } from "../components/ActionButton";
import { BackButton } from "../components/BackButton";

type InfoPageProps = {
  onBack: () => void;
  onContinue: () => void;
};

export function InfoPage({ onBack, onContinue }: InfoPageProps) {
  return (
    <section data-step="info">
      <BackButton onClick={onBack} />
      <h1>Info</h1>
      <ActionButton onClick={onContinue}>Continue</ActionButton>
    </section>
  );
}
