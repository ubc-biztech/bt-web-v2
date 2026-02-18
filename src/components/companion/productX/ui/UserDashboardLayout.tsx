// <-- DashboardLayout Component --> //
// * Dynamic layout wrapper for all dashboard pages across user and judge views * //

import React, { ComponentType, useState } from "react";
import { LucideIcon } from "lucide-react";
import { TeamFeedback } from "../types";

interface DashboardLayoutProps {
  title: string; // * Title of the dashboard page
  pages: {
    // * Array of pages to toggle between
    name: string; // Page name
    icon: LucideIcon; // Icon component
    component: React.ReactNode; // Wrapped child component
  }[];
}

export const UserDashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  pages,
}) => {
  const [currentlyDisplayedPage, setCurrentlyDisplayedPage] = useState(
    pages[0].name,
  );
  return (
    <div className="w-full px-10">
      <div className="flex flex-col">
        <header className="mt-16 text-lg font-ibm">{title}</header>
        <div className="border-b-2 border-[#41437D] mt-6 flex flex-row">
          {pages.map((page) => {
            const isActivePage = currentlyDisplayedPage === page.name;

            return (
              <button
                type="button"
                key={page.name}
                className={`w-24 h-10 border-b-2 ${
                  isActivePage
                    ? "border-[#4CC8BD] text-[#4CC8BD]"
                    : "border-[#41437D] text-[#41437D]"
                } -mb-[2px] flex flex-row items-center justify-center gap-1 cursor-pointer`}
                onClick={() => {
                  setCurrentlyDisplayedPage(page.name);
                }}
              >
                <page.icon
                  size={16}
                  color={isActivePage ? "#4CC8BD" : "#41437D"}
                />
                {page.name}
              </button>
            );
          })}
        </div>

        {pages.map((page) => {
          return (
            currentlyDisplayedPage === page.name && (
              <React.Fragment key={page.name}>{page.component}</React.Fragment>
            )
          );
        })}
      </div>
    </div>
  );
};
