import Link from "next/link";

type RegistrationSuccessPageProps = {
  eventId: string;
  year: string;
};

/**
 * Route-level success screen for `/event/[eventId]/[year]/register/success`.
 * The registration page redirects here after a successful submit, so this — not
 * the in-flow `SuccessPage` step — is the screen applicants actually land on.
 */
export function HelloHacksRegistrationSuccessPage({
  eventId,
  year,
}: RegistrationSuccessPageProps) {
  return (
    <section data-page="hello-hacks-success" aria-live="polite">
      <h1>Application sent!</h1>
      <p>
        Thank you for applying to HelloHacks. We&apos;ll let you know your
        status by [date].
      </p>
      <Link href={`/event/${eventId}/${year}`}>View Application</Link>
    </section>
  );
}
