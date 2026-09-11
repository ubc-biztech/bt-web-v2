import { ActionButton } from "../components/ActionButton";

type SuccessPageProps = {
  onViewApplication?: () => void;
};

export function SuccessPage({ onViewApplication }: SuccessPageProps) {
  return (
    <section data-step="success" aria-live="polite">
      <h1>Application sent!</h1>
      <p>
        Thank you for applying to HelloHacks! Keep an eye on your inbox — we’ll
        be in touch shortly.
      </p>
      {onViewApplication ? (
        <ActionButton onClick={onViewApplication}>
          View Application
        </ActionButton>
      ) : null}
    </section>
  );
}
