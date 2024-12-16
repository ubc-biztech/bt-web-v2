import React, { useState } from "react";
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
    const [hover, setHover] = useState(false);
    return (
        <div
            className={`group cursor-pointer select-none ${
                column.getIsSorted() === "asc" ||
                column.getIsSorted() === "desc"
                    ? "text-black"
                    : "hover:text-black text-white"
            } transition-colors duration-200 ease-in-out inline-flex gap-1`}
            onClick={column.getToggleSortingHandler()}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {title}
            <div
                className={`${
                    column.getIsSorted() === "asc"
                        ? "text-biztech-green" // Color for ascending sort
                        : column.getIsSorted() === "desc"
                        ? "text-light-red" // Color for descending sort
                        : "text-black" // Default color for unsorted
                }`}
            >
                {(column.getIsSorted() === "asc" ||
                    (hover && column.getIsSorted() != "desc")) && (
                    <CircleChevronUp />
                )}
                {column.getIsSorted() === "desc" && <CircleChevronDown />}
            </div>
        </div>
    );
};
