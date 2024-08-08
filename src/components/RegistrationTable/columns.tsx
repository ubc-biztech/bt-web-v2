"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { TableCell } from "./TableCell"
import { EditCell } from "./EditCell"

export type Attendee = {
    id: string
    regStatus: string
    appStatus: string
    firstName: string
    lastName: string
    email: string
    points: number
    studentNumber: string
    faculty: string
    [key: string]: any // This allows for dynamic properties
}

export type ColumnMeta = {
    type?: "select" | "number";
    options?: { value: string; label: string }[];
}

export const columns: ColumnDef<Attendee>[] = [
    {
        id: 'edit',
        size: 30,
        cell: ({ row, table }) => <EditCell row={row} table={table} />,
    },
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center">
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value: any) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            </div>
        ),
        size: 50,
        cell: ({ row }) => (
            <div className="flex items-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value: any) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "regStatus",
        header: "Reg. Status",
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
    },
    {
        accessorKey: "appStatus",
        header: "App. Status",
        cell: TableCell,
        meta: {
            type: "select",
            options: [ // These values were inferred from the 
                { value: "Accepted", label: "Accepted" },
                { value: "Reviewing", label: "Reviewing" },
                { value: "Waitlist", label: "Waitlist" },
                { value: "Rejected", label: "Rejected" },
            ],
        } as ColumnMeta,
        size: 200,
    },
    {
        accessorKey: "firstName",
        header: "First Name",
        cell: TableCell,
    },
    {
        accessorKey: "lastName",
        header: "Last Name",
        cell: TableCell,
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: TableCell,
    },
    {
        accessorKey: "points",
        header: "Points",
        cell: TableCell,
        meta: {
            type: "number",
        } as ColumnMeta,
    },
    {
        accessorKey: "studentNumber",
        header: "Student Number",
        cell: TableCell,
    },
    {
        accessorKey: "faculty",
        header: "Faculty",
        cell: TableCell,
    }
]
