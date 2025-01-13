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
    registrationQuestions?: RegistrationQuestion[];
    pricing: any;
    partnerRegistrationQuestions: RegistrationQuestion[];
    feedback: string;
    partnerDescription: string;
    isApplicationBased: boolean;
    isCompleted: boolean;
    hasDomainSpecificQuestions?: boolean;
    counts?: any;
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

export type UserProfile = {
    name: string;
    role: string;
    hobby: string;
    linkedIn: string;
    funFacts: string[];
    interests: string[];
    additionalLink: string;
    profilePicUrl?: string;
    companyLogoUrl?: string;
    company?: string;
    major?: string;
    year?: string;
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
    fname: string
    lname: string
    major: string
    gender: string
    year: string
    diet: string
    heardFrom: string
    faculty: string
}

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

export enum MemberStatus {
    Member = "Member",
    NonMember = "Non-member",
    BizTechExec = "BizTech Exec"
}

export type Profile = {
    name: string,
    image?: string,
    email: string,
    pronouns: string,
    school: string,
    studentId: string,
    year: string,
    dietary: string,
    faculty: string,
    major: string,
    status: MemberStatus,
};

// Type for the mapping of question IDs to responses
export type UserResponseList = {
    [questionId: string]: string;
};

export type BackendProfile = {
    profileID: string;
    fname: string;
    lname: string;
    pronouns: string;
    type: string;
    major: string;
    year: string;
    hobby1: string;
    hobby2: string;
    funQuestion1: string;
    funQuestion2: string;
    linkedIn: string;
    profilePictureURL: string;
    additionalLink: string;
    "eventID;year": string;
    createdAt: number;
    updatedAt: number;
}
