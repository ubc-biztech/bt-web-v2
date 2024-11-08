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
    return (
        <div
            className={`group cursor-pointer select-none ${
                column.getIsSorted() === "asc" ||
                column.getIsSorted() === "desc"
                    ? "text-black"
                    : "hover:text-black text-white"
            } transition-colors duration-200 ease-in-out inline-flex gap-1`}
            onClick={column.getToggleSortingHandler()}
        >
            {title}
            {column.getIsSorted() === "asc" && <CircleChevronUp />}
            {column.getIsSorted() === "desc" && <CircleChevronDown />}
        </div>
    );
};
