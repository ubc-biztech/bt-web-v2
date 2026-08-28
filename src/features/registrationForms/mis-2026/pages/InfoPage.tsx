import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { BUILDING_BLOCK_LIST } from "../buildingBlocks";
import { ActionButton } from "../components/ActionButton";
import { BackButton } from "../components/BackButton";

type InfoPageProps = {
  onBack: () => void;
  onContinue: () => void;
};

type SlideDirection = -1 | 1;

const cardVariants = {
  enter: (direction: number) => ({
    x: direction * 52,
    opacity: 0,
    scale: 0.985,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction * -52,
    opacity: 0,
    scale: 0.985,
  }),
};

export function InfoPage({ onBack, onContinue }: InfoPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<SlideDirection>(1);
  const shouldReduceMotion = useReducedMotion() ?? false;
  const currentBlock = BUILDING_BLOCK_LIST[currentIndex];
  const Mascot = currentBlock.image;

  function showPreviousBlock() {
    setDirection(-1);
    setCurrentIndex(
      (index) =>
        (index - 1 + BUILDING_BLOCK_LIST.length) % BUILDING_BLOCK_LIST.length,
    );
  }

  function showNextBlock() {
    setDirection(1);
    setCurrentIndex((index) => (index + 1) % BUILDING_BLOCK_LIST.length);
  }

  function showBlock(index: number) {
    if (index === currentIndex) return;

    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }

  return (
    <section
      data-step="info"
      className="flex min-h-[100dvh] w-full flex-col px-6 pb-[clamp(2rem,7dvh,3.75rem)] pt-[clamp(2.75rem,8dvh,4.5rem)] md:h-[100dvh] md:min-h-0 md:overflow-hidden md:px-10 md:py-[clamp(2rem,7dvh,3.75rem)]"
    >
      <div className="mx-auto flex w-full max-w-[422px] flex-1 flex-col md:max-w-[1007px]">
        <div className="flex items-center justify-between">
          <BackButton onClick={onBack} />

          <span className="text-[14px] font-medium leading-none tracking-normal text-[#98F3FF]/70">
            Step 1 of 3
          </span>
        </div>

        <h1 className="mt-9 text-[24px] font-bold leading-tight tracking-[-0.01em] text-[#98F3FF] md:text-[36px]">
          Meet the Building Blocks
        </h1>

        <p className="mt-3 text-[16px] font-normal leading-[1.4] text-white/80 md:mt-2 md:text-[16px]">
          See how different building blocks shape technology at MIS Night. Here
          are the 5 archetypes:
        </p>

        <div
          className="mx-auto mt-[clamp(1.5rem,5dvh,3rem)] w-full max-w-[410px] md:mt-10 md:max-w-[670px]"
          role="region"
          aria-label="Building block carousel"
          aria-roledescription="carousel"
        >
          <div className="grid grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-4 md:grid-cols-[44px_minmax(0,1fr)_44px] md:gap-6">
            <button
              type="button"
              onClick={showPreviousBlock}
              aria-label="Show previous building block"
              className="group flex size-10 items-center justify-center rounded-full border border-white/10 bg-[#1A1A1A] text-[#98F3FF] transition-all duration-200 hover:border-[#98F3FF]/40 hover:bg-[#242424] active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#98F3FF]/30 md:size-11"
            >
              <ChevronLeft
                className="size-5 transition-transform duration-200 group-hover:-translate-x-0.5"
                aria-hidden="true"
              />
            </button>

            <article
              aria-live="polite"
              aria-label={`${currentBlock.header}, ${currentIndex + 1} of ${BUILDING_BLOCK_LIST.length}`}
              className="relative h-[clamp(360px,43dvh,380px)] min-h-0 overflow-hidden rounded-[20px] border-2 border-[#98F3FF] bg-[#1A1A1A] md:h-[clamp(320px,42dvh,332px)] md:max-h-[332px]"
            >
              <AnimatePresence
                initial={false}
                custom={shouldReduceMotion ? 0 : direction}
              >
                <motion.div
                  key={currentBlock.header}
                  custom={shouldReduceMotion ? 0 : direction}
                  variants={cardVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0.12 }
                      : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
                  }
                  className="absolute inset-0 flex h-full flex-col items-center justify-center px-5 py-5 text-center md:px-10 md:py-5 md:text-left"
                >
                  <div className="flex w-full flex-col items-center gap-1 md:flex-row md:gap-9">
                    <div className="flex h-[124px] w-[136px] shrink-0 items-center justify-center md:h-[190px] md:w-[210px]">
                      <span className="inline-flex origin-center scale-[2.75] md:scale-[4.25]">
                        <Mascot focusable="false" aria-hidden="true" />
                      </span>
                    </div>

                    <div className="min-w-0 text-center md:text-left">
                      <h2 className="text-[18px] font-bold leading-tight text-white md:text-[24px]">
                        {currentBlock.header}
                      </h2>

                      <p className="mt-3 text-[12px] font-normal leading-[1.35] text-white/75 md:text-[14px] md:leading-[1.4]">
                        {currentBlock.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex w-full min-w-0 flex-col items-center md:mt-6">
                    <h3 className="text-[12px] font-bold leading-none text-[#98F3FF] md:text-[14px]">
                      Potential roles
                    </h3>

                    <ul className="mt-2 flex flex-wrap justify-center gap-1 md:gap-2">
                      {currentBlock.potentialRoles.map((role) => (
                        <li
                          key={role}
                          className="rounded-full border border-white/30 bg-white/[0.06] px-1.5 py-1 text-[9px] leading-none text-white/80 md:text-[11px] md:px-2.5"
                        >
                          {role}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </AnimatePresence>
            </article>

            <button
              type="button"
              onClick={showNextBlock}
              aria-label="Show next building block"
              className="group flex size-10 items-center justify-center rounded-full border border-white/10 bg-[#1A1A1A] text-[#98F3FF] transition-all duration-200 hover:border-[#98F3FF]/40 hover:bg-[#242424] active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#98F3FF]/30 md:size-11"
            >
              <ChevronRight
                className="size-5 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </button>
          </div>

          <div
            className="mt-[clamp(1.25rem,3dvh,2rem)] flex items-center justify-center gap-3 md:mt-10"
            aria-label="Choose a building block"
          >
            {BUILDING_BLOCK_LIST.map((block, index) => {
              const isCurrent = currentIndex === index;

              return (
                <button
                  key={block.header}
                  type="button"
                  onClick={() => showBlock(index)}
                  aria-label={`Show ${block.header}`}
                  aria-current={isCurrent ? "true" : undefined}
                  className={`size-2.5 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#98F3FF]/30 ${
                    isCurrent
                      ? "scale-110 bg-[#98F3FF]"
                      : "bg-white/25 hover:bg-white/45"
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div className="mt-[clamp(2.5rem,6dvh,4rem)] flex justify-center md:mt-6 md:justify-end">
          <ActionButton
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
