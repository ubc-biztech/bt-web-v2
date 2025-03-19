import React, { useEffect, useState } from 'react'
import { Row, Table } from "@tanstack/react-table"
import { AttendeeBasicInformation } from "@/types/types";
import SelectCell from './userPopupEdit'
import { ColumnMeta } from '../columns'
import { Registration } from '@/types/types';

interface EditCellProps {
  row: Row<Registration>;
  table: Table<Registration>;
  refreshTable: () => Promise<void>;
}

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
  const fieldsToDisplay = Object.keys(row.original).filter(
    (key) =>
      key !== "shouldNotDisplay" &&
      key !== "id" &&
      key !== "dynamicResponses" &&
      key !== "basicInformation"
  ) as Array<keyof Registration>;
  
  return (
    <div className="text-white gap-4 m-3 grid auto-cols-fr sm:grid-cols-2">
      {fieldsToDisplay.map((key) => (
        <div key={key}>
          <label className="block font-bold text-baby-blue">{fieldLabels[key] || key}:</label>
          {key === "registrationStatus" || key === "applicationStatus" ? (
            <SelectCell
              row={row.original}
              column={key}
              originalValue={row.original[key]}
              dropDownList={dropDownList[key]}
              table={table}
              refreshTable={refreshTable}
            />
          ) : key === "points" ? (
            <SelectCell
              row={row.original}
              column={key}
              originalValue={row.original[key]}
              dropDownList={dropDownList[key]}
              table={table}
              refreshTable={refreshTable}
            />
          ) : (
            <span>{String(row.original[key])}</span>
          )}
        </div>
      ))}
      {(Object.keys(row.original.basicInformation || {}) as Array<keyof AttendeeBasicInformation>).map((key) => (
        <div key={key}>
          <label className="block font-bold text-baby-blue">{key}:</label>
          <span>{String(row.original.basicInformation[key])}</span>
        </div>
      ))}
    </div>
  );
};

export default UserInfo;
