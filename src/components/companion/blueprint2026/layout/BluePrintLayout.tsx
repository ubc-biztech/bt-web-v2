import React from "react";
import { BluePrintNav } from "../components/BluePrintNav";

type BluePrintLayoutProps = {
  children: React.ReactNode;
};

const BluePrintLayout = ({ children }: BluePrintLayoutProps) => {
  return (
    <div className="blueprint-root">
      <BluePrintNav isPartner={false} />
      <div className="blueprint-bg-clip">
        <div className="blueprint-vector" />
      </div>
      <div className="blueprint-content">{children}</div>
    </div>
  );
};

export default BluePrintLayout;
