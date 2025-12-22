import { DBRegistrationStatus, ApplicationStatus, BiztechEvent, User } from "@/types";
import { fetchBackend } from "@/lib/db";
import { RegistrationStrategy } from "./registrationStrategy";

export type RegistrationRecord = {
  registrationStatus: DBRegistrationStatus;
  applicationStatus?: ApplicationStatus;
  isPartner?: boolean;
  points?: number;
  [key: string]: any;
};

export class RegistrationStateOld extends RegistrationStrategy {

  exists() {
    return !!this.record;
  }

  status() {
    return this.record?.registrationStatus ?? null;
  }
  applicationStatus() {
    return this.record?.applicationStatus ?? null;
  }

  isAcceptedPending() {
    return this.status() === DBRegistrationStatus.ACCEPTED_PENDING;
  }
  needsPayment() {
    return (
      this.status() === DBRegistrationStatus.ACCEPTED ||
      this.status() === DBRegistrationStatus.INCOMPLETE
    );
  }
  isWaitlisted() {
    return this.status() === DBRegistrationStatus.WAITLISTED;
  }
  isCheckedIn() {
    return this.status() === DBRegistrationStatus.CHECKED_IN;
  }
}
