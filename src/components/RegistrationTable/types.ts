import { ColumnDef } from "@tanstack/react-table"
import { Attendee } from "./columns"
import { Dispatch, SetStateAction } from "react"

export interface DataTableProps<TData> {
    initialData: TData[]
    dynamicColumns?: ColumnDef<TData>[]
    eventId: string;
    year: string;
}

export type SortingState = any[]
export type ColumnFiltersState = any[]
