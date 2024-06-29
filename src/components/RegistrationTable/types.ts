import { ColumnDef } from "@tanstack/react-table"
import { Attendee } from "./columns"

export interface DataTableProps<TData> {
    initialData: TData[]
    dynamicColumns?: ColumnDef<TData>[]
}

export type SortingState = any[]
export type ColumnFiltersState = any[]
