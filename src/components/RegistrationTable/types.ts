import { ColumnDef } from "@tanstack/react-table";

export interface DataTableProps<TData> {
  initialData: TData[];
  dynamicColumns?: ColumnDef<TData>[];
  eventId: string;
  year: string;
}

export type SortingState = any[];
export type ColumnFiltersState = any[];
