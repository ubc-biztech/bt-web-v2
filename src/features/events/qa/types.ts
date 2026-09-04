export type QaCategory = "Career" | "Tech" | "Networking" | "General" | "Other";
export const QA_CATEGORIES: QaCategory[] = [
  "Career",
  "Tech",
  "Networking",
  "General",
  "Other",
];
export const DEFAULT_QA_CATEGORY: QaCategory = "General";

export interface Question {
  eventIDYear: string;
  questionId: string;
  body: string;
  answer?: string;
  isHidden: boolean;
  isPinned: boolean;
  upvotes: number;
  category?: QaCategory;
  createdAt: string;
  updatedAt: string;
  answeredBy?: string;
  pinnedBy?: string;
  pinnedAt?: string;
  updatedBy?: string;
}

export const QA_FILTER_TABS = [
  "all",
  "pendingAnswer",
  "answered",
  "hidden",
] as const;

export type QaFilterTab = (typeof QA_FILTER_TABS)[number];

export const QA_FILTER_TAB_LABELS: Record<QaFilterTab, string> = {
  all: "All",
  pendingAnswer: "Pending Answer",
  answered: "Answered",
  hidden: "Hidden",
};

export const QA_FILTER_TAB_PREDICATES: Record<
  QaFilterTab,
  (question: Question) => boolean
> = {
  all: () => true,
  pendingAnswer: (question) => !question.answer,
  answered: (question) => !!question.answer,
  hidden: (question) => question.isHidden,
};
