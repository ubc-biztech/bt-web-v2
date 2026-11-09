import dynamic from "next/dynamic";
import type { RegistrationQuestion } from "@/types";
import { configurePartnerQuestions } from "./blueprint-2027/partner";
import type { ComponentType } from "react";
import type { PartnerRegistrationFormProps } from "./types";

const BluePrintPartnerRegistration = dynamic<PartnerRegistrationFormProps>(() =>
  import("./blueprint-2027/PartnerRegistration").then(
    ({ BluePrintPartnerRegistration }) => BluePrintPartnerRegistration,
  ),
);

export type PartnerRegistrationFormDefinition = {
  label: string;
  Component: ComponentType<PartnerRegistrationFormProps> | null;
  configureQuestions?: (
    questions: readonly RegistrationQuestion[],
  ) => RegistrationQuestion[];
};

export const PARTNER_REGISTRATION_FORMS = {
  default: {
    label: "Default partner registration form",
    Component: null,
  },
  "blueprint-2027": {
    label: "BluePrint 2027 partner registration form",
    Component: BluePrintPartnerRegistration,
    configureQuestions: configurePartnerQuestions,
  },
} satisfies Record<string, PartnerRegistrationFormDefinition>;

export type PartnerRegistrationFormKey =
  keyof typeof PARTNER_REGISTRATION_FORMS;
export const DEFAULT_PARTNER_REGISTRATION_FORM_KEY: PartnerRegistrationFormKey =
  "default";

export const PARTNER_REGISTRATION_FORM_OPTIONS = Object.entries(
  PARTNER_REGISTRATION_FORMS,
).map(([value, definition]) => ({ value, label: definition.label }));

export function isPartnerRegistrationFormKey(
  value: string,
): value is PartnerRegistrationFormKey {
  return Object.prototype.hasOwnProperty.call(
    PARTNER_REGISTRATION_FORMS,
    value,
  );
}

export function getPartnerRegistrationForm(key?: string) {
  const resolvedKey = key ?? DEFAULT_PARTNER_REGISTRATION_FORM_KEY;
  return isPartnerRegistrationFormKey(resolvedKey)
    ? PARTNER_REGISTRATION_FORMS[resolvedKey]
    : undefined;
}

