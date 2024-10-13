import React, { useState, useEffect, ChangeEvent } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { CellContext } from "@tanstack/react-table"
import { ColumnMeta } from "./columns"
import { Registration } from '@/types/types'
import { DBRegistrationStatus } from '@/types/types'

type TableCellProps = CellContext<Registration, unknown>

export const TableCell: React.FC<TableCellProps> = ({ getValue, column }) => {
    const initialValue = getValue()
    const columnMeta = column.columnDef.meta as ColumnMeta
    const [value, setValue] = useState(initialValue)

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    const onBlur = () => {
        // tableMeta?.updateData(row.index, column.id, value)
        console.log("TODO - update data")
    }

    const onSelectChange = (newValue: string) => {
        setValue(newValue)
        console.log("TODO - update data")
        // tableMeta?.updateData(row.index, column.id, newValue)
    }

    const getColor = (value: string) => {
        switch(value) {
            case DBRegistrationStatus.REGISTERED:
                return '#7F94FF';
            case DBRegistrationStatus.CHECKED_IN:
                return '#7AD040';
            case DBRegistrationStatus.INCOMPLETE:
                return '#E6CA68';
            case DBRegistrationStatus.CANCELLED:
                return '#E24D83';
            case DBRegistrationStatus.WAITLISTED: 
                return '#FF8181';
            default:
                return '#ffffff';
        }
    }

    if (column.id === 'registrationStatus' || column.id === 'points') {
        if (columnMeta?.type === "select") {
            return (
                <Select onValueChange={onSelectChange} defaultValue={initialValue as string}>
                    <SelectTrigger style={{color: getColor(value as string)}}>
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
