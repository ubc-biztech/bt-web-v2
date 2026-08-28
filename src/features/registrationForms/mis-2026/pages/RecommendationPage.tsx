import type { MISCareerInterest } from "../Definition";
import { BUILDING_BLOCKS } from "../buildingBlocks";
import { ActionButton } from "../components/ActionButton";
import { BackButton } from "../components/BackButton";
import { ConfettiBackground } from "../components/ConfettiBackground";

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
  if (!recommendation) {
    return (
      <section
        data-step="recommendation"
        aria-live="polite"
        className="relative isolate flex min-h-[100dvh] items-center justify-center overflow-hidden px-6 text-center"
      >
        <ConfettiBackground />

        <BackButton
          onClick={onBack}
          label="Back to choose your block"
          className="absolute left-6 top-20 z-10 md:left-10 md:top-[clamp(2rem,5dvh,3.5rem)]"
        />

        <p className="relative z-10 text-[18px] font-bold text-[#A7F2FC]">
          Your recommendation is still being assembled...
        </p>
      </section>
    );
  }

  const result = BUILDING_BLOCKS[recommendation];
  const Mascot = result.image;

  return (
    <section
      data-step="recommendation"
      aria-labelledby="recommendation-title"
      className="relative isolate flex min-h-[100dvh] w-full flex-col overflow-y-auto px-5 py-[clamp(2rem,4dvh,3.5rem)] md:h-[100dvh] md:min-h-0 md:overflow-hidden md:px-10 md:py-[clamp(2rem,5dvh,3.5rem)]"
    >
      <ConfettiBackground />

      <BackButton
        onClick={onBack}
        label="Back to choose your block"
        className="absolute left-6 top-20 z-10 md:left-10 md:top-[clamp(2rem,5dvh,3.5rem)]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[520px] flex-1 flex-col items-center justify-center text-center">
        <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-white/75 md:text-[15px]">
          You are...
        </p>

        <h1
          id="recommendation-title"
          className="mt-2 text-[36px] font-bold leading-none tracking-[-0.02em] text-[#A7F2FC] md:text-[42px]"
        >
          {result.header}!
        </h1>

        <div className="mt-8 flex h-[216px] w-[212px] shrink-0 items-center justify-center overflow-hidden rounded-[20px] border-2 border-[#A7F2FC] bg-[#1A1A1A] md:mt-9 md:h-[250px] md:w-[248px] md:rounded-[21px]">
          <span className="inline-flex origin-center scale-[4.15] md:scale-[4.45]">
            <Mascot focusable="false" aria-hidden="true" />
          </span>
        </div>

        <p className="mt-6 max-w-[430px] text-[14px] font-normal leading-[1.38] text-white md:mt-7 md:text-[16px] md:leading-[1.42]">
          {result.description}
        </p>

        <div className="mt-6 md:mt-7">
          <h2 className="text-[12px] font-bold uppercase tracking-[0.1em] text-white/70 md:text-[13px]">
            Your core traits
          </h2>

          <ul className="mt-3 flex flex-wrap justify-center gap-2">
            {result.traits.map((trait) => (
              <li
                key={trait}
                className="rounded-full border border-white/10 bg-[#1A1A1A] px-3.5 py-2 text-[11px] font-bold leading-none text-[#A7F2FC] md:px-4 md:text-[12px]"
              >
                {trait}
              </li>
            ))}
          </ul>
        </div>

        <ActionButton
          onClick={onContinue}
          className="!mt-8 !h-[52px] !min-h-[52px] !w-full !max-w-[323px] !rounded-[18px] !px-5 !py-2 !text-[18px] md:!mt-8 md:!h-[62px] md:!min-h-[62px] md:!max-w-[376px] md:!rounded-[22px] md:!text-[20px]"
        >
          Continue to RSVP
        </ActionButton>
      </div>
    </section>
  );
}
