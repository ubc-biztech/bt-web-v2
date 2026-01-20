import { CompanionPage, CompanionPageContext } from "@/lib/context/companionContext";
import React, { useState } from "react";

type BluePrintLayoutProps = {
  children: React.ReactNode;
};

const BluePrintLayout = ({ children }: BluePrintLayoutProps) => {
  const [page, setPage] = useState<CompanionPage>("home");

  return (
    <CompanionPageContext.Provider value={{ page, setPage }}>
      <div className="blueprint-root">
        <div className="blueprint-bg-clip">
          <div className="blueprint-vector" />
        </div>
        <div className="blueprint-content">{children}</div>
      </div>
    </CompanionPageContext.Provider>
  );
};

export default BluePrintLayout;
