import { DBRegistrationStatus, ApplicationStatus, BiztechEvent, User } from "@/types";
import { fetchBackend } from "@/lib/db";

export type RegistrationRecord = {
  registrationStatus: any;
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

  abstract registrationStatus(): any | null;
  abstract applicationStatus(): string | null;
  abstract needsConformation(): boolean;
  abstract needsPayment(): boolean;
  abstract isWaitlisted(): boolean;
  abstract isCheckedIn(): boolean;
  abstract isConfirmed(): boolean;
  abstract regForFree(data: any): Promise<void>;
  abstract regForFreeApp(data: any): Promise<void>;
  abstract regForPaid(data: any): Promise<{ paymentUrl?: string }>;
  abstract regForPaidApp(data: any): Promise<{ paymentUrl?: string }>;
  abstract confirmAttendance(): Promise<void>;
  abstract confirmAndPay(
    status: any,
  ): Promise<{ paymentUrl?: string }>;
}
