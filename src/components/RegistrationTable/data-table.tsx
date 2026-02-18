"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  DataTableProps,
  SortingState,
  ColumnFiltersState,
} from "./types";
import {
  ColumnDef,
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
import { QrCheckIn } from "../QrScanner/QrScanner";
import { fetchBackend } from "@/lib/db";
import { isWaitlisted } from "@/lib/registrationStatus";

const EMPTY_DYNAMIC_COLUMNS: ColumnDef<Registration>[] = [];

export function DataTable({
  initialData,
  eventData,
  dynamicColumns = EMPTY_DYNAMIC_COLUMNS,
  eventId,
  year,
}: DataTableProps<Registration>) {
  const [data, setData] = useState<Registration[] | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [pageSize, setPageSize] = useState(10);
  const [isQrReaderToggled, setQrReaderToggled] = useState(false);
  const [filterValue, setFilterValue] = useState<
    "attendees" | "partners" | "waitlisted"
  >("attendees");
  const [globalFilter, setGlobalFilter] = useState("");
  const tableData = data ?? initialData;

  const refreshTable = useCallback(async () => {
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
  }, [eventId, year, setData]);

  const memoizedColumns = useMemo(
    () => createColumns(refreshTable, eventData),
    [refreshTable, eventData],
  );

  const allColumns = [...memoizedColumns, ...dynamicColumns];

  const { columnVisibility, setColumnVisibility } =
    useColumnVisibility(allColumns);

  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const filteredData = useMemo(() => {
    return tableData.filter((attendee) => {
      switch (filterValue) {
        case "partners":
          return attendee.isPartner === true;
        case "waitlisted":
          return isWaitlisted(attendee.registrationStatus);
        case "attendees":
        default:
          return (
            !attendee.isPartner && !isWaitlisted(attendee.registrationStatus)
          );
      }
    });
  }, [tableData, filterValue]);

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
    globalFilterFn: (row, columnId, filterValue) => {
      return String(row.getValue(columnId))
        .toLowerCase()
        .includes(filterValue.toLowerCase());
    },
    state: {
      sorting,
      columnFilters,
      rowSelection,
      columnVisibility,
      globalFilter,
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
          (old ?? initialData).map((row, index) => {
            if (index === rowIndex) {
              return {
                ...(old ?? initialData)[rowIndex],
                [columnId]: value,
              };
            }
            return row;
          }),
        );
      },
    },
  });

  if (typeof window === "undefined") {
    return null;
  }

  return (
    <div className="space-y-4">
      <QrCheckIn
        event={{ id: eventId, year: year }}
        rows={tableData}
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
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        eventId={eventId}
        year={year}
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
