import React, { ChangeEvent, useEffect, useState } from 'react'
import { Row, Table } from "@tanstack/react-table"
import { Attendee } from "../columns"
import SelectCell from './userPopupEdit'
import { ColumnMeta } from '../columns'

interface EditCellProps {
    row: Row<Attendee>,
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
    
    const fieldsToDisplay = Object.keys(row.original).filter(key => key !== 'shouldNotDisplay' && key !== 'id');


    return (
        <div className="text-white gap-4 m-3 grid auto-cols-fr sm:grid-cols-2">
            {fieldsToDisplay?.map((key) => (
                <div key={key}>
                    <label className="block font-bold text-baby-blue">{fieldLabels[key]}:</label>
                    {key === 'regStatus' || key === 'appStatus' ? (
                        <SelectCell originalValue={row.original[key]} dropDownList={dropDownList[key]}/>
                    ) : key === 'points' ? (
                        <SelectCell originalValue={row.original[key]} dropDownList={dropDownList[key]}/>
                    ) : (
                        <span>{row.original[key]}</span>
                    )}
                </div>
            ))}
        </div>
    )
}

export default UserInfo

