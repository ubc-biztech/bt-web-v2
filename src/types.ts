export type RegQuestionAttributes = {
    label: {
        S: string;
    };
    charLimit?: {
        N: string;
    },
    questionId: {
        S: string;
    };
    type: {
        S: string;
    };
    choices: {
        S: string;
    };
    required: {
        BOOL: boolean;
    };
    questionImageUrl?: {
        S?: string;
    };
}

export type RegQuestionData = {
    M: RegQuestionAttributes;
}

export type UserResponse = {
    S: string;
};

export type UserQuestionIDs = {
    [key: string]: UserResponse;
};


