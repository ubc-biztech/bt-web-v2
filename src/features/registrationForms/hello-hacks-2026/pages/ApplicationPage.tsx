import type { ReactNode } from "react";
import Image from "next/image";
import { ActionButton } from "../components/ActionButton";
import { BackButton } from "../components/BackButton";
import styles from "./ApplicationPage.module.css";

type ApplicationPageProps = {
  children?: ReactNode;
  canContinue: boolean;
  onBack: () => void;
  onContinue: () => void;
};

export function ApplicationPage({
  children,
  canContinue,
  onBack,
  onContinue,
}: ApplicationPageProps) {
  return (
    <section data-step="application" className={styles.page}>
      <div className={styles.content}>
        <span className={styles.status} aria-hidden="true">
          <span>9:26</span>
          <Image
            src="/assets/2026/hello-hacks/confirm-details/mobile-status-icons.svg"
            alt=""
            width={94}
            height={24}
            className={styles.statusIcons}
          />
        </span>

        <header className={styles.header}>
          <BackButton onClick={onBack} className={styles.backButton} />
          <h1 id="application-heading" className={styles.heading}>
            Your application
          </h1>
          <p className={styles.subtitle}>Help us get to know you better.</p>
        </header>

        <div
          className={styles.card}
          role="group"
          aria-labelledby="application-heading"
        >
          {children}
        </div>

        <ActionButton
          disabled={!canContinue}
          onClick={onContinue}
          className={styles.continue}
        >
          Continue
        </ActionButton>
      </div>
    </section>
  );
}
