import React, { useId } from "react";

type FeedbackGridProps = {
  rows: { id: string; label: string }[];
  columns: string[];
  label: string;
  value: Record<string, string>;
  onChange: (rowId: string, choice: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
};

export function FeedbackGrid({
  rows,
  columns,
  label,
  value,
  onChange,
  onBlur,
  invalid,
}: FeedbackGridProps) {
  const id = useId();
  const tracks = `minmax(150px, 1.6fr) repeat(${columns.length}, minmax(0, 1fr))`;

  return (
    <div role="group" aria-label={label} className="min-w-0">
      <div
        className="hidden sm:grid border-b border-white/20 pb-3"
        style={{ gridTemplateColumns: tracks }}
        aria-hidden="true"
      >
        <span />
        {columns.map((column) => (
          <span
            key={column}
            className="min-w-0 break-words px-1 text-center text-xs font-medium text-bt-blue-100"
          >
            {column}
          </span>
        ))}
      </div>
      {rows.map((row) => (
        <div
          key={row.id}
          role="radiogroup"
          aria-label={row.label}
          aria-invalid={invalid}
          className="grid grid-cols-2 gap-y-1 border-b border-white/10 py-3 last:border-0 sm:grid-cols-[var(--grid-tracks)] sm:items-center sm:gap-0"
          style={{ "--grid-tracks": tracks } as React.CSSProperties}
        >
          <span className="col-span-2 mb-2 min-w-0 break-words text-sm font-medium text-white sm:col-span-1 sm:mb-0 sm:pr-3">
            {row.label}
          </span>
          {columns.map((column) => (
            <label
              key={column}
              className="flex min-h-11 min-w-0 cursor-pointer items-center gap-2 rounded px-2 hover:bg-white/5 sm:justify-center sm:px-1"
            >
              <input
                type="radio"
                name={`${id}-${row.id}`}
                value={column}
                checked={value[row.id] === column}
                onChange={() => onChange(row.id, column)}
                onBlur={onBlur}
                aria-label={`${row.label}: ${column}`}
                className="h-4 w-4 shrink-0 cursor-pointer accent-bt-green-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bt-green-300"
              />
              <span className="min-w-0 break-words text-sm text-white sm:sr-only">
                {column}
              </span>
            </label>
          ))}
        </div>
      ))}
    </div>
  );
}
