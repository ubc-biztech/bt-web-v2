import { cn } from "@/lib/utils";
import { KnownPartnerStatus, statusMeta, toStatusLabel } from "./status";

export function StatusChip({ status }: { status: string }) {
  const meta = statusMeta[status as KnownPartnerStatus];
  const chipClassName = meta
    ? meta.chipClassName
    : "border-white/25 bg-white/[0.08] text-bt-blue-50";
  const dotClassName = meta ? meta.dotClassName : "bg-bt-blue-100";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        chipClassName,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotClassName)} />
      {toStatusLabel(status)}
    </span>
  );
}
