import { Table } from "@tanstack/react-table";
import { Registration } from "@/types/types";

const fields = [
  { id: "basicInformation_year", label: "Year standing" },
  { id: "basicInformation_faculty", label: "Faculty" },
  { id: "basicInformation_major", label: "Major" },
];

export function RegistrationFilters({ table }: { table: Table<Registration> }) {
  const rows = table.getPreFilteredRowModel().rows;
  return (
    <div className="flex basis-full flex-wrap items-end gap-3">
      {fields.map(({ id, label }) => {
        const column = table.getColumn(id);
        const value = (column?.getFilterValue() as string) || "";
        // Include an active filter even if the attendee/status view has no matching values.
        const options = Array.from(
          new Set([
            value,
            ...rows.map((row) => String(row.getValue(id) ?? "")),
          ]),
        )
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        return (
          <label
            key={id}
            className="flex flex-col gap-1 text-sm text-bt-blue-100"
          >
            {label}
            <select
              aria-label={label}
              className="h-10 w-44 rounded-md border border-bt-blue-200 bg-bt-blue-400 px-3 text-white"
              value={value}
              onChange={(event) =>
                column?.setFilterValue(event.target.value || undefined)
              }
            >
              <option value="">All</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        );
      })}
      {fields.some(({ id }) => table.getColumn(id)?.getFilterValue()) && (
        <button
          type="button"
          className="h-10 text-sm text-bt-green-300 hover:underline"
          onClick={() =>
            fields.forEach(({ id }) =>
              table.getColumn(id)?.setFilterValue(undefined),
            )
          }
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
