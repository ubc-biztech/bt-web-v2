import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { RegistrationQuestion } from "@/types";
import type { RegistrationFormProps } from "./types";
import { MISRegistrationForm } from "./mis-2026/RegistrationForm";
import { MIS_REGISTRATION_QUESTIONS } from "./mis-2026/Definition";

const DefaultRegistrationForm = dynamic(() =>
  import("@/components/Events/AttendeeEventRegistrationForm").then(
    ({ AttendeeEventRegistrationForm }) => AttendeeEventRegistrationForm,
  ),
);

export type RegistrationFormDefinition = {
  label: string;
  Component: ComponentType<RegistrationFormProps>;
  questions?: readonly RegistrationQuestion[];
};

export const REGISTRATION_FORMS = {
  default: {
    label: "Default registration form",
    Component: DefaultRegistrationForm,
  },

  "mis-night-2026": {
    label: "MIS 2026 registration form",
    Component: MISRegistrationForm,
    questions: MIS_REGISTRATION_QUESTIONS,
  },
} as const satisfies Record<string, RegistrationFormDefinition>;

export type RegistrationFormKey = keyof typeof REGISTRATION_FORMS;

export const DEFAULT_REGISTRATION_FORM_KEY: RegistrationFormKey = "default";

export const REGISTRATION_FORM_OPTIONS = Object.entries(REGISTRATION_FORMS).map(
  ([value, definition]) => ({
    value,
    label: definition.label,
  }),
);

export function isRegistrationFormKey(
  value: string,
): value is RegistrationFormKey {
  return Object.prototype.hasOwnProperty.call(REGISTRATION_FORMS, value);
}

export function getRegistrationForm(key?: string) {
  const resolvedKey = key ?? DEFAULT_REGISTRATION_FORM_KEY;

  return isRegistrationFormKey(resolvedKey)
    ? REGISTRATION_FORMS[resolvedKey]
    : undefined;
}
