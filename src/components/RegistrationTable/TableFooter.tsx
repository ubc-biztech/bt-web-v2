import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Table } from "@tanstack/react-table";
import {
  exportToCSV,
  exportToPDF,
  formatTableForExport,
} from "@/util/exportHelpers";

import DownloadIcon from "../../../public/assets/icons/download_icon.svg";
import { useRouter } from "next/router";

interface TableFooterProps {
  table: Table<any>;
  pageSize: number;
  setPageSize: (size: number) => void;
}

export const TableFooter: React.FC<TableFooterProps> = ({
  table,
  pageSize,
  setPageSize,
}) => {
  const router = useRouter();

  const handleExport = (format: string) => {
    const rows = formatTableForExport(table);
    const fileName = `${router.query.eventId}_${router.query.year}`;
    if (format === "pdf") {
      exportToPDF(rows, fileName);
    } else {
      exportToCSV(rows, fileName);
    }
    console.log(`Exporting as ${format}...`);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between py-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="text-bt-blue-0"
            disabled={!table.getRowCount()}
          >
            <div className="flex items-center space-x-3">
              <Image
                src={DownloadIcon}
                alt="Download Icon"
                width={25}
                height={25}
                className={"min-w-6"}
              />
              <div className="font-400">Export Files</div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#485A85]">
          <DropdownMenuItem onClick={() => handleExport("csv")}>
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("pdf")}>
            Export as PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex flex-col lg:flex-row items-center justify-between space-x-2">
        <div className="flex flex-row items-center justify-between space-x-2">
          <span className="text-sm text-bt-blue-0">Showing</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(Number(value));
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="bg-bt-blue-400 text-white">
              <SelectValue placeholder={`${pageSize} Rows`} />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100, 1000].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size} Rows
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            className="text-bt-blue-0"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </Button>
          <Button
            variant="ghost"
            className="text-bt-blue-0"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </Button>
          <span className="text-sm text-bt-blue-0">
            {table.getState().pagination.pageIndex * pageSize + 1}-
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * pageSize,
              table.getFilteredRowModel().rows.length,
            )}{" "}
            of {table.getFilteredRowModel().rows.length}
          </span>
          <Button
            variant="ghost"
            className="text-bt-blue-0"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </Button>
          <Button
            variant="ghost"
            className="text-bt-blue-0"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </Button>
        </div>
      </div>
    </div>
  );
};
