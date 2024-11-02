import React, { ChangeEvent, useEffect, useState } from 'react'
import { Row, Table } from "@tanstack/react-table"
import { Attendee } from "../columns"
import SelectCell from './userPopupEdit'
import { ColumnMeta } from '../columns'

interface EditCellProps {
    row: Attendee,
    table: Table<Attendee>,
    refreshTable: () => Promise<void>
}

const isBasicInfoKey = (key: string): key is keyof Attendee['basicInformation'] => {
    const validKeys = ['diet', 'faculty', 'fname', 'gender', 'heardFrom', 'lname', 'major', 'year'];
    return validKeys.includes(key);
};

const UserInfo: React.FC<EditCellProps> = ({ row, table, refreshTable }) => {
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
                        <SelectCell 
                            column={key} 
                            table={table} 
                            row={row} 
                            originalValue={row[key]} 
                            dropDownList={dropDownList[key]}
                            refreshTable={refreshTable}
                        />
                    ) : key === 'points' ? (
                        <SelectCell 
                            column={key} 
                            table={table} 
                            row={row} 
                            originalValue={row[key]} 
                            dropDownList={dropDownList[key]}
                            refreshTable={refreshTable}
                        />
                    ) : key.startsWith("basicInformation_") ? (
                        <span>
                            {(() => {
                                const basicInfoKey = key.replace("basicInformation_", "");
                                if (isBasicInfoKey(basicInfoKey)) {
                                    return row.basicInformation[basicInfoKey];
                                }
                                return '';
                            })()}
                        </span>
                    ) : (
                        <span>{key in row ? String(row[key as keyof Attendee]) : ''}</span>
                    )}
                </div>
            ))}
        </div>
    )
}

export default UserInfo

