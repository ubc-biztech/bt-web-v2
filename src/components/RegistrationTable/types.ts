import { BiztechEvent } from "@/types/types";
import { ColumnDef } from "@tanstack/react-table";

export interface DataTableProps<T> {
  initialData: T[];
  dynamicColumns: ColumnDef<T>[];
  eventId: string;
  year: string;
  eventData: BiztechEvent;
}

export type SortingState = any[];
export type ColumnFiltersState = any[];
