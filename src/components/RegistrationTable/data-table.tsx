"use client"

import { useState, useRef, useEffect } from "react"
import { DataTableProps, SortingState, ColumnFiltersState } from "./types"
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel } from "@tanstack/react-table"
import { TableComponent, TableHeader } from "./TableComponent"
import { TableHeader as TableActionsHeader } from "./TableHeader"
import { RegistrationsTableBody } from "./RegistrationsTableBody"
import { TableFooter } from "./TableFooter"
import { useColumnVisibility } from "./hooks/useColumnVisibility"
import { columns as defaultColumns, Attendee } from "./columns"

export function DataTable({ initialData, dynamicColumns = [] }: DataTableProps<Attendee>) {
    const [data, setData] = useState(initialData)
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
    const [pageSize, setPageSize] = useState(10)
    const [isClient, setIsClient] = useState(false)

    const allColumns = [...defaultColumns, ...dynamicColumns]

    const { columnVisibility, setColumnVisibility } = useColumnVisibility(allColumns)

    const filterButtonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        setIsClient(true)
    }, [])

    const table = useReactTable<Attendee>({
        data,
        columns: allColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            rowSelection,
            columnVisibility
        },
        onColumnVisibilityChange: setColumnVisibility,
        initialState: {
            pagination: {
                pageSize: pageSize,
            },
        },
        meta: {
            updateData: (rowIndex: number, columnId: string, value: any) => {
                setData((old) =>
                    old.map((row, index) => {
                        if (index === rowIndex) {
                            return {
                                ...old[rowIndex],
                                [columnId]: value,
                            }
                        }
                        return row
                    })
                )
            },
        },
    })

    if (!isClient) {
        return null;
    }

    return (
        <div className="space-y-4 font-poppins">
            <TableActionsHeader
                table={table}
                filterButtonRef={filterButtonRef}
                rowSelection={rowSelection}
            />

            <TableComponent>
                <TableHeader table={table} />
                <RegistrationsTableBody table={table} />
            </TableComponent>

            <TableFooter
                table={table}
                pageSize={pageSize}
                setPageSize={setPageSize}
            />
        </div>
    )
}
