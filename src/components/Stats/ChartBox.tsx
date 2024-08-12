import React, { ReactNode } from "react";

interface ChartBoxProps {
  height?: string;
  width?: string;
  children: ReactNode;
}

const ChartBox: React.FC<ChartBoxProps> = ({
  children,
  height = "auto",
  width = "100%",
}) => {
  return (
    <div
      className="bg-dark-slate my-2 p-4 flex justify-center items-center rounded"
      style={{ height: height, width: width }}
    >
      <div className="flex-grow">{children}</div>
    </div>
  );
};

export default ChartBox;
