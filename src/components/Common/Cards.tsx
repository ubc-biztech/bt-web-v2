import { cn } from "@/lib/utils";
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
    <div className="flex flex-col gap-4 bg-bt-blue-300/20 rounded-lg p-6 shadow-[inset_0_0_26.59px_rgba(255,255,255,0.1)] border-bt-blue-100 border">
      {title && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-md font-semibold">{title}</h2>
          </div>
          <div className="border-bt-blue-300 border-[0.5px]" />
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
  className,
}: {
  title?: string;
  children: React.ReactNode;
  isCollapsible?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        className || "flex flex-col gap-1",
        "bg-bt-blue-300/20 rounded-lg p-6 shadow-[inset_0_0_40px_rgba(255,255,255,0.05)] border-bt-blue-200 border-[1px] text-white",
      )}
    >
      {title && (
        <>
          <h2 className="text-bt-blue-0 text-md font-medium">{title}</h2>
          <Divider />
        </>
      )}
      {children}
    </div>
  );
}

export { GenericCardNFC, GenericCard };
