"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell } from "./TableCell";
import { EditCell } from "./EditCell";
import { NFCCardCell } from "./NFCCardCell";
import { SortableHeader } from "./SortableHeader";
import { ApplicationStatus, BiztechEvent, DBRegistrationStatus, RegistrationStatus } from "@/types/types";
import { Registration } from "@/types/types";
import { cn } from "@/lib/utils";

export type ColumnMeta = {
  type?: "select" | "number";
  options?: { value: string; label: string }[];
};

export const createColumns = (
  refreshTable: () => Promise<void>,
  eventData: BiztechEvent,
): ColumnDef<Registration>[] => [
  {
    id: "edit",
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
    accessorKey: "applicationStatus",
    header: ({ column }) => (
      <SortableHeader title="App. Status" column={column} />
    ),
    cell: (props) => <TableCell {...props} refreshTable={refreshTable} />,
    meta: {
      type: "select",
      options: [
        { value: ApplicationStatus.REGISTERED, label: "Registered" },
        { value: ApplicationStatus.INCOMPLETE, label: "Incomplete" },
        { value: ApplicationStatus.ACCEPTED, label: "Accepted" },
        { value: ApplicationStatus.WAITLISTED, label: "Waitlisted" },
        { value: ApplicationStatus.REJECTED, label: "Rejected" },
        { value: ApplicationStatus.CHECKED_IN, label: "Checked-In" },
        { value: ApplicationStatus.CANCELLED, label: "Cancelled" },
      ],
    } as ColumnMeta,
    size: 200,
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const order = [ApplicationStatus.ACCEPTED, ApplicationStatus.WAITLISTED, ApplicationStatus.REJECTED, ApplicationStatus.CHECKED_IN, ApplicationStatus.CANCELLED, ApplicationStatus.REGISTERED, ApplicationStatus.INCOMPLETE];
      return (
        order.indexOf(rowA.getValue("applicationStatus")) -
        order.indexOf(rowB.getValue("applicationStatus"))
      );
    },
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
      type: "select",
      options: [
        { value: RegistrationStatus.COMPLETE, label: "Complete" },
        { value: RegistrationStatus.PAYMENTPENDING, label: "Payment Pending" },
        { value: RegistrationStatus.REVIEWING, label: "Reviewing" },
        { value: RegistrationStatus.PENDING, label: "Pending" },
      ],
    } as ColumnMeta,
    size: 200,
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const order = [
        RegistrationStatus.COMPLETE,
        RegistrationStatus.PAYMENTPENDING,
        RegistrationStatus.REVIEWING,
        RegistrationStatus.PENDING,
      ];
      return order.indexOf(rowA.getValue("registrationStatus")) -
        order.indexOf(rowB.getValue("registrationStatus"))
    },
  },
  {
    id: "nfcCard",
    header: "NFC Card",
    cell: (props) => <NFCCardCell {...props} refreshTable={refreshTable} />,
    size: 120,
    enableSorting: false,
  },
  {
    accessorKey: "basicInformation.fname",
    header: ({ column }) => (
      <SortableHeader title="First Name" column={column} />
    ),
    cell: (props) => <TableCell {...props} refreshTable={refreshTable} />,
  },
  {
    accessorKey: "basicInformation.lname",
    header: ({ column }) => (
      <SortableHeader title="Last Name" column={column} />
    ),
    cell: (props) => <TableCell {...props} refreshTable={refreshTable} />,
  },
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader title="Email" column={column} />,
    cell: (props) => <TableCell {...props} refreshTable={refreshTable} />,
  },
  {
    accessorKey: "points",
    header: ({ column }) => <SortableHeader title="Points" column={column} />,
    cell: (props) => <TableCell {...props} refreshTable={refreshTable} />,
    meta: {
      type: "number",
    } as ColumnMeta,
  },
  {
    accessorKey: "studentId",
    header: ({ column }) => (
      <SortableHeader title="Student Number" column={column} />
    ),
    cell: (props) => <TableCell {...props} refreshTable={refreshTable} />,
  },
  {
    accessorKey: "basicInformation.faculty",
    header: ({ column }) => <SortableHeader title="Faculty" column={column} />,
    cell: (props) => <TableCell {...props} refreshTable={refreshTable} />,
  },
];
