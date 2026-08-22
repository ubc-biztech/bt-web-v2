import { ActionButton } from "../components/ActionButton";
import { BackButton } from "../components/BackButton";

type ChooseModePageProps = {
  onBack: () => void;
  onChooseBlock: () => void;
  onChooseQuiz: () => void;
};

export function ChooseModePage({
  onBack,
  onChooseBlock,
  onChooseQuiz,
}: ChooseModePageProps) {
  return (
    <section data-step="choose-mode">
      <BackButton onClick={onBack} />
      <h1>Choose a mode</h1>
      <div>
        <ActionButton onClick={onChooseBlock}>I know my block</ActionButton>
        <ActionButton onClick={onChooseQuiz}>Choose for me</ActionButton>
      </div>
    </section>
  );
}
