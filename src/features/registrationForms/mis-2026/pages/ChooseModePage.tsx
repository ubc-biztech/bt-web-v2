import { useState } from "react";
import type { MISFlowMode } from "../flow";
import { ActionButton } from "../components/ActionButton";
import { BackButton } from "../components/BackButton";

type ChooseModePageProps = {
  onBack: () => void;
  onChooseBlock: () => void;
  onChooseQuiz: () => void;
};

const MODES = [
  {
    mode: "guided",
    title: "Help me choose my building block",
    description: "Take a 60-second personality quiz",
  },
  {
    mode: "self-select",
    title: "I know my focus area",
    description: "Jump straight to picking your block!",
  },
] as const satisfies readonly {
  mode: MISFlowMode;
  title: string;
  description: string;
}[];

export function ChooseModePage({
  onBack,
  onChooseBlock,
  onChooseQuiz,
}: ChooseModePageProps) {
  const [selectedMode, setSelectedMode] = useState<MISFlowMode>();

  function handleContinue() {
    if (!selectedMode) return;

    if (selectedMode === "guided") {
      onChooseQuiz();
    } else {
      onChooseBlock();
    }
  }

  return (
    <section
      data-step="choose-mode"
      className="flex min-h-[100dvh] w-full flex-col px-6 py-10 md:px-10 md:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1000px] flex-col">
        <div className="flex items-center justify-between">
          <BackButton onClick={onBack} />

          <span className="text-[14px] font-medium text-[#98F3FF]/70">
            Step 1 of 3
          </span>
        </div>

        <h1 className="mt-12 text-[28px] font-bold leading-tight tracking-[-0.01em] text-[#98F3FF] md:text-[40px]">
          How do you want to find your block?
        </h1>

        <p className="mt-2 text-[15px] font-normal text-white/80 md:text-[16px]">
          Already know which one you are, or want help discovering it?
        </p>

        <div
          className="mt-10 grid grid-cols-1 gap-6 md:mt-12 md:grid-cols-2"
          role="group"
          aria-label="Choose how to find your block"
        >
          {MODES.map(({ mode, title, description }) => {
            const isSelected = selectedMode === mode;

            return (
              <button
                key={mode}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedMode(mode)}
                className={`
                  flex min-h-[200px] flex-col items-start justify-center
                  rounded-2xl border bg-[#141414] px-8 py-10 text-left
                  transition-all duration-200
                  hover:border-[#3A3A3A] hover:bg-[#1A1A1A]
                  focus-visible:outline-none focus-visible:ring-4
                  focus-visible:ring-[#98F3FF]/30
                  md:min-h-[365px] md:px-11
                  ${
                    isSelected
                      ? "border-[#98F3FF] bg-[#181818] shadow-[0_0_0_1px_#98F3FF]"
                      : "border-[#2A2A2A]"
                  }
                `}
              >
                <span className="text-[22px] font-bold leading-tight text-white md:text-[26px]">
                  {title}
                </span>

                <span className="mt-3 text-[15px] font-normal text-[#A0A0A0] md:text-[16px]">
                  {description}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-10 text-center text-[14px] italic text-[#B0B0B0] md:text-[15px]">
          Both options register you for the MIS Night event.
        </p>

        <div className="mt-8 flex justify-center md:justify-end">
          <ActionButton
            disabled={!selectedMode}
            onClick={handleContinue}
            className="!w-full !max-w-[422px] !text-[26px]"
          >
            Continue
          </ActionButton>
        </div>
      </div>
    </section>
  );
}
