"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell } from "./TableCell";
import { EditCell } from "./EditCell";
import { SortableHeader } from "./SortableHeader";

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

export const columns: ColumnDef<Attendee>[] = [
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
        accessorKey: "regStatus",
        header: ({ column }) => (
            <SortableHeader title="Reg. Status" column={column} />
        ),
        cell: TableCell,
        meta: {
            type: "select",
            options: [
                { value: "Registered", label: "Registered" },
                { value: "Checked-In", label: "Checked-In" },
                { value: "Cancelled", label: "Cancelled" },
                { value: "Incomplete", label: "Incomplete" },
            ],
        } as ColumnMeta,
        size: 200,
        enableSorting: true, 
        sortingFn: (rowA, rowB) => {
            const order = ["Checked-In", "Registered", "Incomplete", "Cancelled"];
            return (
                order.indexOf(rowA.getValue("regStatus")) -
                order.indexOf(rowB.getValue("regStatus"))
            );
        },
    },
    {
        accessorKey: "appStatus",
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
                order.indexOf(rowA.getValue("appStatus")) -
                order.indexOf(rowB.getValue("appStatus"))
            );
        },
    },
    {
        accessorKey: "firstName",
        header: ({ column }) => (<SortableHeader title="First Name" column={column} />),
        cell: TableCell,
    },
    {
        accessorKey: "lastName",
        header: ({ column }) => (<SortableHeader title="Last Name" column={column} />),
        cell: TableCell,
    },
    {
        accessorKey: "email",
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
        accessorKey: "studentNumber",
        header: ({ column }) => (<SortableHeader title="Student Number" column={column} />),
        cell: TableCell,
    },
    {
        accessorKey: "faculty",
        header: ({ column }) => (<SortableHeader title="Faculty" column={column} />),
        cell: TableCell,
    },
];
