import React from 'react'
import { TableBody, TableRow, TableCell } from "@/components/ui/table"
import { flexRender, Table } from "@tanstack/react-table"

interface RegistrationsTableBodyProps<T> {
    table: Table<T>
}

export const RegistrationsTableBody = <T,>({ table }: RegistrationsTableBodyProps<T>) => (
    <TableBody className="text-baby-blue font-400">
        {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
                <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    style={{backgroundColor: row.getIsSelected() ? '#324269' : 'inherit'}}
                >
                    {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                    ))}
                </TableRow>
            ))
        ) : (
            <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                    No results.
                </TableCell>
            </TableRow>
        )}
    </TableBody>
)
