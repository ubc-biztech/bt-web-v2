import { DBRegistrationStatus, ApplicationStatus, BiztechEvent, User } from "@/types";
import { fetchBackend } from "@/lib/db";
import { CLIENT_URL } from "@/lib/dbconfig";
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

  needsConformation(): boolean {
    return this.registrationStatus() === DBRegistrationStatus.ACCEPTED_PENDING;
  }

  isWaitlisted() {
    return this.registrationStatus() === DBRegistrationStatus.WAITLISTED;
  }
  isCheckedIn() {
    return this.registrationStatus() === DBRegistrationStatus.CHECKED_IN;
  }

  

  async regForFree(data: any): Promise<void> {
    const registrationData = {
      ...data,
      email: data?.email ?? this.userEmail,
      fname: data?.fname ?? this.user?.fname,
      studentId: data?.studentId ?? this.user?.studentId,
      eventID: this.event.id,
      year: this.event.year,
      registrationStatus: DBRegistrationStatus.REGISTERED,
      isPartner: false,
      points: 0,
      basicInformation: data?.basicInformation ?? {},
      dynamicResponses: data?.dynamicResponses ?? {},
      applicationStatus: "",
    };

    await fetchBackend({
      endpoint: "/registrations",
      method: "POST",
      data: registrationData,
      authenticatedCall: false,
    });
  }
  
  async regForFreeApp(data: any): Promise<void> {
    const registrationData = {
      ...data,
      email: data?.email ?? this.userEmail,
      fname: data?.fname ?? this.user?.fname,
      studentId: data?.studentId ?? this.user?.studentId,
      eventID: this.event.id,
      year: this.event.year,
      registrationStatus: DBRegistrationStatus.REGISTERED,
      isPartner: false,
      points: 0,
      basicInformation: data?.basicInformation ?? {},
      dynamicResponses: data?.dynamicResponses ?? {},
      applicationStatus: ApplicationStatus.REVIEWING,
    };

    await fetchBackend({
      endpoint: "/registrations",
      method: "POST",
      data: registrationData,
      authenticatedCall: false,
    });
  }

  async regForPaid(data: any): Promise<{ paymentUrl?: string }> {
    const registrationData = {
      ...data,
      email: data?.email ?? this.userEmail,
      fname: data?.fname ?? this.user?.fname,
      studentId: data?.studentId ?? this.user?.studentId,
      eventID: this.event.id,
      year: this.event.year,
      registrationStatus: DBRegistrationStatus.INCOMPLETE,
      isPartner: false,
      points: 0,
      basicInformation: data?.basicInformation ?? {},
      dynamicResponses: data?.dynamicResponses ?? {},
      applicationStatus: "",
    };

    const res = await fetchBackend({
      endpoint: "/registrations",
      method: "POST",
      data: registrationData,
      authenticatedCall: false,
    });

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
  
  async regForPaidApp(data: any): Promise<{ paymentUrl?: string }> {
    const registrationData = {
      ...data,
      email: data?.email ?? this.userEmail,
      fname: data?.fname ?? this.user?.fname,
      studentId: data?.studentId ?? this.user?.studentId,
      eventID: this.event.id,
      year: this.event.year,
      registrationStatus: DBRegistrationStatus.INCOMPLETE,
      isPartner: false,
      points: 0,
      basicInformation: data?.basicInformation ?? {},
      dynamicResponses: data?.dynamicResponses ?? {},
      applicationStatus: ApplicationStatus.REVIEWING,
    };

    const res = await fetchBackend({
      endpoint: "/registrations",
      method: "POST",
      data: registrationData,
      authenticatedCall: false,
    });

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
}
