import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ActionButton } from "../components/ActionButton";
import styles from "./WelcomePage.module.css";

type WelcomePageProps = {
  onContinue: () => void;
};

const WELCOME_ASSET_PATH = "/assets/2026/hello-hacks/welcome";

const DOCK_ICONS = [
  { src: `${WELCOME_ASSET_PATH}/dock-phone.png`, alt: "Phone" },
  { src: `${WELCOME_ASSET_PATH}/dock-safari.png`, alt: "Safari" },
  {
    src: `${WELCOME_ASSET_PATH}/dock-biztech-3x.png`,
    alt: "BizTech",
  },
  { src: `${WELCOME_ASSET_PATH}/dock-music.png`, alt: "Music" },
  { src: `${WELCOME_ASSET_PATH}/dock-mail.png`, alt: "Mail" },
  { src: `${WELCOME_ASSET_PATH}/dock-photos.png`, alt: "Photos" },
  { src: `${WELCOME_ASSET_PATH}/dock-notes.png`, alt: "Notes" },
];

export function WelcomePage({ onContinue }: WelcomePageProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section data-step="welcome" className={styles.screen}>
      <div className={styles.statusStrip} aria-hidden="true">
        <span>9:26</span>
        <Image
          src={`${WELCOME_ASSET_PATH}/mobile-status-icons.svg`}
          alt=""
          width={94}
          height={24}
        />
      </div>
      <div className={styles.hero}>
        <h1 className={styles.heading}>Welcome to</h1>

        <div role="img" aria-label="HelloHacks" className={styles.logo}>
          <motion.div
            className={styles.hello}
            initial={
              shouldReduceMotion ? false : { clipPath: "inset(0 100% 0 0)" }
            }
            animate={
              shouldReduceMotion ? undefined : { clipPath: "inset(0 0% 0 0)" }
            }
            transition={{
              duration: 1.98,
              ease: [0.22, 0.61, 0.36, 1],
              repeat: Infinity,
              repeatDelay: 5.52,
            }}
          >
            <Image
              src={`${WELCOME_ASSET_PATH}/hello-script.svg`}
              alt=""
              width={353}
              height={111}
              priority
              className="h-full w-full"
            />
          </motion.div>

          <motion.div
            className={styles.hacks}
            initial={shouldReduceMotion ? false : { opacity: 0, y: -60 }}
            animate={
              shouldReduceMotion
                ? undefined
                : { opacity: [0, 0, 1, 1], y: [-60, -60, 0, 0] }
            }
            transition={{
              duration: 7.5,
              times: [0, 0.22, 0.38, 1],
              ease: "easeOut",
              repeat: Infinity,
            }}
          >
            <Image
              src={`${WELCOME_ASSET_PATH}/hacks-mark.svg`}
              alt=""
              width={298}
              height={74}
              priority
              className="h-full w-full"
            />
          </motion.div>
        </div>

        <p className={styles.tagline}>Start Anywhere. Build Anything.</p>

        <ActionButton onClick={onContinue} className={styles.button}>
          Get Started
        </ActionButton>
      </div>

      <div aria-hidden="true" className={styles.dock}>
        {DOCK_ICONS.map((icon, index) => (
          <div
            key={icon.src}
            className={`${styles.dockIcon} ${index > 3 ? styles.desktopIcon : ""} ${index === 2 ? styles.biztechIcon : ""}`}
          >
            <Image
              src={icon.src}
              alt={icon.alt}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
