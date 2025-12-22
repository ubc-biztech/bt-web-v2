import { DBRegistrationStatus, ApplicationStatus, BiztechEvent, User } from "@/types";
import { fetchBackend } from "@/lib/db";

export type RegistrationRecord = {
  registrationStatus: DBRegistrationStatus;
  applicationStatus?: ApplicationStatus;
  isPartner?: boolean;
  points?: number;
  [key: string]: any;
};

export abstract class RegistrationStrategy {
  constructor(
    protected event: BiztechEvent,
    protected userEmail: string,
    protected user: User,
    protected record: RegistrationRecord | null,
  ) {}

  static async load<T extends RegistrationStrategy>(
    this: new (...args: any[]) => T,
    event: BiztechEvent,
    userEmail: string,
    user: User
  ): Promise<T> {
    const res = await fetchBackend({
      endpoint: `/registrations?email=${userEmail}`,
      method: "GET",
      authenticatedCall: false,
    });

    const record = res.data.find(
      (reg: any) => reg["eventID;year"] === `${event.id};${event.year}`
    ) || null;

    return new this(event, userEmail, user, record);
  }

  exists(): boolean {
    return !!this.record;
  }

  abstract status(): DBRegistrationStatus | null;
  abstract applicationStatus(): string | null;
  abstract isAcceptedPending(): boolean;
  abstract needsPayment(): boolean;
  abstract isWaitlisted(): boolean;
  abstract isCheckedIn(): boolean;
}

