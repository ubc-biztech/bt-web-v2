import React from "react";
import { TableBody, TableRow, TableCell } from "@/components/ui/table";
import { flexRender, Table } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

interface RegistrationsTableBodyProps<T> {
  table: Table<T>;
  refreshTable: () => Promise<void>;
}

export const RegistrationsTableBody = <T,>({
  table,
  refreshTable,
}: RegistrationsTableBodyProps<T>) => (
  <TableBody className="text-bt-blue-100 font-400">
    {table.getRowModel().rows?.length ? (
      table.getRowModel().rows.map((row) => (
        <TableRow
          key={row.id}
          data-state={row.getIsSelected() && "selected"}
          style={{
            backgroundColor: row.getIsSelected() ? "#2E4694" : "inherit",
          }}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id} className={cn("border shadow-inner-white-md max-w-96 truncate p-3 text-bt-blue-0", row.getIsSelected() ? "border-bt-blue-200" : "border-bt-blue-300")}>
              {flexRender(cell.column.columnDef.cell, {
                ...cell.getContext(),
                refreshTable,
              })}
            </TableCell>
          ))}
        </TableRow>
      ))
    ) : (
      <TableRow>
        <TableCell
          colSpan={table.getAllColumns().length}
          className="h-24 text-center"
        >
          No results.
        </TableCell>
      </TableRow>
    )}
  </TableBody>
);
