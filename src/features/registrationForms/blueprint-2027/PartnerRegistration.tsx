import { useMemo } from "react";
import type { BiztechEvent } from "@/types";
import { fetchBackend } from "@/lib/db";
import { uploadRegistrationFile } from "@/lib/registrationUpload";
import type { PartnerRegistrationFormProps } from "../types";
import { BluePrintPartnerRegistrationForm } from "./PartnerRegistrationForm";
import { createPartnerSubmitter, resolvePartnerQuestionIds } from "./partner";

function LivePartnerRegistration({ event }: { event: BiztechEvent }) {
  const submit = useMemo(
    () =>
      createPartnerSubmitter({
        event,
        questions: event.partnerRegistrationQuestions ?? [],
        checkRegistered: async (email) => {
          const registrations = await fetchBackend({
            endpoint: `/registrations?email=${encodeURIComponent(email)}`,
            method: "GET",
            authenticatedCall: false,
          });
          return registrations.data.some(
            (registration: { "eventID;year": string }) =>
              registration["eventID;year"] === `${event.id};${event.year}`,
          );
        },
        upload: (file) => uploadRegistrationFile(file, event.id),
        register: async (data) => {
          await fetchBackend({
            endpoint: "/registrations",
            method: "POST",
            data,
            authenticatedCall: false,
          });
        },
      }),
    [event],
  );

  try {
    resolvePartnerQuestionIds(event.partnerRegistrationQuestions ?? []);
  } catch {
    return (
      <p role="alert" className="p-6 text-white">
        This event&apos;s partner questions are not configured correctly. Please
        contact an organizer.
      </p>
    );
  }
  return <BluePrintPartnerRegistrationForm mode="live" onSubmit={submit} />;
}

export function BluePrintPartnerRegistration(
  props: PartnerRegistrationFormProps,
) {
  return props.mode === "preview" ? (
    <BluePrintPartnerRegistrationForm mode="preview" />
  ) : (
    <LivePartnerRegistration event={props.event} />
  );
}
