import {
  CONNECTION_TYPE_FILTERS,
  type ConnectionTypeFilter,
} from "@/constants/connectionTypes";

type ConnectionFiltersProps = {
  value: ConnectionTypeFilter;
  onChange: (value: ConnectionTypeFilter) => void;
  filteredCount: number;
  totalCount: number;
};

export function ConnectionFilters({
  value,
  onChange,
  filteredCount,
  totalCount,
}: ConnectionFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {CONNECTION_TYPE_FILTERS.map((filter) => {
          const selected = value === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onChange(filter.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selected
                  ? "bg-bt-blue-300 text-white"
                  : "border border-bt-blue-200 bg-transparent text-bt-blue-0 hover:bg-bt-blue-400"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-bt-blue-0 sm:text-right">
        Showing {filteredCount} of {totalCount} connections
      </p>
    </div>
  );
}
