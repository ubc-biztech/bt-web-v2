"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell } from "./TableCell";
import { EditCell } from "./EditCell";
import { SortableHeader } from "./SortableHeader";
import { Registration } from "@/types/types"
import { DBRegistrationStatus } from "@/types/types"

export type Attendee = {
    id: string;
    regStatus: string;
    appStatus: string;
    firstName: string;
    lastName: string;
    email: string;
    points: number;
    studentNumber: string;
    faculty: string;
    [key: string]: any; // This allows for dynamic properties
};

export type ColumnMeta = {
    type?: "select" | "number";
    options?: { value: string; label: string }[];
};

export const columns: ColumnDef<Registration>[] = [
    {
        id: "edit",
        size: 30,
        cell: ({ row, table }) => <EditCell row={row} table={table} />,
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
        cell: TableCell,
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
        cell: TableCell,
        meta: {
            type: "select",
            options: [
                // These values were inferred from the database
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
        cell: TableCell,
    },
    {
        accessorKey: "basicInformation.lname",
        header: ({ column }) => (<SortableHeader title="Last Name" column={column} />),
        cell: TableCell,
    },
    {
        accessorKey: "id",
        header: ({ column }) => (<SortableHeader title="Email" column={column} />),
        cell: TableCell,
    },
    {
        accessorKey: "points",
        header: ({ column }) => (<SortableHeader title="Points" column={column} />),
        cell: TableCell,
        meta: {
            type: "number",
        } as ColumnMeta,
    },
    {
        accessorKey: "studentId",
        header: ({ column }) => (<SortableHeader title="Student Number" column={column} />),
        cell: TableCell,
    },
    {
        accessorKey: "basicInformation.faculty",
        header: ({ column }) => (<SortableHeader title="Faculty" column={column} />),
        cell: TableCell,
    },
];
