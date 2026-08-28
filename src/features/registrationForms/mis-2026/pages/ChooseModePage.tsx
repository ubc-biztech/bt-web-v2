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
    mobileOrder: "order-2",
  },
  {
    mode: "self-select",
    title: "I know my focus area",
    description: "Jump straight to picking your block!",
    mobileOrder: "order-1",
  },
] as const satisfies readonly {
  mode: MISFlowMode;
  title: string;
  description: string;
  mobileOrder: string;
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
      className="flex min-h-[100dvh] w-full flex-col px-6 pb-[clamp(2rem,7dvh,3.75rem)] pt-[clamp(2.75rem,8dvh,4.5rem)] md:px-10 md:py-[clamp(2rem,7dvh,3.75rem)]"
    >
      <div className="mx-auto flex w-full max-w-[422px] flex-1 flex-col md:max-w-[1007px]">
        <div className="flex items-center justify-between">
          <BackButton onClick={onBack} />

          <span className="text-[14px] font-medium leading-none tracking-normal text-[#98F3FF]/70">
            Step 1 of 3
          </span>
        </div>

        <h1 className="mt-9 text-[24px] font-bold leading-tight tracking-[-0.01em] text-[#98F3FF] md:text-[36px]">
          How do you want to find your block?
        </h1>

        <p className="mt-3 text-[16.29px] font-normal leading-[1.4] text-white/80 md:mt-2 md:text-[16px]">
          Already know which one you are, or want help discovering it?
        </p>

        <div
          className="mx-auto mt-[110px] grid w-full max-w-[410px] grid-cols-1 gap-4 md:mt-12 md:max-h-[368px] md:min-h-0 md:max-w-none md:flex-1 md:grid-cols-2 md:gap-6"
          role="group"
          aria-label="Choose how to find your block"
        >
          {MODES.map(({ mode, title, description, mobileOrder }) => {
            const isSelected = selectedMode === mode;

            return (
              <button
                key={mode}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedMode(mode)}
                className={`
                  ${mobileOrder} flex h-[92px] flex-col items-start justify-center
                  rounded-[20px] border-[1.5px] bg-[#1A1A1A] px-[18.41px] text-left
                  transition-all duration-200
                  hover:bg-[#202020]
                  focus-visible:outline-none focus-visible:ring-4
                  focus-visible:ring-[#98F3FF]/30
                  md:order-none md:h-full md:px-11 md:py-4
                  ${
                    isSelected
                      ? "border-[#98F3FF]"
                      : "border-[#2A2A2A] hover:border-[#3A3A3A]"
                  }
                `}
              >
                <span className="flex w-full flex-col gap-[13.65px] md:w-[325.35px] md:gap-3">
                  <span className="text-[18px] font-bold leading-none text-white md:text-[28px] md:leading-[33px]">
                    {title}
                  </span>

                  <span className="text-[12px] font-normal leading-none text-[#A0A0A0] md:text-[16px] md:leading-[19px]">
                    {description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <p className="mx-auto mt-6 w-full max-w-[410px] text-center text-[12px] italic leading-[18px] text-[#B0B0B0] md:mt-10 md:max-w-none md:text-[15px]">
          Both options register you for the MIS Night event.
        </p>

        <div className="mt-auto flex justify-center pt-10 md:mt-8 md:justify-end md:pt-0">
          <ActionButton
            disabled={!selectedMode}
            onClick={handleContinue}
            className="!h-[60px] !min-h-[60px] !w-full !max-w-[422px] !rounded-[25.07px] !py-3 !text-[24px]"
          >
            Continue
          </ActionButton>
        </div>
      </div>
    </section>
  );
}
