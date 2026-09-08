"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell } from "./TableCell";
import { EditCell } from "./EditCell";
import { NFCCardCell } from "./NFCCardCell";
import { SortableHeader } from "./SortableHeader";
import { BiztechEvent } from "@/types/types";
import { Registration } from "@/types/types";
import {
  APPLICATION_STATUS_OPTIONS,
  YEAR_STANDING_LABELS,
} from "@/constants/registrations";
import { cn } from "@/lib/utils";
import {
  RegistrationStatusOptions,
  getSortOrder,
} from "@/lib/registrationStatus";

export type ColumnMeta = {
  label?: string;
  type?: "select" | "number";
  options?: { value: string; label: string }[];
};

export const createColumns = (
  refreshTable: () => Promise<void>,
  eventData: BiztechEvent,
): ColumnDef<Registration>[] => [
  {
    id: "edit",
    meta: { label: "Details" } as ColumnMeta,
    size: 30,
    cell: (props) => (
      <EditCell
        {...props}
        refreshTable={refreshTable}
        eventData={eventData as BiztechEvent}
      />
    ),
  },
  {
    id: "select",
    meta: { label: "Select" } as ColumnMeta,
    header: ({ table }) => {
      const isChecked =
        table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()
          ? "indeterminate"
          : false;

      return (
        <div className="flex place-items-center ml-1">
          <Checkbox
            checked={isChecked}
            onCheckedChange={(value: any) => {
              if (
                table.getIsAllPageRowsSelected() ||
                table.getIsSomePageRowsSelected()
              ) {
                table.toggleAllPageRowsSelected(false);
              } else {
                table.toggleAllPageRowsSelected(!!value);
              }
            }}
            aria-label="Select all"
            className={cn(
              "font-bold",
              !isChecked
                ? "bg-white"
                : "bg-[#005BFF] border-none shadow-inner-white-md",
            )}
          />
        </div>
      );
    },
    size: 50,
    cell: ({ row }) => (
      <div className="flex place-items-center ml-2 mr-5">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: any) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className={
            "font-bold bg-white border-none shadow-inner-white-md data-[state=checked]:bg-[#005BFF] data-[state=checked]:text-primary-foreground"
          }
        />
      </div>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "registrationStatus",
    header: ({ column }) => (
      <SortableHeader title="Reg. Status" column={column} />
    ),
    cell: (props) => (
      <TableCell
        {...props}
        refreshTable={refreshTable}
        key={`${props.row}-${props.column}`}
      />
    ),
    meta: {
      label: "Registration Status",
      type: "select",
      options: RegistrationStatusOptions,
    } as ColumnMeta,
    size: 200,
    enableSorting: true,
    sortingFn: (rowA, rowB) =>
      getSortOrder(rowA.getValue("registrationStatus") as string) -
      getSortOrder(rowB.getValue("registrationStatus") as string),
  },
  ...(eventData.isApplicationBased
    ? ([
        {
          accessorKey: "applicationStatus",
          header: ({ column }) => (
            <SortableHeader title="App. Status" column={column} />
          ),
          cell: (props) => <TableCell {...props} refreshTable={refreshTable} />,
          meta: {
            label: "Application Status",
            type: "select",
            options: APPLICATION_STATUS_OPTIONS,
          } as ColumnMeta,
          size: 200,
          enableSorting: true,
          sortingFn: (rowA, rowB) => {
            const order: string[] = APPLICATION_STATUS_OPTIONS.map(
              (option) => option.value,
            );
            return (
              order.indexOf(
                String(rowA.getValue("applicationStatus")).toLowerCase(),
              ) -
              order.indexOf(
                String(rowB.getValue("applicationStatus")).toLowerCase(),
              )
            );
          },
        },
      ] as ColumnDef<Registration>[])
    : []),
  {
    id: "nfcCard",
    meta: { label: "NFC Card" } as ColumnMeta,
    header: "NFC Card",
    cell: (props) => <NFCCardCell {...props} refreshTable={refreshTable} />,
    size: 120,
    enableSorting: false,
  },
  {
    accessorKey: "basicInformation.fname",
    meta: { label: "First Name" } as ColumnMeta,
    header: ({ column }) => (
      <SortableHeader title="First Name" column={column} />
    ),
    cell: (props) => <TableCell {...props} refreshTable={refreshTable} />,
  },
  {
    accessorKey: "basicInformation.lname",
    meta: { label: "Last Name" } as ColumnMeta,
    header: ({ column }) => (
      <SortableHeader title="Last Name" column={column} />
    ),
    cell: (props) => <TableCell {...props} refreshTable={refreshTable} />,
  },
  {
    accessorKey: "id",
    meta: { label: "Email" } as ColumnMeta,
    header: ({ column }) => <SortableHeader title="Email" column={column} />,
    cell: (props) => <TableCell {...props} refreshTable={refreshTable} />,
  },
  {
    accessorKey: "points",
    header: ({ column }) => <SortableHeader title="Points" column={column} />,
    cell: (props) => <TableCell {...props} refreshTable={refreshTable} />,
    meta: {
      label: "Points",
      type: "number",
    } as ColumnMeta,
  },
  {
    accessorKey: "studentId",
    meta: { label: "Student Number" } as ColumnMeta,
    header: ({ column }) => (
      <SortableHeader title="Student Number" column={column} />
    ),
    cell: (props) => <TableCell {...props} refreshTable={refreshTable} />,
  },
  {
    accessorKey: "basicInformation.faculty",
    filterFn: "equalsString",
    meta: { label: "Faculty" } as ColumnMeta,
    header: ({ column }) => <SortableHeader title="Faculty" column={column} />,
    cell: (props) => <TableCell {...props} refreshTable={refreshTable} />,
  },
  {
    id: "basicInformation_year",
    accessorFn: (row) => {
      const year = row.basicInformation?.year || "";
      return YEAR_STANDING_LABELS[year] || year;
    },
    header: ({ column }) => (
      <SortableHeader title="Year Standing" column={column} />
    ),
    meta: { label: "Year Standing" } as ColumnMeta,
    filterFn: "equalsString",
    cell: ({ getValue }) => getValue() || "—",
  },
  {
    accessorKey: "basicInformation.major",
    header: ({ column }) => <SortableHeader title="Major" column={column} />,
    meta: { label: "Major" } as ColumnMeta,
    filterFn: "equalsString",
    cell: ({ getValue }) => getValue() || "—",
  },
  {
    accessorKey: "updatedAt",
    meta: { label: "Updated At" } as ColumnMeta,
    header: ({ column }) => (
      <SortableHeader title="Updated At" column={column} />
    ),
    cell: ({ getValue }) => {
      const timestamp = getValue() as number;
      if (!timestamp) return "-";
      const date = new Date(timestamp);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.getValue("updatedAt") as number;
      const b = rowB.getValue("updatedAt") as number;
      return (a || 0) - (b || 0);
    },
    enableSorting: true,
  },
  {
    accessorKey: "createdAt",
    meta: { label: "Created At" } as ColumnMeta,
    header: ({ column }) => (
      <SortableHeader title="Created At" column={column} />
    ),
    cell: ({ getValue }) => {
      const timestamp = getValue() as number;
      if (!timestamp) return "-";
      const date = new Date(timestamp);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.getValue("createdAt") as number;
      const b = rowB.getValue("createdAt") as number;
      return (a || 0) - (b || 0);
    },
    enableSorting: true,
  },
];
