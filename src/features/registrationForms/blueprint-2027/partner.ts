import type { BiztechEvent, RegistrationQuestion } from "@/types";
import type { BluePrintPartnerRegistrationValues } from "./Definition";
import { PARTNER_QUESTIONS } from "./partnerFlow";

const PARTNER_RESPONSE_FIELDS = [
  "nametag",
  "linkedin",
  "areasOfExpertise",
  "headshot",
  "coffeeChatInterest",
  "askMeAbout",
] as const;

type PartnerQuestionField = (typeof PARTNER_RESPONSE_FIELDS)[number];
type PartnerQuestionIds = Record<PartnerQuestionField, string>;

const PARTNER_RESPONSE_QUESTIONS = PARTNER_QUESTIONS.filter(({ field }) =>
  PARTNER_RESPONSE_FIELDS.some((responseField) => responseField === field),
);

export function configurePartnerQuestions(
  questions: readonly RegistrationQuestion[],
): RegistrationQuestion[] {
  const configured = PARTNER_RESPONSE_QUESTIONS.flatMap((question) => {
    const matches = questions.filter(({ label }) => label === question.label);
    const ids = matches.length
      ? matches.map(({ questionId }) => questionId)
      : [crypto.randomUUID()];
    return ids.map((questionId) => ({
      questionId,
      label: question.label,
      type: question.kind === "upload" ? "UPLOAD" : "TEXT",
      required: question.required,
      choices: "",
    }));
  });
  resolvePartnerQuestionIds(configured);
  return configured;
}

export function resolvePartnerQuestionIds(
  questions: readonly RegistrationQuestion[],
): PartnerQuestionIds {
  function find(field: PartnerQuestionField): string {
    const label = PARTNER_RESPONSE_QUESTIONS.find(
      (question) => question.field === field,
    )?.label;
    const matches = questions.filter((question) => question.label === label);
    const match = matches[0];
    if (matches.length !== 1 || !match?.questionId?.trim()) {
      throw new Error(
        `The event's partner questions are not configured correctly for ${field}. Please contact an organizer.`,
      );
    }
    return match.questionId;
  }
  const ids = {
    nametag: find("nametag"),
    linkedin: find("linkedin"),
    areasOfExpertise: find("areasOfExpertise"),
    headshot: find("headshot"),
    coffeeChatInterest: find("coffeeChatInterest"),
    askMeAbout: find("askMeAbout"),
  };
  if (new Set(Object.values(ids)).size !== Object.keys(ids).length) {
    throw new Error(
      "The event's partner questions have duplicate IDs. Please contact an organizer.",
    );
  }
  return ids;
}

export function buildPartnerRegistrationPayload(
  values: BluePrintPartnerRegistrationValues,
  headshotUrl: string,
  questions: readonly RegistrationQuestion[],
  event: Pick<BiztechEvent, "id" | "year">,
) {
  const questionIds = resolvePartnerQuestionIds(questions);
  return {
    email: values.email.toLowerCase(),
    fname: values.firstName,
    eventID: event.id,
    year: event.year,
    registrationStatus: "registered",
    isPartner: true,
    basicInformation: {
      fname: values.firstName,
      lname: values.lastName,
      gender: values.pronouns,
      otherPronoun:
        values.pronouns === "Other" ? (values.otherPronoun ?? "") : "",
      companyName: values.participatingIndependently ? "" : values.companyName,
      participatingIndependently: values.participatingIndependently,
      role: values.role,
      diet: values.dietaryRestrictions,
      otherDietaryRestrictions:
        values.dietaryRestrictions === "Other"
          ? (values.otherDietaryRestrictions ?? "")
          : "",
      ...(values.headshot === "linkedin-permission"
        ? { linkedinHeadshotPermission: true }
        : {}),
    },
    dynamicResponses: {
      [questionIds.nametag]: values.nametag,
      [questionIds.linkedin]: values.linkedin,
      [questionIds.areasOfExpertise]: formatPartnerExpertise(values),
      [questionIds.headshot]:
        values.headshot === "linkedin-permission"
          ? values.linkedin
          : headshotUrl,
      [questionIds.coffeeChatInterest]: values.coffeeChatInterest
        ? "Yes"
        : "No",
      [questionIds.askMeAbout]: values.askMeAbout ?? "",
    },
  };
}

export function createPartnerSubmitter(dependencies: {
  event: Pick<BiztechEvent, "id" | "year">;
  questions: readonly RegistrationQuestion[];
  checkRegistered: (email: string) => Promise<boolean>;
  upload: (file: File) => Promise<string>;
  register: (
    payload: ReturnType<typeof buildPartnerRegistrationPayload>,
  ) => Promise<void>;
}) {
  let uploaded: { file: File; url: string } | undefined;
  let submitting = false;
  return async (values: BluePrintPartnerRegistrationValues) => {
    if (submitting) throw new Error("Registration is already being submitted.");
    submitting = true;
    try {
      resolvePartnerQuestionIds(dependencies.questions);
      if (await dependencies.checkRegistered(values.email.toLowerCase())) {
        throw new Error("You have already registered for this event.");
      }
      let headshotUrl = values.linkedin;
      if (values.headshot !== "linkedin-permission") {
        if (uploaded?.file !== values.headshot) {
          const url = await dependencies.upload(values.headshot);
          uploaded = { file: values.headshot, url };
        }
        headshotUrl = uploaded.url;
      }
      await dependencies.register(
        buildPartnerRegistrationPayload(
          values,
          headshotUrl,
          dependencies.questions,
          dependencies.event,
        ),
      );
    } finally {
      submitting = false;
    }
  };
}

export function formatPartnerExpertise(
  values: Pick<
    BluePrintPartnerRegistrationValues,
    "areasOfExpertise" | "otherExpertise"
  >,
) {
  return values.areasOfExpertise
    .map((area) =>
      area === "Other" && values.otherExpertise?.trim()
        ? `Other: ${values.otherExpertise.trim()}`
        : area,
    )
    .join(", ");
}
