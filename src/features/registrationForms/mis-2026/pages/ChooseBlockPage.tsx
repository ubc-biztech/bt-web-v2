import type { MISCareerInterest } from "../Definition";
import { ActionButton } from "../components/ActionButton";
import { BackButton } from "../components/BackButton";

type ChooseBlockPageProps = {
  blocks: readonly MISCareerInterest[];
  selectedBlock?: MISCareerInterest;
  onBack: () => void;
  onSelectBlock: (block: MISCareerInterest) => void;
  onContinue: () => void;
};

export function ChooseBlockPage({
  blocks,
  selectedBlock,
  onBack,
  onSelectBlock,
  onContinue,
}: ChooseBlockPageProps) {
  return (
    <section data-step="choose-block">
      <BackButton onClick={onBack} />
      <h1>Choose your block</h1>
      <div>
        {blocks.map((block) => (
          <button
            key={block}
            type="button"
            aria-pressed={selectedBlock === block}
            onClick={() => onSelectBlock(block)}
          >
            {block}
          </button>
        ))}
      </div>
      <ActionButton disabled={!selectedBlock} onClick={onContinue}>
        Continue
      </ActionButton>
    </section>
  );
}
