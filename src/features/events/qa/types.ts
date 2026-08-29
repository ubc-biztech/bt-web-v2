export type QaCategory = "Career" | "Tech" | "Networking" | "General" | "Other";
export const QA_CATEGORIES: QaCategory[] = [
  "Career",
  "Tech",
  "Networking",
  "General",
  "Other",
];

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

export type QaSortTab = "all" | "pendingReview" | "answered" | "flagged";
