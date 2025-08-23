import React from "react";
import { Table, TableRow, TableHead } from "@/components/ui/table";
import { flexRender, Table as ReactTable } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

interface TableComponentProps {
  children: React.ReactNode;
}

export const TableComponent: React.FC<TableComponentProps> = ({ children }) => (
  <div className="rounded-xl border overflow-hidden">
    <Table>{children}</Table>
  </div>
);

interface TableHeaderProps<T> {
  table: ReactTable<T>;
}

export const TableHeader = <T,>({ table }: TableHeaderProps<T>) => (
  <thead>
    {table.getHeaderGroups().map((headerGroup) => (
      <TableRow
        key={headerGroup.id}
        className="bg-bt-blue-300 hover:bg-bt-blue-300"
      >
        {headerGroup.headers.map((header) => (
          <TableHead
            key={header.id}
            className={cn(
              "text-white font-600 border-bt-blue-200 border truncate",
              (table.getIsSomePageRowsSelected() ||
                table.getIsAllPageRowsSelected()) &&
                "bg-[#556AB2]",
            )}
            style={{
              maxWidth: "200px",
            }}
          >
            {header.isPlaceholder
              ? null
              : flexRender(header.column.columnDef.header, header.getContext())}
          </TableHead>
        ))}
      </TableRow>
    ))}
  </thead>
);
