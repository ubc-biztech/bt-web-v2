import Image from "next/image";
import { useEffect, useRef } from "react";
import { PARTNER_COMPLETION, PARTNER_CONTACT_EMAIL } from "./partnerFlow";
import styles from "./PartnerRegistrationForm.module.css";

export function PartnerRegistrationComplete({
  email,
  preview,
}: {
  email: string;
  preview: boolean;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);
  return (
    <div role="status" className={styles.completion}>
      <Image
        src={PARTNER_COMPLETION.image}
        alt={PARTNER_COMPLETION.imageAlt}
        width={320}
        height={320}
        className={styles.completionImage}
      />
      <h2 ref={heading} tabIndex={-1} className={styles.title}>
        {preview ? "Preview complete" : "Registration submitted"}
      </h2>
      <p>
        Thank you for your registration for BluePrint Tech Week 2027. We will send any further information to {email}. If you have any questions, please reach out to us at{" "}
        <a
          href={`mailto:${PARTNER_CONTACT_EMAIL}`}
          className={styles.contactLink}
        >
          {PARTNER_CONTACT_EMAIL}
        </a>
        .
      </p>
      {preview && <p>Preview only. Nothing was saved.</p>}
    </div>
  );
}
