import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import React, { useState } from 'react'
import { updateRegistrationData } from "@/lib/dbUtils"
import { Attendee } from "../columns"
import { Row, Table } from "@tanstack/react-table"


interface SelectCellProps {
    row: Attendee,
    column: string,
    originalValue: string | number,
    dropDownList: string[]
    table: Table<Attendee>,
}

const SelectCell: React.FC<SelectCellProps> = ({ row, column, originalValue, dropDownList, table }) => {
    const [value, setValue] = useState(originalValue)

    const onBlur = () => {
        // table.options.meta?.updateData(row.index, column, value);
        let eventId = row['eventID;year'].slice(0, row['eventID;year'].indexOf(";"))
        let year = row['eventID;year'].slice(row['eventID;year'].indexOf(";") + 1)

        const body = {
            eventID: eventId,
            year: parseInt(year),
            [column]: parseInt(value as string),
        };

        // UNCOMMENT IF YOU WANT THIS TO ACTUALLY CHANGE
        updateRegistrationData(row.id, row.fname, body);
        // Reload to get it to re-fetch data 
        // - potentially change to useState which re-triggers useEffect()?
        window.location.reload();
    }

    const onSelectChange = (newValue: string) => {
        // table.options.meta?.updateData(row.index, column, newValue);
        setValue(newValue)
        let eventId = row['eventID;year'].slice(0, row['eventID;year'].indexOf(";"))
        let year = row['eventID;year'].slice(row['eventID;year'].indexOf(";") + 1)

        const body = {
            eventID: eventId,
            year: parseInt(year),
            [column]: newValue,
        };

        // UNCOMMENT IF YOU WANT THIS TO ACTUALLY CHANGE
        updateRegistrationData(row.id, row.fname, body);
        // Reload to get it to re-fetch data
        window.location.reload();
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

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

    return (
        <div>
            {dropDownList ? (
                <Select onValueChange={onSelectChange} defaultValue="Not Found">
                    <SelectTrigger className="p3 rounded-none bg-events-active-tab-bg text-white p-0 border-0 border-b-2 border-b-baby-blue">
                        <SelectValue>
                            {getLabel(value as string)}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className='focus:border-0 bg-white'>
                        <SelectGroup>
                            {/* Use the key to access the correct dropDownList */}
                            {dropDownList.map((item) => (
                                <SelectItem key={item} value={item}>
                                    {item}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            ) : (
                <Input
                    className="p3 rounded-none bg-events-active-tab-bg text-white p-0 border-0 border-b-2 border-b-baby-blue"
                    type="number"
                    value={value}
                    onChange={handleInputChange}
                    onBlur={onBlur}
                />
            )}
        </div>
    );
}

export default SelectCell;

