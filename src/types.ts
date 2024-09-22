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
    latitude?: number;
    longitude?: number;
    facebookUrl?: string;
    deadline: string;
    registrationQuestions: RegistrationQuestion[];
    pricing: any;
    partnerRegistrationQuestions: RegistrationQuestion[];
    feedback: string;
    partnerDescription: string;
    isApplicationBased: boolean;
    isCompleted: boolean;
    hasDomainSpecificQuestions?: boolean;
    counts: any;
};

export type RegistrationQuestion = {
    label: string;
    questionId: string;
    type: string;
    required: boolean;
    choices?: string;
    charLimit?: number;
    questionImageUrl?: string;
    participantCap?: string;
    isSkillsQuestion?: boolean;
}

export enum DBRegistrationStatus {
    WAITLISTED = "waitlist",
    REGISTERED = "registered",
    CHECKED_IN = "checkedIn",
    CANCELLED = "cancelled",
    INCOMPLETE = "incomplete",
}

export enum RegistrationStatusField {
    WAITLISTED = "Waitlisted",
    REGISTERED = "Registered",
    CHECKED_IN = "Checked In",
    CANCELLED = "Cancelled",
    INCOMPLETE = "Incomplete",
}

export enum ApplicationStatus {
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    WAITLIST = "waitlist",
    REVIEWING = "reviewing"
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

export type User = {
    id: string;
    isMember?: boolean;
    fname?: string;
    education?: string;
    gender?: string;
    year?: string;
    admin?: boolean;
    faculty?: string;
    studentId?: number;
    createdAt?: number;
    lname?: string;
    major?: string;
    diet?: string;
    updatedAt?: number;
    email?: string;
}