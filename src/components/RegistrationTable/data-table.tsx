"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
import { QrCheckIn } from "../QrScanner/QrScanner";
import { fetchBackend } from "@/lib/db";
import {
  isCheckedIn,
  isCancelled,
  isRegistered,
  isAccepted,
  isAcceptedPending,
  isConfirmed,
  isIncomplete,
  isWaitlisted,
} from "@/lib/registrationStatus";

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
    | "all"
    | "attendees"
    | "partners"
    | "waitlisted"
    | "acceptedPending"
    | "acceptedComplete"
    | "accepted"
    | "incomplete"
    | "cancelled"
    | "checkedIn"
    | "registered"
  >("attendees");
  const [globalFilter, setGlobalFilter] = useState("");

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

  useEffect(() => {
    const filtered = data.filter((attendee) => {
      switch (filterValue) {
        case "partners":
          return attendee.isPartner === true;
        case "waitlisted":
          return isWaitlisted(attendee.registrationStatus);
        case "acceptedPending":
          return isAcceptedPending(attendee.registrationStatus);
        case "acceptedComplete":
          return isConfirmed(attendee.registrationStatus);
        case "accepted":
          return isAccepted(attendee.registrationStatus);
        case "incomplete":
          return isIncomplete(attendee.registrationStatus);
        case "cancelled":
          return isCancelled(attendee.registrationStatus);
        case "checkedIn":
          return isCheckedIn(attendee.registrationStatus);
        case "registered":
          return isRegistered(attendee.registrationStatus);
        case "all":
          return true;
        case "attendees":
        default:
          return (
            !attendee.isPartner && !isWaitlisted(attendee.registrationStatus)
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
    <div className="space-y-4">
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
