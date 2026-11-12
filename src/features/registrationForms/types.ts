import type { BiztechEvent, User } from "@/types";
import type { RegistrationPayload } from "@/lib/registrationStrategy/registrationStrategy";

export type RegistrationFormProps = {
  event: BiztechEvent;
  user: User;
  hasMembership: boolean;
  submitting: boolean;
  onSubmit: (payload: RegistrationPayload) => Promise<boolean>;
};

export type PartnerRegistrationFormProps =
  | { mode: "preview" }
  | { mode: "live"; event: BiztechEvent };
