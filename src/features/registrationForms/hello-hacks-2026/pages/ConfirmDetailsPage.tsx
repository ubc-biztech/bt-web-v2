import type { ReactNode } from "react";
import { ActionButton } from "../components/ActionButton";
import { BackButton } from "../components/BackButton";

type ConfirmDetailsPageProps = {
  children?: ReactNode;
  canContinue: boolean;
  onBack: () => void;
  onContinue: () => void;
};

export function ConfirmDetailsPage({
  children,
  canContinue,
  onBack,
  onContinue,
}: ConfirmDetailsPageProps) {
  return (
    <section data-step="confirm-details">
      <BackButton onClick={onBack} />
      <h1>Confirm your details</h1>
      <p>
        We found your BizTech profile! Please verify your pre-filled details to
        complete your application.
      </p>
      {children}
      <ActionButton disabled={!canContinue} onClick={onContinue}>
        Continue
      </ActionButton>
    </section>
  );
}
