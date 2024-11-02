import React, { useState, useEffect, ChangeEvent } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { CellContext } from "@tanstack/react-table"
import { Attendee, ColumnMeta } from "./columns"
import { updateRegistrationData, prepareUpdatePayload } from '@/lib/dbUtils'

interface TableCellProps extends CellContext<Attendee, unknown> {
    refreshTable: () => Promise<void>;
}

export const TableCell = ({ getValue, column, row, refreshTable}: TableCellProps) => {
    const initialValue = getValue()
    const columnMeta = column.columnDef.meta as ColumnMeta
    const [value, setValue] = useState(initialValue)

    useEffect(() => {
        setValue(getLabel(initialValue as string))

    }, [initialValue])

    const onBlur = async () => {
        let eventId = row.original['eventID;year'].slice(0, row.original['eventID;year'].indexOf(";"))
        let year = row.original['eventID;year'].slice(row.original['eventID;year'].indexOf(";") + 1)

        const body = prepareUpdatePayload(column.id, value, eventId, year);

        try {
            await updateRegistrationData(row.original.id, row.original.fname, body);
            await refreshTable();
        } catch (error) {
            console.error("Failed to update registration:", error);
        }
    }

    const onSelectChange = async (newValue: string) => {
        let eventId = row.original['eventID;year'].slice(0, row.original['eventID;year'].indexOf(";"))
        let year = row.original['eventID;year'].slice(row.original['eventID;year'].indexOf(";") + 1)

        const body = prepareUpdatePayload(column.id, newValue, eventId, year);

        try {
            await updateRegistrationData(row.original.id, row.original.fname, body);
            await refreshTable();
            setValue(newValue);
        } catch (error) {
            console.error("Failed to update registration:", error);
        }
    }

    const getColor = (value: string) => {
        switch (value) {
            case 'Registered':
                return '#7F94FF';
            case 'Checked-In':
                return '#7AD040';
            case 'Waitlist':
                return '#E6CA68';
            case 'Incomplete':
                return '#E6CA68';
            case 'Cancelled':
                return '#FF8282';
            default:
                return '#ffffff';
        }
    }
    // this can probably be defined and imported
    const getLabel = (value: string) => {
        switch (value) {
            case 'registered':
                return 'Registered';
            case 'checkedIn':
                return 'Checked-In';
            case 'incomplete':
                return 'Incomplete';
            case 'cancelled':
                return 'Cancelled';
            case 'accepted':
                return 'Accepted';
            case 'waitlist':
                return 'Waitlist';
            case 'reviewing':
                return 'Reviewing';
            case 'rejected':
                return 'Rejected';
            default:
                return value;
        }
    }

    if (column.id === 'registrationStatus' || column.id === 'points') {
        if (columnMeta?.type === "select") {
            return (
                <Select onValueChange={onSelectChange} defaultValue={initialValue as string}>
                    <SelectTrigger style={{ color: getColor(value as string) }}>
                        <SelectValue>{value as string}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {columnMeta.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )
        } else if (columnMeta?.type === "number") {
            return (
                <Input
                    type="number"
                    value={value as number}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(Number(e.target.value))}
                    onBlur={onBlur}
                />
            )
        }
    }

    return <span>{value as string}</span>
}
