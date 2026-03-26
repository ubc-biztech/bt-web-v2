import { cn } from "@/lib/utils";

export default function BluePrintCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        className,
        "relative flex flex-col gap-1",
        "rounded-sm bg-[#0A1428]/60 backdrop-blur-[2px] border-[0.3px] border-white/50 shadow-[inset_0_0_32px_rgba(255,255,255,0.3)] p-4",
      )}
    >
      {children}
    </div>
  );
}
