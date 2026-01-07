import {
  DBRegistrationStatus,
  ApplicationStatus,
  BiztechEvent,
  User,
} from "@/types";
import { fetchBackend } from "@/lib/db";

export type RegistrationRecord = {
  registrationStatus: DBRegistrationStatus;
  applicationStatus?: ApplicationStatus;
  isPartner?: boolean;
  points?: number;
  [key: string]: any;
};

export type RegistrationPayload = {
  email: string;
  fname: string;
  studentId?: string | number;
  basicInformation: Record<string, unknown>;
  dynamicResponses?: Record<string, unknown>;
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
    user: User,
  ): Promise<T> {
    const res = await fetchBackend({
      endpoint: `/registrations?email=${userEmail}`,
      method: "GET",
      authenticatedCall: false,
    });

    const record =
      res.data.find(
        (reg: any) => reg["eventID;year"] === `${event.id};${event.year}`,
      ) || null;

    return new this(event, userEmail, user, record);
  }

  protected buildRegistrationPayload(
    data: RegistrationPayload,
    registrationStatus: DBRegistrationStatus,
    applicationStatus: ApplicationStatus | "",
  ): Record<string, unknown> {
    return {
      ...data,
      email: data?.email ?? this.userEmail,
      fname: data?.fname ?? this.user?.fname,
      studentId: data?.studentId ?? this.user?.studentId,
      eventID: this.event.id,
      year: this.event.year,
      registrationStatus,
      isPartner: false,
      points: 0,
      basicInformation: data?.basicInformation ?? {},
      dynamicResponses: data?.dynamicResponses ?? {},
      applicationStatus,
    };
  }

  protected async createRegistration(
    registrationData: Record<string, unknown>,
  ): Promise<any> {
    return fetchBackend({
      endpoint: "/registrations",
      method: "POST",
      data: registrationData,
      authenticatedCall: false,
    });
  }

  exists(): boolean {
    return !!this.record;
  }

  abstract registrationStatus(): any | null;
  abstract applicationStatus(): string | null;
  abstract needsConfirmation(): boolean;
  abstract needsPayment(): boolean;
  abstract isWaitlisted(): boolean;
  abstract isCheckedIn(): boolean;
  abstract isConfirmed(): boolean;
  abstract regForFree(data: RegistrationPayload): Promise<void>;
  abstract regForFreeApp(data: RegistrationPayload): Promise<void>;
  abstract regForPaid(
    data: RegistrationPayload,
  ): Promise<{ paymentUrl?: string }>;
  abstract regForPaidApp(
    data: RegistrationPayload,
  ): Promise<{ paymentUrl?: string }>;
  abstract confirmAttendance(): Promise<void>;
  abstract confirmAndPay(status: any): Promise<{ paymentUrl?: string }>;
}
