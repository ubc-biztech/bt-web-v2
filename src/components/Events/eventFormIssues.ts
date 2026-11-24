const fieldLabels: Record<string, string> = {
  eventName: "Event name",
  eventSlug: "Event slug",
  description: "Description",
  capacity: "Capacity",
  startDate: "Start date",
  endDate: "End date",
  deadline: "Registration deadline",
  location: "Location",
  imageUrl: "Cover photo",
  price: "Member price",
  nonMemberPrice: "Non-member price",
  isApplicationBased: "Application-based event",
  nonBizTechAllowed: "Non-BizTech members allowed",
  isPublished: "Published status",
  isCompleted: "Completed status",
  registrationFormKey: "Registration form",
  partnerRegistrationFormKey: "Partner registration form",
  partnerDescription: "Partner description",
  eventPage: "Event page",
  subtitle: "Subtitle",
  targetAudience: "Target audience",
  externalUrl: "External link",
  visibility: "Visibility",
  order: "Order",
  config: "Settings",
  id: "ID",
  type: "Question type",
  question: "Question text",
  required: "Required",
  options: "Options",
  charLimit: "Character limit",
  questionImageUrl: "Question image",
  participantCap: "Participant cap",
  isSkillsQuestion: "Skills setting",
};

function fieldLabel(path: string[]) {
  const [group, index, field] = path;
  if (group === "customQuestions" || group === "partnerCustomQuestions") {
    const label = group === "customQuestions" ? "Attendee" : "Partner";
    const question = /^\d+$/.test(index)
      ? `${label} question ${Number(index) + 1}`
      : `${label} custom questions`;
    return fieldLabels[field]
      ? `${question} · ${fieldLabels[field]}`
      : question;
  }
  if (group === "eventPage" && index === "modules") {
    const [, , moduleIndex, property] = path;
    if (/^\d+$/.test(moduleIndex)) {
      const moduleLabel = `Event page module ${Number(moduleIndex) + 1}`;
      return fieldLabels[property]
        ? `${moduleLabel} · ${fieldLabels[property]}`
        : moduleLabel;
    }
    return "Event page modules";
  }
  return fieldLabels[index ?? group] ?? "Event settings";
}

export type EventFormIssue = { path: string; label: string; message: string };

export function getEventFormIssues(
  value: unknown,
  path: string[] = [],
): EventFormIssue[] {
  if (!value || typeof value !== "object") return [];
  if (
    "message" in value &&
    typeof value.message === "string" &&
    value.message
  ) {
    return [
      { path: path.join("."), label: fieldLabel(path), message: value.message },
    ];
  }
  return Object.entries(value).flatMap(([key, child]) =>
    key === "ref" ? [] : getEventFormIssues(child, [...path, key]),
  );
}
