import React from "react";

type BluePrintLayoutProps = {
  children: React.ReactNode;
};

const BluePrintLayout = ({ children }: BluePrintLayoutProps) => {
  return (
    <div className="blueprint-root">
      <div className="blueprint-bg-clip">
        <div className="blueprint-vector" />
      </div>
      <div className="blueprint-content">{children}</div>
    </div>
  );
};

export default BluePrintLayout;