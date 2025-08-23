"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell } from "./TableCell";
import { EditCell } from "./EditCell";
import { SortableHeader } from "./SortableHeader";
import { BiztechEvent, DBRegistrationStatus } from "@/types/types";
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
              table.getIsAllPageRowsSelected() ||
              table.getIsSomePageRowsSelected()
                ? "indeterminate"
                : false

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
            className={cn('font-bold', !isChecked ? 'bg-white' : 'bg-[#005BFF] border-none shadow-inner-white-md')}
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
          className={'font-bold bg-white border-none shadow-inner-white-md data-[state=checked]:bg-[#005BFF] data-[state=checked]:text-primary-foreground'}
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
    cell: (props) => <TableCell {...props} refreshTable={refreshTable} />,
    meta: {
      type: "select",
      options: [
        { value: DBRegistrationStatus.REGISTERED, label: "Registered" },
        { value: DBRegistrationStatus.CHECKED_IN, label: "Checked-In" },
        { value: DBRegistrationStatus.CANCELLED, label: "Cancelled" },
        { value: DBRegistrationStatus.INCOMPLETE, label: "Incomplete" },
        { value: DBRegistrationStatus.WAITLISTED, label: "Waitlisted" },
      ],
    } as ColumnMeta,
    size: 200,
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const order = [
        DBRegistrationStatus.CHECKED_IN,
        DBRegistrationStatus.REGISTERED,
        DBRegistrationStatus.INCOMPLETE,
        DBRegistrationStatus.CANCELLED,
      ];
      return (
        order.indexOf(rowA.getValue("registrationStatus")) -
        order.indexOf(rowB.getValue("registrationStatus"))
      );
    },
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
        { value: "Accepted", label: "Accepted" },
        { value: "Reviewing", label: "Reviewing" },
        { value: "Waitlist", label: "Waitlist" },
        { value: "Rejected", label: "Rejected" },
      ],
    } as ColumnMeta,
    size: 200,
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const order = ["Accepted", "Reviewing", "Waitlist", "Rejected"];
      return (
        order.indexOf(rowA.getValue("applicationStatus")) -
        order.indexOf(rowB.getValue("applicationStatus"))
      );
    },
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
