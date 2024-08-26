"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { TableCell } from "./TableCell"
import { EditCell } from "./EditCell"
import { Registration } from "@/types/types"
import { DBRegistrationStatus } from "@/types/types"

export type ColumnMeta = {
    type?: "select" | "number";
    options?: { value: string; label: string }[];
}

export const columns: ColumnDef<Registration>[] = [
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
        accessorKey: "registrationStatus",
        header: "Reg. Status",
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
    },
    {
        accessorKey: "applicationStatus",
        header: "App. Status",
        cell: TableCell,
        meta: {
            type: "select",
            options: [ // These values were inferred from the database
                { value: "Accepted", label: "Accepted" },
                { value: "Reviewing", label: "Reviewing" },
                { value: "Waitlist", label: "Waitlist" },
                { value: "Rejected", label: "Rejected" },
            ],
        } as ColumnMeta,
        size: 200,
    },
    {
        accessorKey: "basicInformation.fname",
        header: "First Name",
        cell: TableCell,
    },
    {
        accessorKey: "basicInformation.lname",
        header: "Last Name",
        cell: TableCell,
    },
    {
        accessorKey: "id",
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
        accessorKey: "basicInformation.faculty",
        header: "Faculty",
        cell: TableCell,
    }
]
