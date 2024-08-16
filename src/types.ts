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

export type RegistrationQuestion = {
    label: string;
    questionId: string;
    type: string;
    required: boolean;
    choices?: string[];
    charLimit?: number;
    questionImageUrl?: string;
    participantCap?: string;
    isSkillsQuestion?: boolean;
}

type UserResponse = {
    S: string;
};

// Type for the mapping of question IDs to responses
export type UserResponseList = {
    [questionId: string]: UserResponse;
};


