"use client";

import { useState, useRef, useEffect } from "react";
import { DataTableProps, SortingState, ColumnFiltersState } from "./types";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { TableComponent, TableHeader } from "./TableComponent";
import { TableHeader as TableActionsHeader } from "./TableHeader";
import { RegistrationsTableBody } from "./RegistrationsTableBody";
import { TableFooter } from "./TableFooter";
import { useColumnVisibility } from "./hooks/useColumnVisibility";
import { createColumns } from "./columns";
import { Registration } from "@/types/types";
import QrCheckIn from "../QrScanner/QrScanner";
import { fetchBackend } from "@/lib/db";

export function DataTable({
  initialData,
  eventData,
  dynamicColumns = [],
  eventId,
  year,
}: DataTableProps<Registration>) {
  const [data, setData] = useState(initialData);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [pageSize, setPageSize] = useState(10);
  const [isClient, setIsClient] = useState(false);
  const [isQrReaderToggled, setQrReaderToggled] = useState(false);
  const [filteredData, setFilteredData] = useState(initialData);
  const [filterValue, setFilterValue] = useState<
    "attendees" | "partners" | "waitlisted"
  >("attendees");

  const refreshTable = async () => {
    try {
      const registrationData = await fetchBackend({
        endpoint: `/registrations?eventID=${eventId}&year=${year}`,
        method: "GET",
        authenticatedCall: false,
      });
      setData(registrationData.data);
    } catch (error) {
      console.error("Failed to refresh table data:", error);
    }
  };

  const allColumns = [
    ...createColumns(refreshTable, eventData),
    ...dynamicColumns,
  ];

  const { columnVisibility, setColumnVisibility } =
    useColumnVisibility(allColumns);

  const filterButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const filtered = data.filter((attendee) => {
      switch (filterValue) {
        case "partners":
          return attendee.isPartner === true;
        case "waitlisted":
          return attendee.registrationStatus === "waitlisted";
        case "attendees":
        default:
          return (
            !attendee.isPartner && attendee.registrationStatus !== "waitlisted"
          );
      }
    });
    setFilteredData(filtered);
  }, [data, filterValue]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const table = useReactTable<Registration>({
    data: filteredData,
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
      columnVisibility,
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
              };
            }
            return row;
          }),
        );
      },
    },
  });

  if (!isClient) {
    return null;
  }

  return (
    <div className="space-y-4 font-poppins">
      <QrCheckIn
        event={{ id: eventId, year: year }}
        rows={data}
        isQrReaderToggled={isQrReaderToggled}
        setQrReaderToggled={setQrReaderToggled}
      />
      <TableActionsHeader
        table={table}
        filterButtonRef={filterButtonRef}
        rowSelection={rowSelection}
        isQrReaderToggled={isQrReaderToggled}
        setQrReaderToggled={setQrReaderToggled}
        refreshTable={refreshTable}
        onFilterChange={setFilterValue}
      />

      <TableComponent>
        <TableHeader table={table} />
        <RegistrationsTableBody table={table} refreshTable={refreshTable} />
      </TableComponent>

      <TableFooter
        table={table}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />
    </div>
  );
}
