import React, { ChangeEvent, useEffect, useState } from 'react'
import { Row, Table } from "@tanstack/react-table"
import { Attendee } from "../columns"
import SelectCell from './userPopupEdit'
import { ColumnMeta } from '../columns'

interface EditCellProps {
    row: Attendee,
    table: Table<Attendee>
}

const UserInfo: React.FC<EditCellProps> = ({ row, table }) => {
    const [fieldLabels, setFieldLabels] = useState<{ [key: string]: string }>({});
    const [dropDownList, setDropDownList] = useState<{ [key: string]: string[] }>({});

    useEffect(() => {
        const generateFieldLabels = () => {
            const columns = table.getAllColumns();
            const labels: { [key: string]: string } = {};

            columns.forEach((column) => {
                const accessorKey = column.id;
                const header = column.columnDef.header;

                if (accessorKey && typeof header === 'string') {
                    labels[accessorKey] = header;
                }
            });
            return labels;
        };

        setFieldLabels(generateFieldLabels());

        const generateDropDownList = () => {
            const columns = table.getAllColumns();
            const options: { [key: string]: string[] } = {};
            columns.forEach(column => {
                // had to import meta as Column Meta or else encountered errors
                const meta = column.columnDef.meta as ColumnMeta | undefined;
                if (meta?.type === 'select') {
                    options[column.id] = meta.options?.map(opt => opt.value) || [];
                }
            });
            return options;
        };

        setDropDownList(generateDropDownList());

    }, [table]);

    let fieldsToDisplay = Object.keys(row).filter(key => key !== 'shouldNotDisplay'
        && key != 'dynamicResponses'
        && key != 'scannedQRs'
        && key != 'basicInformation'
        && key != 'updatedAt'
        && key != 'eventID;year'
        && key != 'isPartner'
        && key != 'fname');

    fieldsToDisplay = fieldsToDisplay.concat(
        Object.keys(row.basicInformation)
            .filter(key => key !== 'fname' && key !== 'lname' && key != 'heardFrom')
            .map(key => 'basicInformation_' + key)
    );

    return (
        <div className="text-white gap-4 m-3 grid auto-cols-fr sm:grid-cols-2">
            {fieldsToDisplay?.map((key: string) => (
                <div key={key}>
                    <label className="block font-bold text-baby-blue">{fieldLabels[key]}:</label>
                    {key === 'registrationStatus' || key === 'applicationStatus' ? (
                        <SelectCell column={key} table={table} row={row} originalValue={row[key]} dropDownList={dropDownList[key]} />
                    ) : key === 'points' ? (
                        <SelectCell column={key} table={table} row={row} originalValue={row[key]} dropDownList={dropDownList[key]} />
                    ) : key.startsWith("basicInformation_") ? (
                        <span>{row.basicInformation[key.slice(key.indexOf('basicInformation_') + "basicInformation_".length)]}</span>
                    ) : (
                        <span>{row[key]}</span>
                    )}
                </div>
            ))}
        </div>
    )
}

export default UserInfo

