import React from 'react'
import {
    Table,
    TableRow,
    TableHead,
} from "@/components/ui/table"
import { flexRender, Table as ReactTable } from "@tanstack/react-table"

interface TableComponentProps {
    children: React.ReactNode
}

export const TableComponent: React.FC<TableComponentProps> = ({ children }) => (
    <div className="rounded-xl border overflow-hidden">
        <Table>{children}</Table>
    </div>
)

interface TableHeaderProps<T> {
    table: ReactTable<T>
}

export const TableHeader = <T,>({ table }: TableHeaderProps<T>) => (
    <thead>
    {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id} className="bg-[#6578A8] hover:bg-[#6578A8]">
            {headerGroup.headers.map((header) => (
                <TableHead
                    key={header.id}
                    className="text-white font-600"
                    style={{
                        minWidth: header.column.columnDef.size,
                        maxWidth: header.column.columnDef.size,
                    }}>
                    {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                        )}
                </TableHead>
            ))}
        </TableRow>
    ))}
    </thead>
)
