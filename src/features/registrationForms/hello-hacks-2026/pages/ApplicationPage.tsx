import type { ReactNode } from "react";
import { ActionButton } from "../components/ActionButton";
import { BackButton } from "../components/BackButton";

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
    <section data-step="application">
      <BackButton onClick={onBack} />
      <h1>Your application</h1>
      <p>Help us get to know you better.</p>
      {children}
      <ActionButton disabled={!canContinue} onClick={onContinue}>
        Continue
      </ActionButton>
    </section>
  );
}
