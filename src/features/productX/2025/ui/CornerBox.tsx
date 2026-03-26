import React from "react";

interface CornerBorderWrapperProps {
  children: React.ReactNode;
  selected: boolean;
}

const CornerBorderWrapper: React.FC<CornerBorderWrapperProps> = ({
  children,
  selected,
}) => {
  const cornerStyle: React.CSSProperties = {
    content: '""',
    position: "absolute",
    width: "15px",
    height: "15px",
    background: "transparent",
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          ...cornerStyle,
          top: 0,
          left: 0,
          borderLeft: `1px solid ${selected ? "white" : "#656795"} `,
          borderTop: `1px solid ${selected ? "white" : "#656795"} `,
        }}
      />
      <div
        style={{
          ...cornerStyle,
          top: 0,
          right: 0,
          borderRight: `1px solid ${selected ? "white" : "#656795"} `,
          borderTop: `1px solid ${selected ? "white" : "#656795"} `,
        }}
      />
      <div
        style={{
          ...cornerStyle,
          bottom: 0,
          left: 0,
          borderLeft: `1px solid ${selected ? "white" : "#656795"} `,
          borderBottom: `1px solid ${selected ? "white" : "#656795"} `,
        }}
      />
      <div
        style={{
          ...cornerStyle,
          bottom: 0,
          right: 0,
          borderRight: `1px solid ${selected ? "white" : "#656795"} `,
          borderBottom: `1px solid ${selected ? "white" : "#656795"} `,
        }}
      />
      {children}
    </div>
  );
};

export default CornerBorderWrapper;
