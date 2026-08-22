import type { ReactNode } from "react";
import { ActionButton } from "../components/ActionButton";
import { BackButton } from "../components/BackButton";

type RSVPPageProps = {
  children?: ReactNode;
  submitting: boolean;
  onBack: () => void;
};

export function RSVPPage({ children, submitting, onBack }: RSVPPageProps) {
  return (
    <section data-step="rsvp">
      <BackButton onClick={onBack} />
      <h1>RSVP</h1>
      {children}
      <ActionButton type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit RSVP"}
      </ActionButton>
    </section>
  );
}
