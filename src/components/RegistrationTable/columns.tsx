"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell } from "./TableCell";
import { EditCell } from "./EditCell";
import { SortableHeader } from "./SortableHeader";
import { DBRegistrationStatus } from "@/types/types"

export type Attendee = {
    'eventID;year': string;
    applicationStatus: string;
    basicInformation: {
      diet: string;
      faculty: string;
      fname: string;
      gender: string[];
      heardFrom: string;
      lname: string;
      major: string;
      year: string;
    };
    dynamicResponses: Record<string, string>;
    eventID: string;
    fname: string;
    id: string;
    isPartner: boolean;
    points: number;
    registrationStatus: string;
    scannedQRs: string[];
    studentId: string;
    updatedAt: number;
}

export type ColumnMeta = {
    type?: "select" | "number";
    options?: { value: string; label: string }[];
};

export const createColumns = (refreshTable: () => Promise<void>): ColumnDef<Attendee>[] => [
    {
        id: "edit",
        size: 30,
        cell: (props) => <EditCell {...props} refreshTable={refreshTable} />,
    },
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center">
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value: any) =>
                        table.toggleAllPageRowsSelected(!!value)
                    }
                    aria-label="Select all"
                />
            </div>
        ),
        size: 50,
        cell: ({ row }) => (
            <div className="flex items-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value: any) =>
                        row.toggleSelected(!!value)
                    }
                    aria-label="Select row"
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
            const order = [DBRegistrationStatus.CHECKED_IN, DBRegistrationStatus.REGISTERED, DBRegistrationStatus.INCOMPLETE, DBRegistrationStatus.CANCELLED];
            return (
                order.indexOf(rowA.getValue("registrationStatus")) -
                order.indexOf(rowB.getValue("registrationStatus"))
            );
        },
    },
    {
        accessorKey: "applicationStatus",
        header: ({ column }) => (<SortableHeader title="App. Status" column={column} />),
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
        header: ({ column }) => (<SortableHeader title="First Name" column={column} />),
        cell: (props) => <TableCell {...props} refreshTable={refreshTable} />,
    },
    {
        accessorKey: "basicInformation.lname",
        header: ({ column }) => (<SortableHeader title="Last Name" column={column} />),
        cell: (props) => <TableCell {...props} refreshTable={refreshTable} />,
    },
    {
        accessorKey: "id",
        header: ({ column }) => (<SortableHeader title="Email" column={column} />),
        cell: (props) => <TableCell {...props} refreshTable={refreshTable} />,
    },
    {
        accessorKey: "points",
        header: ({ column }) => (<SortableHeader title="Points" column={column} />),
        cell: (props) => <TableCell {...props} refreshTable={refreshTable} />,
        meta: {
            type: "number",
        } as ColumnMeta,
    },
    {
        accessorKey: "studentId",
        header: ({ column }) => (<SortableHeader title="Student Number" column={column} />),
        cell: (props) => <TableCell {...props} refreshTable={refreshTable} />,
    },
    {
        accessorKey: "basicInformation.faculty",
        header: ({ column }) => (<SortableHeader title="Faculty" column={column} />),
        cell: (props) => <TableCell {...props} refreshTable={refreshTable} />,
    },
];
