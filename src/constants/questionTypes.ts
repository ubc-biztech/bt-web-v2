export enum QuestionTypes {
  TEXT = "TEXT",
  CHECKBOX = "CHECKBOX",
  SELECT = "SELECT",
  UPLOAD = "UPLOAD",
  WORKSHOP_SELECTION = "WORKSHOP_SELECTION",
  SKILLS = "SKILLS",
}

// applied to TEXT questions with no charLimit set; matches the feedback form LONG_TEXT limit
export const DEFAULT_TEXT_CHAR_LIMIT = 4000;
