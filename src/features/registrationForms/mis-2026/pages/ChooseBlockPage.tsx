import ArchitectMascot from "@/assets/2026/mis-night/architect_mascot.svg";
import DesignerMascot from "@/assets/2026/mis-night/designer_mascot.svg";
import LogicianMascot from "@/assets/2026/mis-night/logicion_mascot.svg";
import StrategistMascot from "@/assets/2026/mis-night/strategist_mascot.svg";
import VisionaryMascot from "@/assets/2026/mis-night/visionary_mascot.svg";
import type { MISCareerInterest } from "../Definition";
import { ActionButton } from "../components/ActionButton";
import { BackButton } from "../components/BackButton";

type ChooseBlockPageProps = {
  blocks: readonly MISCareerInterest[];
  selectedBlock?: MISCareerInterest;
  onBack: () => void;
  onViewDescriptions: () => void;
  onSelectBlock: (block: MISCareerInterest) => void;
  onContinue: () => void;
};

type BuildingBlockDetails = {
  image: typeof VisionaryMascot;
  description: string;
};

const BUILDING_BLOCK_DETAILS = {
  "The Visionary": {
    image: VisionaryMascot,
    description:
      "You are the big-picture dreamer who spots opportunities before anyone else does.",
  },
  "The Designer": {
    image: DesignerMascot,
    description:
      "You are the empathetic creative who cares deeply about how people feel.",
  },
  "The Architect": {
    image: ArchitectMascot,
    description:
      "You are the practical builder who loves figuring out how things work.",
  },
  "The Logician": {
    image: LogicianMascot,
    description:
      "You are the curious puzzle-solver who looks for patterns in everything.",
  },
  "The Strategist": {
    image: StrategistMascot,
    description:
      "You are the charismatic connector who knows how to make things happen in the real world.",
  },
} as const satisfies Record<MISCareerInterest, BuildingBlockDetails>;

export function ChooseBlockPage({
  blocks,
  selectedBlock,
  onBack,
  onViewDescriptions,
  onSelectBlock,
  onContinue,
}: ChooseBlockPageProps) {
  return (
    <section
      data-step="choose-block"
      className="flex min-h-[100dvh] w-full flex-col px-6 pb-[clamp(2rem,6dvh,3.75rem)] pt-[clamp(2.75rem,8dvh,4.5rem)] md:h-[100dvh] md:min-h-0 md:overflow-hidden md:px-10 md:py-[clamp(2rem,7dvh,3.75rem)]"
    >
      <div className="mx-auto flex w-full max-w-[422px] flex-1 flex-col md:max-w-[1007px]">
        <div className="flex items-center justify-between">
          <BackButton onClick={onBack} />

          <span className="text-[14px] font-medium leading-none text-[#98F3FF]/70">
            Step 1 of 3
          </span>
        </div>

        <h1 className="mt-9 text-[28px] font-bold leading-tight tracking-[-0.01em] text-[#98F3FF] md:text-[36px]">
          Choose your Block
        </h1>

        <p className="mt-3 text-[16px] font-normal leading-[1.4] text-white/80">
          Select your mascot for MIS Night!
        </p>

        <div
          className="mx-auto mt-[clamp(2rem,5dvh,2.5rem)] grid w-full max-w-[410px] grid-cols-1 gap-2.5 md:mt-8 md:max-w-[802px] md:grid-cols-2 md:gap-3 md:gap-x-6"
          role="group"
          aria-label="Choose your MIS building block"
        >
          {blocks.map((block, index) => {
            const details = BUILDING_BLOCK_DETAILS[block];
            const Mascot = details.image;
            const isSelected = selectedBlock === block;
            const isLastBlock = index === blocks.length - 1;

            return (
              <button
                key={block}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectBlock(block)}
                className={`group flex h-[82px] w-full items-center gap-3 rounded-[18px] border bg-[#1A1A1A] px-4 py-2 text-left transition-all duration-200 hover:bg-[#202020] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#98F3FF]/30 md:h-[clamp(96px,13dvh,130px)] md:gap-5 md:px-6 ${
                  isLastBlock ? "md:col-span-2 md:mx-auto md:max-w-[389px]" : ""
                } ${
                  isSelected
                    ? "border-[#98F3FF] bg-[#202020] shadow-[0_0_0_1px_rgba(152,243,255,0.2)]"
                    : "border-[#303030] hover:border-[#4A4A4A]"
                }`}
              >
                <span className="flex h-[60px] w-[60px] shrink-0 items-center justify-center md:h-[72px] md:w-[72px]">
                  <span className="inline-flex origin-center scale-[1.35] transition-transform duration-200 group-hover:scale-[1.45] md:scale-[1.65] md:group-hover:scale-[1.75]">
                    <Mascot focusable="false" aria-hidden="true" />
                  </span>
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-[18px] font-bold leading-tight text-white md:text-[22px]">
                    {block}
                  </span>

                  <span className="mt-1 block text-[12px] font-normal leading-[1.25] text-white/70 md:text-[14px] md:leading-[1.3]">
                    {details.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onViewDescriptions}
          className="mt-6 self-center text-[14px] italic leading-none text-white/70 transition-colors duration-200 hover:text-[#98F3FF] focus-visible:rounded focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#98F3FF]/30 md:mt-8 md:self-start"
        >
          ← Go back to full mascot descriptions
        </button>

        <div className="mt-auto flex justify-center pt-[clamp(2rem,5dvh,3rem)] md:justify-end md:pt-6">
          <ActionButton
            disabled={!selectedBlock}
            onClick={onContinue}
            className="!h-[60px] !min-h-[60px] !w-full !max-w-[422px] !rounded-[25.07px] !py-3 !text-[24px]"
          >
            Continue
          </ActionButton>
        </div>
      </div>
    </section>
  );
}
