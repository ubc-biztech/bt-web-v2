const QUIZ_TYPE_PATTERN = /^[TB][MD][FS][LH]$/i;

const QUIZ_TYPE_LABELS: Record<string, string> = {
  T: "Tech",
  B: "Business",
  M: "Maker",
  D: "Director",
  F: "Founder",
  S: "Scaler",
  L: "Logic",
  H: "Human",
};

const QUIZ_TYPE_DIMENSIONS = ["Domain", "Mode", "Environment", "Focus"] as const;

export type QuizTypeDisplay = {
  acronym: string;
  title: string;
  quote: string;
  description: string;
  traits: string[];
};

export function getQuizTypeDisplay(
  type: string | null | undefined,
): QuizTypeDisplay {
  const normalized = (type ?? "").trim().toUpperCase();
  const isValid = QUIZ_TYPE_PATTERN.test(normalized);
  const traits = normalized
    .split("")
    .map((letter) => QUIZ_TYPE_LABELS[letter] ?? letter);
  const traitTitle = traits.join(" / ");

  const title = isValid ? traitTitle : "Blueprint Type";
  const quote = isValid ? `"${traitTitle}"` : '"Blueprint career type"';
  const description = isValid
    ? `Your results map to ${traits[0]} (${QUIZ_TYPE_DIMENSIONS[0]}), ${traits[1]} (${QUIZ_TYPE_DIMENSIONS[1]}), ${traits[2]} (${QUIZ_TYPE_DIMENSIONS[2]}), and ${traits[3]} (${QUIZ_TYPE_DIMENSIONS[3]}).`
    : "Your results map to four dimensions: Domain, Mode, Environment, and Focus.";

  return { acronym: normalized, title, quote, description, traits };
}
