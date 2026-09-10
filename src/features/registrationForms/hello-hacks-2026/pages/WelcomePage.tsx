import { ActionButton } from "../components/ActionButton";

type WelcomePageProps = {
  onContinue: () => void;
};

export function WelcomePage({ onContinue }: WelcomePageProps) {
  return (
    <section data-step="welcome">
      <h1>Welcome to HelloHacks</h1>
      <p>[Insert tagline]</p>
      <ActionButton onClick={onContinue}>Get Started</ActionButton>
    </section>
  );
}
