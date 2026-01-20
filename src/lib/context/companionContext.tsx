import React from "react";

export type CompanionPage = "home" | "profile" | "schedule";

interface CompanionPageContextValue {
  page: CompanionPage;
  setPage: (page: CompanionPage) => void;
}

export const CompanionPageContext =
  React.createContext<CompanionPageContextValue | null>(null);
