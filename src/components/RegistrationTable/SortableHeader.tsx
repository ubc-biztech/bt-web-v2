import React from "react";
import { Column } from "@tanstack/react-table";
import { CircleChevronDown, CircleChevronUp } from "lucide-react";

interface SortableHeaderProps<T> {
  column: Column<T, unknown>;
  title: string;
}

export const SortableHeader = <T,>({
  column,
  title,
}: SortableHeaderProps<T>) => {
  const sorted = column.getIsSorted();
  const Icon = sorted === "desc" ? CircleChevronDown : CircleChevronUp;

  return (
    <button
      type="button"
      className="group inline-flex items-center gap-2 whitespace-nowrap text-white hover:text-bt-blue-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
      onClick={column.getToggleSortingHandler()}
      aria-label={`Sort by ${title}`}
    >
      {title}
      {/* Keep the icon's space even when unsorted, so hover cannot resize the column. */}
      <Icon
        aria-hidden="true"
        className={`h-5 w-5 shrink-0 transition-opacity ${
          sorted
            ? "text-bt-green-300 opacity-100"
            : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
        }`}
      />
    </button>
  );
};
