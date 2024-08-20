// 
export type BiztechEvent = {
    id: string;
    year: number;
    capac: number;
    createdAt: number;
    description: string;
    elocation: string;
    ename: string;
    startDate: string;
    endDate: string;
    imageUrl: string;
    updatedAt: number;
    isPublished: boolean;
    latitude: number;
    longitude: number;
    facebookUrl: string;
    deadline: string;
    registrationStatus: any;
    registrationQuestion: any;
    pricing: any;
    partnerRegistrationQuestions: RegistrationQuestion[];
    feedback: string;
    partnerDescription: string;
    isApplicationBased: boolean;
    isCompleted: boolean;
    hasDomainSpecificQuestions: boolean;
};

export type RegistrationQuestion = {
    label: string;
    questionId: string;
    type: string;
    required: boolean;
    choices?: string[];
    charLimit?: number;
    questionImageUrl?: string;
}

export enum DBRegistrationStatus {
    WAITLISTED = "waitlist",
    REGISTERED = "registered",
    CHECKED_IN = "checkedIn",
    CANCELLED = "cancelled",
    INCOMPLETE = "incomplete",
}

export type BasicInformation = {
    fname: string;
    lname: string;
    gender: string;
  };
  
export type PartnerBasicInformation = BasicInformation & {
    role: string;
    companyName: string;
  };
  
export type AttendeeBasicInformation = BasicInformation & {
    major: string;
    year: string;
    diet: string;
    heardFrom: string;
    faculty: string;
  };

export type Registration = {
    id: string,
    applicationStatus: string,
    registrationStatus: string,
    basicInformation: AttendeeBasicInformation,
    checkoutLink: string,
    dynamicResponses: {[key: string]: string},
    fname: string,
    isPartner: boolean,
    points: number,
    scannedQRs: string[],
    updatedAt: string,

}

export type StatsChartData = { label: string; value: number };