// <-- DashboardLayout Component --> //
// * Dynamic layout wrapper for all dashboard pages across user and judge views * //

import React, { ComponentType, useState } from "react";
import { LucideIcon } from "lucide-react";
import { TeamFeedback } from "../types";
import { json } from "stream/consumers";

interface DashboardLayoutProps {
  title: string; // * Title of the dashboard page
  pages: {
    // * Array of pages to toggle between
    name: string; // Page name
    icon: LucideIcon; // Icon component
    component: ComponentType<any>; // Wrapped child component
  }[];
  teams: Record<string, TeamFeedback[]>;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  pages,
  teams,
}) => {
  const [currentlyDisplayedPage, setCurrentlyDisplayedPage] = useState(
    pages[0].name,
  );
  return (
    <div className="w-full px-10">
      <div className="flex flex-col">
        <header className="mt-16 text-lg font-ibm">{title}</header>
        <div className="border-b-2 border-[#41437D] mt-6 flex flex-row">
          {pages.map((page, idx) => {
            const isActivePage = currentlyDisplayedPage === page.name;

            return (
              <div
                key={`${idx}+${page.name}`}
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
              </div>
            );
          })}
        </div>

        {pages.map((page) => {
          return (
            currentlyDisplayedPage === page.name && (
              <page.component records={teams} />
            )
          );
        })}
      </div>
    </div>
  );
};

export default DashboardLayout;
