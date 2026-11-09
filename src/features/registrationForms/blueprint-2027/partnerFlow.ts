import type { BluePrintPartnerRegistrationValues } from "./Definition";

export const PARTNER_CONTACT_EMAIL = "blueprint@ubcbiztech.com";

export const PARTNER_COMPLETION = {
  image: "/assets/2027/blueprint/blueprint-registration-placeholder.svg",
  imageAlt: "BluePrint illustration placeholder",
};

export const PARTNER_WELCOME = {
  video: "/assets/2027/blueprint/blueprint-registration-welcome.mp4",
  poster: "/assets/2027/blueprint/blueprint-registration-welcome-poster.jpg",
  title: "BluePrint Tech Week 2027 Partner Registration",
  body: "Thank you for your interest in partnering with BluePrint Tech Week 2027! Please fill out the following form to register as a partner. We look forward to collaborating with you and making this event a success. If you have any trouble filling out the form, please reach out to us at",
};

export const PARTNER_GROUPS = [
  {
    id: "personal",
    label: "Personal details",
    description: "Let us know who you are and how to reach you.",
  },
  {
    id: "professional",
    label: "Professional details",
    description: "Tell attendees about your work and experience.",
  },
  {
    id: "logistics",
    label: "Event logistics",
    description: "A few details to help us prepare for your visit.",
  },
] as const;

export type PartnerGroupId = (typeof PARTNER_GROUPS)[number]["id"];
export type PartnerQuestionField = Exclude<
  keyof BluePrintPartnerRegistrationValues,
  | "otherPronoun"
  | "otherExpertise"
  | "otherDietaryRestrictions"
  | "participatingIndependently"
>;

type QuestionBase = {
  group: PartnerGroupId;
  label: string;
  required: boolean;
  description?: string;
};

export type PartnerQuestion = QuestionBase &
  (
    | {
        kind: "input";
        field:
          | "firstName"
          | "lastName"
          | "email"
          | "companyName"
          | "role"
          | "linkedin"
          | "nametag";
        type: "text" | "email" | "url";
        placeholder: string;
        autoComplete: string;
      }
    | {
        kind: "choice";
        field: "pronouns" | "dietaryRestrictions" | "coffeeChatInterest";
        columns: 1 | 2;
      }
    | {
        kind: "multiple-choice";
        field: "areasOfExpertise";
        columns: 1 | 2;
      }
    | { kind: "upload"; field: "headshot"; accept: string }
    | {
        kind: "textarea";
        field: "askMeAbout";
        placeholder: string;
        hint: string;
      }
  );

export const PARTNER_QUESTIONS = [
  {
    field: "firstName",
    group: "personal",
    label: "First name",
    required: true,
    kind: "input",
    type: "text",
    placeholder: "John",
    autoComplete: "given-name",
  },
  {
    field: "lastName",
    group: "personal",
    label: "Last name",
    required: true,
    kind: "input",
    type: "text",
    placeholder: "Grey",
    autoComplete: "family-name",
  },
  {
    field: "email",
    group: "personal",
    label: "Email",
    required: true,
    kind: "input",
    type: "email",
    placeholder: "john@ubcbiztech.com",
    autoComplete: "email",
  },
  {
    field: "pronouns",
    group: "personal",
    label: "What are your pronouns?",
    required: true,
    kind: "choice",
    columns: 2,
  },
  {
    field: "companyName",
    group: "professional",
    label: "What organization are you with?",
    required: true,
    kind: "input",
    type: "text",
    placeholder: "UBC BizTech",
    autoComplete: "organization",
  },
  {
    field: "role",
    group: "professional",
    label: "What is your role?",
    required: true,
    kind: "input",
    type: "text",
    placeholder: "e.g. Software Engineer",
    autoComplete: "organization-title",
  },
  {
    field: "linkedin",
    group: "professional",
    label: "LinkedIn",
    required: true,
    kind: "input",
    type: "url",
    placeholder: "john-grey",
    autoComplete: "url",
  },
  {
    field: "areasOfExpertise",
    group: "professional",
    label: "What are your areas of expertise?",
    required: true,
    description: "Select all that apply.",
    kind: "multiple-choice",
    columns: 2,
  },
  {
    field: "headshot",
    group: "professional",
    label: "Headshot",
    required: true,
    description:
      "Give us permission to use your LinkedIn headshot, or upload a JPEG or PNG up to 10 MB.",
    kind: "upload",
    accept: "image/jpeg,image/jpg,image/png",
  },
  {
    field: "nametag",
    group: "logistics",
    label: "What name should we put on your nametag?",
    required: true,
    kind: "input",
    type: "text",
    placeholder: "John Grey",
    autoComplete: "nickname",
  },
  {
    field: "dietaryRestrictions",
    group: "logistics",
    label: "Do you have any dietary restrictions?",
    required: true,
    kind: "choice",
    columns: 2,
  },
  {
    field: "coffeeChatInterest",
    group: "logistics",
    label: "Would you like to participate in coffee chats?",
    required: true,
    description:
      "During open networking periods, in addition to your current role. Attendees can request a chat through the portal.",
    kind: "choice",
    columns: 2,
  },
  {
    field: "askMeAbout",
    group: "logistics",
    label: 'What are your "Ask me about" topics?',
    required: false,
    description: "Share a few topics attendees can ask you about.",
    kind: "textarea",
    placeholder: "e.g. Product design, career paths, or building a startup",
    hint: "Press Shift + Enter to make a line break. Use it twice for a new paragraph.",
  },
] satisfies readonly PartnerQuestion[];

export function partnerQuestionsForGroup(group: PartnerGroupId) {
  return PARTNER_QUESTIONS.filter((question) => question.group === group);
}

export type PartnerFlow =
  | { kind: "welcome" }
  | { kind: "section"; group: PartnerGroupId; mode: "filling" }
  | {
      kind: "section";
      group: PartnerGroupId;
      mode: "editing";
      focusField: PartnerQuestionField;
    }
  | { kind: "review" }
  | { kind: "complete" };

export type PartnerAction =
  | { type: "start" }
  | { type: "next" }
  | { type: "back" }
  | { type: "edit"; field: PartnerQuestionField }
  | { type: "complete" };

export function partnerFlowReducer(
  state: PartnerFlow,
  action: PartnerAction,
): PartnerFlow {
  switch (action.type) {
    case "start":
      return state.kind === "welcome"
        ? { kind: "section", group: PARTNER_GROUPS[0].id, mode: "filling" }
        : state;
    case "next": {
      if (state.kind !== "section") return state;
      if (state.mode === "editing") return { kind: "review" };
      const index = PARTNER_GROUPS.findIndex(({ id }) => id === state.group);
      const next = PARTNER_GROUPS[index + 1];
      return next
        ? { kind: "section", group: next.id, mode: "filling" }
        : { kind: "review" };
    }
    case "back": {
      if (state.kind === "section") {
        if (state.mode === "editing") return { kind: "review" };
        const index = PARTNER_GROUPS.findIndex(({ id }) => id === state.group);
        const previous = PARTNER_GROUPS[index - 1];
        return previous
          ? { kind: "section", group: previous.id, mode: "filling" }
          : { kind: "welcome" };
      }
      if (state.kind === "review") {
        return { kind: "section", group: "logistics", mode: "filling" };
      }
      return state;
    }
    case "edit": {
      if (state.kind !== "review") return state;
      const question = PARTNER_QUESTIONS.find(
        ({ field }) => field === action.field,
      );
      return question
        ? {
            kind: "section",
            group: question.group,
            mode: "editing",
            focusField: action.field,
          }
        : state;
    }
    case "complete":
      return state.kind === "review" ? { kind: "complete" } : state;
  }
}
