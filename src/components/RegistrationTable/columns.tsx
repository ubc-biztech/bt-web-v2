"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { TableCell } from "./TableCell"
import { EditCell } from "./EditCell"

// export type Attendee = {
//     id: string
//     regStatus: string
//     appStatus: string
//     firstName: string
//     lastName: string
//     email: string
//     points: number
//     studentNumber: string
//     faculty: string
//     [key: string]: any // This allows for dynamic properties
// }

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
}

export const createColumns = (refreshTable: () => Promise<void>): ColumnDef<Attendee>[] => [
    {
        id: 'edit',
        size: 30,
        cell: ({ row, table }) => <EditCell row={row} table={table} refreshTable={refreshTable} />,
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
                { value: "Registered", label: "Registered" },
                { value: "Checked-In", label: "Checked-In" },
                { value: "Cancelled", label: "Cancelled" },
                { value: "Incomplete", label: "Incomplete" },
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
        accessorKey: "fname",
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
        accessorKey: "studentId",
        header: "Student Number",
        cell: TableCell,
    },
    {
        accessorKey: "basicInformation.faculty",
        header: "Faculty",
        cell: TableCell,
    },
    {
        accessorKey: "basicInformation.gender",
        header: "Gender",
        cell: TableCell,
    },
    {
        accessorKey: "basicInformation.diet",
        header: "Diet",
        cell: TableCell,
    },
    {
        accessorKey: "basicInformation.major",
        header: "Major",
        cell: TableCell,
    }, 
    {
        accessorKey: "basicInformation.year",
        header: "Year",
        cell: TableCell,
    },
    {
        accessorKey: "basicInformation.companyName",
        header: "Company",
        cell: TableCell,
    },
    {
        accessorKey: "basicInformation.role",
        header: "Role",
        cell: TableCell,
    }
]
