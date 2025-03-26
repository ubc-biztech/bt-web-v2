export const ProfileField = ({
  field,
  value,
  className,
}: {
  field: string;
  value: string | number;
  className?: string;
}) => {
  return (
    <div className={`w-1/2 font-poppins ${className}`}>
      <h6 className="text-baby-blue text-sm">{field}</h6>
      <p className="text-white text-xs">{value}</p>
    </div>
  );
};

export const ProfileRow = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex my-3">{children}</div>;
};
