export const ProfileField = ({
  field,
  value,
  className,
}: {
  field: string;
  value: string;
  className?: string;
}) => {
  return (
    <div className={`w-1/2 text-white ${className}`}>
      <h6 style={{ color: "#B2C9FC", fontSize: "16px" }}>{field}</h6>
      <p style={{ fontSize: "14px" }}>{value}</p>
    </div>
  );
};

export const ProfileRow = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      style={{
        display: "flex",
        marginTop: "12px",
        marginBottom: "12px",
      }}
    >
      {children}
    </div>
  );
};
