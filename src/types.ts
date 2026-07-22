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
  attendeeFeedbackEnabled?: boolean;
  partnerFeedbackEnabled?: boolean;
  attendeeFeedbackQuestions?: FeedbackQuestion[];
  partnerFeedbackQuestions?: FeedbackQuestion[];
  partnerDescription: string;
  isApplicationBased: boolean;
  nonBizTechAllowed: boolean;
  isCompleted: boolean;
  hasDomainSpecificQuestions?: boolean;
  counts?: any;
  registrationQuestionsAlternate?: RegistrationQuestion[] | string;
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
};

export type FeedbackQuestion = {
  label: string;
  questionId: string;
  type:
    | "SHORT_TEXT"
    | "LONG_TEXT"
    | "MULTIPLE_CHOICE"
    | "CHECKBOXES"
    | "LINEAR_SCALE";
  required: boolean;
  choices?: string;
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
};

export type UserProfile = {
  profileID: string;
  compositeID?: string;
  fname?: string;
  lname?: string;
  pronouns?: string;
  type: "ATTENDEE" | "EXEC" | "PARTNER";
  hobby1?: string;
  hobby2?: string;
  funQuestion1?: string;
  funQuestion2?: string;
  linkedIn?: string;
  profilePictureURL?: string;
  additionalLink?: string;
  resumeURL?: string;
  description?: string;
  major?: string;
  year?: string | number;
  eventIDYear?: string;
  name?: string;
  role?: string;
  createdAt?: number;
  updatedAt?: number;
  company?: string;
  companyProfileID?: string;
  companyProfilePictureURL?: string;
  viewableMap?: Record<string, boolean>;
};

export enum DBRegistrationStatus {
  WAITLISTED = "waitlist",
  REGISTERED = "registered",
  CHECKED_IN = "checkedIn",
  CANCELLED = "cancelled",
  INCOMPLETE = "incomplete",
  ACCEPTED = "accepted",
  ACCEPTED_PENDING = "acceptedPending",
  ACCEPTED_COMPLETE = "acceptedComplete",
}

export enum RegistrationStatusField {
  WAITLISTED = "Waitlisted",
  REGISTERED = "Registered",
  CHECKED_IN = "Checked-In",
  CANCELLED = "Cancelled",
  INCOMPLETE = "Incomplete",
}

export enum ApplicationStatus {
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  WAITLIST = "waitlist",
  REVIEWING = "reviewing",
}

export type BasicInformation = {
  fname: string;
  lname: string;
  major: string;
  gender: string;
  year: string;
  diet: string;
  heardFrom: string;
  faculty: string;
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
  profileID?: string;
  fname?: string;
  education?: string;
  gender?: string;
  year?: string | number;
  admin?: boolean;
  faculty?: string;
  studentId?: string | number;
  createdAt?: number;
  lname?: string;
  major?: string;
  diet?: string;
  updatedAt?: number;
  email?: string;
  image?: string;
  "favedEventsID;year"?: string[];
};

export enum MemberStatus {
  Member = "Member",
  NonMember = "Non-member",
  BizTechExec = "BizTech Exec",
}

// Type for the mapping of question IDs to responses
export type UserResponseList = {
  [questionId: string]: string;
};

export type BackendProfile = {
  profileID?: string;
  compositeID?: string;
  fname?: string;
  lname?: string;
  pronouns?: string;
  profileType: "ATTENDEE" | "EXEC" | "PARTNER";
  hobby1?: string;
  hobby2?: string;
  funQuestion1?: string;
  funQuestion2?: string;
  linkedIn?: string;
  profilePictureURL?: string;
  additionalLink?: string;
  resumeURL?: string;
  description?: string;
  major?: string;
  year?: string | number;
  eventIDYear?: string;
  position?: string;
  name?: string;
  createdAt?: number;
  updatedAt?: number;
  company?: string;
  companyProfileID?: string;
  companyProfilePictureURL?: string;
  viewableMap?: Record<string, boolean>;
};

export type Member = {
  id: string;
  cardCount: number;
  admin?: boolean;
  createdAt?: number;
  diet?: string;
  discordId?: string;
  education?: string;
  faculty?: string;
  firstName?: string;
  heardFrom?: string;
  heardFromSpecify?: string;
  highSchool?: string;
  international?: boolean;
  lastName?: string;
  major?: string;
  prevMember?: boolean;
  profileType?: "ATTENDEE" | "EXEC" | "PARTNER";
  pronouns?: string;
  studentNumber?: string | number;
  topics?: string[];
  university?: string;
  updatedAt?: number;
  year?: string | number;
};
