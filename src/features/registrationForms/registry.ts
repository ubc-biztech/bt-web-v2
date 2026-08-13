import dynamic from "next/dynamic";
import type { RegistrationQuestion } from "@/types";

const DefaultRegistrationForm = dynamic(() =>
  import("@/components/Events/AttendeeEventRegistrationForm").then(
    ({ AttendeeEventRegistrationForm }) => AttendeeEventRegistrationForm,
  ),
);

export type RegistrationFormDefinition = {
  label: string;
  Component: typeof DefaultRegistrationForm;
  questions?: readonly RegistrationQuestion[];
};

export const REGISTRATION_FORMS = {
  default: {
    label: "Default registration form",
    Component: DefaultRegistrationForm,
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
