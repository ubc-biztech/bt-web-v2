import { DBRegistrationStatus, ApplicationStatus } from "@/types";
import { fetchBackend } from "@/lib/db";
import { CLIENT_URL } from "@/lib/dbconfig";
import {
  RegistrationPayload,
  RegistrationStrategy,
} from "./registrationStrategy";

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

  registrationStatus() {
    return this.record?.registrationStatus ?? null;
  }

  applicationStatus() {
    return this.record?.applicationStatus ?? null;
  }

  needsPayment() {
    return (
      this.registrationStatus() === DBRegistrationStatus.ACCEPTED ||
      this.registrationStatus() === DBRegistrationStatus.INCOMPLETE
    );
  }

  needsConfirmation(): boolean {
    return this.registrationStatus() === DBRegistrationStatus.ACCEPTED_PENDING;
  }

  isWaitlisted() {
    return this.registrationStatus() === DBRegistrationStatus.WAITLISTED;
  }
  isCheckedIn() {
    return this.registrationStatus() === DBRegistrationStatus.CHECKED_IN;
  }
  isConfirmed() {
    return this.registrationStatus() === DBRegistrationStatus.ACCEPTED_COMPLETE;
  }

  async regForFree(data: RegistrationPayload): Promise<void> {
    const registrationData = this.buildRegistrationPayload(
      data,
      DBRegistrationStatus.REGISTERED,
      "",
    );

    await this.createRegistration(registrationData);
  }

  async regForFreeApp(data: RegistrationPayload): Promise<void> {
    const registrationData = this.buildRegistrationPayload(
      data,
      DBRegistrationStatus.REGISTERED,
      ApplicationStatus.REVIEWING,
    );

    await this.createRegistration(registrationData);
  }

  async regForPaid(
    data: RegistrationPayload,
  ): Promise<{ paymentUrl?: string }> {
    const registrationData = this.buildRegistrationPayload(
      data,
      DBRegistrationStatus.INCOMPLETE,
      "",
    );

    const res = await this.createRegistration(registrationData);

    if (res?.url) {
      return { paymentUrl: res.url };
    }

    const paymentRes = await fetchBackend({
      endpoint: "/payments",
      method: "POST",
      data: {
        paymentType: "Event",
        success_url: `${
          process.env.NEXT_PUBLIC_REACT_APP_STAGE === "local"
            ? "http://localhost:3000/"
            : CLIENT_URL
        }event/${this.event.id}/${this.event.year}/register/success`,
        email: data?.email ?? this.userEmail,
        fname: data?.fname ?? this.user?.fname,
        eventID: this.event.id,
        year: this.event.year,
      },
      authenticatedCall: false,
    });

    return { paymentUrl: paymentRes?.url ?? paymentRes };
  }

  async regForPaidApp(
    data: RegistrationPayload,
  ): Promise<{ paymentUrl?: string }> {
    const registrationData = this.buildRegistrationPayload(
      data,
      DBRegistrationStatus.INCOMPLETE,
      ApplicationStatus.REVIEWING,
    );

    const res = await this.createRegistration(registrationData);

    if (res?.url) {
      return { paymentUrl: res.url };
    }

    const paymentRes = await fetchBackend({
      endpoint: "/payments",
      method: "POST",
      data: {
        paymentType: "Event",
        success_url: `${
          process.env.NEXT_PUBLIC_REACT_APP_STAGE === "local"
            ? "http://localhost:3000/"
            : CLIENT_URL
        }event/${this.event.id}/${this.event.year}/register/success`,
        email: data?.email ?? this.userEmail,
        fname: data?.fname ?? this.user?.fname,
        eventID: this.event.id,
        year: this.event.year,
      },
      authenticatedCall: false,
    });

    return { paymentUrl: paymentRes?.url ?? paymentRes };
  }

  async confirmAttendance(): Promise<void> {
    const body = {
      eventID: this.event.id,
      year: this.event.year,
      registrationStatus: DBRegistrationStatus.ACCEPTED_COMPLETE,
    };

    await fetchBackend({
      endpoint: `/registrations/${this.userEmail}/${this.user?.fname}`,
      method: "PUT",
      data: body,
    });
  }

  // Caller will need to resolve thrown errors (when fetchBackend fails)
  async confirmAndPay(
    status: DBRegistrationStatus,
  ): Promise<{ paymentUrl?: string }> {
    const paymentData = {
      paymentType: "Event",
      success_url: `${
        process.env.NEXT_PUBLIC_REACT_APP_STAGE === "local"
          ? "http://localhost:3000/"
          : CLIENT_URL
      }event/${this.event.id}/${this.event.year}/register/${status === DBRegistrationStatus.ACCEPTED || status === DBRegistrationStatus.ACCEPTED_PENDING ? "" : "success"}`,
      email: this.userEmail,
      fname: this.user?.fname,
      eventID: this.event.id,
      year: this.event.year,
    };

    const res = await fetchBackend({
      endpoint: "/payments",
      method: "POST",
      data: paymentData,
      authenticatedCall: false,
    });

    return { paymentUrl: res?.url ?? res };
  }
}
