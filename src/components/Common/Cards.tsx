import Divider from "./Divider";

function GenericCardNFC({
  title,
  children,
  isCollapsible = false,
}: {
  title?: string;
  children: React.ReactNode;
  isCollapsible?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 bg-biztech-navy/80 rounded-lg p-6 shadow-[inset_0_0_26.59px_rgba(255,255,255,0.1)] border-border-blue border">
      {title && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-md font-semibold">{title}</h2>
          </div>
          <div className="border-border-blue border-[0.5px]" />
        </>
      )}
      {children}
    </div>
  );
}

function GenericCard({
  title,
  children,
  isCollapsible = false,
}: {
  title?: string;
  children: React.ReactNode;
  isCollapsible?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 bg-dark-slate/40 rounded-lg p-6 shadow-[inset_0_0_40px_rgba(255,255,255,0.05)] border-profile-separator-bg border-[1px]">
      {title && (
        <>
          <h2 className="text-pale-blue text-md font-medium">{title}</h2>
          <Divider />
        </>
      )}
      {children}
    </div>
  );
}

export { GenericCardNFC, GenericCard };
