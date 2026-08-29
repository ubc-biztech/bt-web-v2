import ArchitectMascot from "@/assets/2026/mis-night/architect_mascot.svg";
import DesignerMascot from "@/assets/2026/mis-night/designer_mascot.svg";
import LogicianMascot from "@/assets/2026/mis-night/logicion_mascot.svg";
import MISLogo from "@/assets/2026/mis-night/mis_logo.svg";
import StrategistMascot from "@/assets/2026/mis-night/strategist_mascot.svg";
import VisionaryMascot from "@/assets/2026/mis-night/visionary_mascot.svg";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ActionButton } from "../components/ActionButton";
import styles from "./WelcomePage.module.css";

const MASCOTS = [
  {
    label: "The Architect",
    Mascot: ArchitectMascot,
    centerCorrection: { x: 0.43, y: 1.05 },
  },
  {
    label: "The Logician",
    Mascot: LogicianMascot,
    centerCorrection: { x: 0.71, y: 2.59 },
  },
  {
    label: "The Visionary",
    Mascot: VisionaryMascot,
    centerCorrection: { x: 1.18, y: 2.57 },
  },
  {
    label: "The Strategist",
    Mascot: StrategistMascot,
    centerCorrection: { x: 0.29, y: 2.35 },
  },
  {
    label: "The Designer",
    Mascot: DesignerMascot,
    centerCorrection: { x: 0.05, y: 2.81 },
  },
] as const;

type WelcomePageProps = {
  onContinue: () => void;
};

const MOBILE_CAROUSEL_SLOT = 112;
const MOBILE_CAROUSEL_LENGTH = MOBILE_CAROUSEL_SLOT * MASCOTS.length;
const MOBILE_CAROUSEL_SPEED = 0.07;

function wrapCarouselPosition(position: number) {
  const halfLength = MOBILE_CAROUSEL_LENGTH / 2;

  return (
    ((((position + halfLength) % MOBILE_CAROUSEL_LENGTH) +
      MOBILE_CAROUSEL_LENGTH) %
      MOBILE_CAROUSEL_LENGTH) -
    halfLength
  );
}

type MobileMascotProps = (typeof MASCOTS)[number] & {
  index: number;
  progress: MotionValue<number>;
};

type MascotArtworkProps = Pick<
  MobileMascotProps,
  "Mascot" | "centerCorrection"
> & {
  scale: number;
};

function MascotArtwork({
  Mascot,
  centerCorrection,
  scale,
}: MascotArtworkProps) {
  return (
    <span
      className="pointer-events-none absolute left-1/2 top-1/2 inline-flex"
      style={{
        transform: `translate(calc(-50% + ${centerCorrection.x * scale}px), calc(-50% + ${centerCorrection.y * scale}px))`,
      }}
    >
      <span
        className="inline-flex origin-center"
        style={{ transform: `scale(${scale})` }}
      >
        <Mascot focusable="false" />
      </span>
    </span>
  );
}

function MobileMascot({
  Mascot,
  centerCorrection,
  index,
  progress,
}: MobileMascotProps) {
  const x = useTransform(progress, (currentProgress) =>
    wrapCarouselPosition(index * MOBILE_CAROUSEL_SLOT - currentProgress),
  );
  const distanceFromCenter = useTransform(x, (position) => Math.abs(position));
  const scale = useTransform(
    distanceFromCenter,
    [0, MOBILE_CAROUSEL_SLOT, MOBILE_CAROUSEL_SLOT * 2, 260],
    [1.55, 0.94, 0.82, 0.68],
  );
  const opacity = useTransform(
    distanceFromCenter,
    [0, MOBILE_CAROUSEL_SLOT, MOBILE_CAROUSEL_SLOT * 2, 250],
    [1, 0.96, 0.72, 0],
  );
  const borderColor = useTransform(
    distanceFromCenter,
    [0, MOBILE_CAROUSEL_SLOT * 0.7],
    ["#A8F3FF", "#292929"],
  );
  const zIndex = useTransform(distanceFromCenter, (distance) =>
    distance < MOBILE_CAROUSEL_SLOT / 2 ? 5 : distance < 156 ? 2 : 1,
  );

  return (
    <motion.div
      className={styles.mascot}
      style={{ x, scale, opacity, borderColor, zIndex }}
      aria-hidden="true"
    >
      <MascotArtwork
        Mascot={Mascot}
        centerCorrection={centerCorrection}
        scale={1.6}
      />
    </motion.div>
  );
}

function MobileMascotCarousel({
  shouldReduceMotion,
}: {
  shouldReduceMotion: boolean;
}) {
  const progress = useMotionValue(MOBILE_CAROUSEL_SLOT * 2);

  useAnimationFrame((_time, delta) => {
    if (shouldReduceMotion) return;
    progress.set(progress.get() + delta * MOBILE_CAROUSEL_SPEED);
  });

  return (
    <div
      className={`shrink-0 ${styles.carousel}`}
      aria-label="MIS building block mascots"
    >
      {MASCOTS.map((mascot, index) => (
        <MobileMascot
          key={mascot.label}
          {...mascot}
          index={index}
          progress={progress}
        />
      ))}
    </div>
  );
}

function EventPill({ children }: { children: string }) {
  return (
    <span className="inline-flex h-[25px] bg-[#1A1A1A] items-center gap-2 rounded-full border border-[#98F3FF] px-2.5 text-[11px] font-bold uppercase tracking-[0.035em] text-white">
      <span
        className="size-[6px] rounded-full bg-[#98F3FF]"
        aria-hidden="true"
      />
      {children}
    </span>
  );
}

export function WelcomePage({ onContinue }: WelcomePageProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <section
      data-step="welcome"
      className="flex min-h-[100dvh] w-full flex-col items-center justify-between gap-10 overflow-x-hidden px-6 pb-16 pt-[clamp(8rem,18vh,10rem)] text-center md:gap-12 md:px-10 md:py-[clamp(3rem,7vh,5rem)]"
    >
      <div className="flex shrink-0 flex-col items-center mt-8">
        <div className="flex w-full justify-center">
          <div className={styles.logo}>
            <MISLogo aria-label="MIS Night" />
          </div>
        </div>

        <p className="mt-2 text-[14px] font-normal tracking-[0.01em] text-white/80 md:mt-4 md:text-[20px] sm:text-[16px]">
          Explore the building blocks of business and tech.
        </p>

        <div className="mt-4 hidden flex-wrap items-center justify-center gap-5 md:flex">
          <EventPill>SEP 9</EventPill>
          <EventPill>5:00 PM</EventPill>
          <EventPill>AMS GREAT HALL</EventPill>
        </div>
      </div>

      <div className="flex w-full shrink-0 items-center justify-center">
        <div>
          <MobileMascotCarousel shouldReduceMotion={shouldReduceMotion} />
        </div>

        {/* <Image
          src={FiveMascots}
          alt=""
          className="hidden h-auto w-full max-w-[560px] md:block"
          sizes="(max-width: 768px) 90vw, 560px"
          priority
        /> */}
      </div>

      <div className="flex w-full shrink-0 justify-center">
        <ActionButton
          onClick={onContinue}
          className="
            !h-[54px] !min-h-[54px] !w-full !max-w-[446px]
            !px-6 !py-0 !text-[17px]
            md:!h-[56px] md:!min-h-[56px]
          "
        >
          Start registration
        </ActionButton>
      </div>
    </section>
  );
}
