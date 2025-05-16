import React, { ReactNode } from "react";
import styles from "./ChartBox.module.css";

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
      className={`bg-dark-slate my-2 p-4 flex flex-col rounded ${styles.dynamicWidth}`}
      style={
        {
          height: height,
          "--dynamic-width": width,
        } as React.CSSProperties
      }
    >
      <p className="text-white font-600 mb-2">{title}</p>
      <div className="flex-grow flex items-center">
        <div className="flex-grow">{children}</div>
      </div>
    </div>
  );
};

export default ChartBox;
