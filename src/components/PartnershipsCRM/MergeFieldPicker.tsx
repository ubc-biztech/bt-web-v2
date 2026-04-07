import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type MergeFieldOption = {
  key: string;
  label: string;
  description: string;
  token: string;
};

type MergeFieldPickerProps = {
  fields: MergeFieldOption[];
  activeTargetLabel: string;
  onInsertToken: (token: string) => void;
  className?: string;
};

type MergeFieldGroup = {
  id: "partner" | "sender" | "event" | "other";
  label: string;
};

const FIELD_GROUPS: MergeFieldGroup[] = [
  { id: "partner", label: "Partner" },
  { id: "sender", label: "Sender" },
  { id: "event", label: "Event" },
  { id: "other", label: "Other" },
];

const toNormalizedSearchText = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

const resolveFieldGroupId = (
  field: MergeFieldOption,
): MergeFieldGroup["id"] => {
  const key = field.key;

  if (
    key.startsWith("recipient_") ||
    key === "company_name" ||
    key === "contact_name"
  ) {
    return "partner";
  }

  if (key.startsWith("sender_")) {
    return "sender";
  }

  if (key.startsWith("event_")) {
    return "event";
  }

  return "other";
};

export function MergeFieldPicker({
  fields,
  activeTargetLabel,
  onInsertToken,
  className,
}: MergeFieldPickerProps) {
  const [search, setSearch] = useState("");
  const normalizedSearch = toNormalizedSearchText(search);

  const filteredFields = useMemo(() => {
    if (!normalizedSearch) return fields;

    return fields.filter((field) => {
      const index = `${field.key} ${field.label} ${field.description} ${field.token}`
        .toLowerCase()
        .replace(/\s+/g, " ");
      return index.includes(normalizedSearch);
    });
  }, [fields, normalizedSearch]);

  const groupedFields = useMemo(() => {
    const grouped = new Map<MergeFieldGroup["id"], MergeFieldOption[]>();

    for (const field of filteredFields) {
      const groupId = resolveFieldGroupId(field);
      const existing = grouped.get(groupId) || [];
      existing.push(field);
      grouped.set(groupId, existing);
    }

    return FIELD_GROUPS.map((group) => ({
      ...group,
      fields: grouped.get(group.id) || [],
    })).filter((group) => group.fields.length > 0);
  }, [filteredFields]);

  return (
    <div
      className={cn(
        "rounded-md border border-bt-blue-300/30 bg-bt-blue-600/30 p-3",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
            Merge Fields
          </p>
          <p className="mt-1 text-xs text-bt-blue-100">
            Insert into {activeTargetLabel}.
          </p>
        </div>
        <span className="rounded-full border border-bt-blue-300/35 bg-bt-blue-500/35 px-2 py-0.5 text-[11px] text-bt-blue-50">
          {filteredFields.length}/{fields.length}
        </span>
      </div>

      <div className="relative mt-2">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-bt-blue-100" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search merge fields"
          className="h-8 border-bt-blue-300/40 bg-bt-blue-600/40 pl-8 text-sm text-white placeholder:text-bt-blue-100"
        />
      </div>

      {!groupedFields.length ? (
        <p className="mt-2 rounded-md border border-bt-blue-300/25 bg-bt-blue-700/35 px-2 py-1.5 text-xs text-bt-blue-100">
          No merge fields match this search.
        </p>
      ) : (
        <div className="mt-3 max-h-[280px] space-y-3 overflow-y-auto pr-1">
          {groupedFields.map((group) => (
            <div key={group.id} className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-bt-blue-100">
                {group.label}
              </p>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {group.fields.map((field) => (
                  <button
                    key={field.key}
                    type="button"
                    onClick={() => onInsertToken(field.token)}
                    className="rounded-md border border-bt-blue-300/35 bg-bt-blue-500/35 p-2 text-left transition hover:bg-bt-blue-500/55"
                    title={field.description}
                  >
                    <p className="truncate text-xs font-semibold text-white">
                      {field.label}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-bt-blue-100">
                      {field.description}
                    </p>
                    <span className="mt-1 inline-flex rounded border border-bt-blue-300/40 bg-bt-blue-700/50 px-1.5 py-0.5 font-mono text-[10px] text-bt-green-100">
                      {field.token}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
