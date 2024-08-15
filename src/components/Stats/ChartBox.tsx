import React, { ReactNode } from "react";

interface ChartBoxProps {
  height?: string;
  width?: string;
  title: string;
  children: ReactNode;
}

const ChartBox: React.FC<ChartBoxProps> = ({
  children,
  title,
  height = "100%",
  width = "100%",
}) => {
  return (
    <div
      className="bg-dark-slate my-2 p-4 flex flex-col rounded !w-full lg:w-auto"
      style={{ height: height, width: width }}
    >
      <p className="text-white font-600 mb-2">{title}</p>
      <div className="flex-grow flex items-center">
        <div className="flex-grow">{children}</div>
      </div>
    </div>
  );
};

export default ChartBox;
