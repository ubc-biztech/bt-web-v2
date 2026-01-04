import React, { useState, useEffect, ChangeEvent, memo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CellContext } from "@tanstack/react-table";
import { ColumnMeta } from "./columns";
import { Registration } from "@/types/types";
import { updateRegistrationData, prepareUpdatePayload } from "@/lib/dbUtils";
import { NfcPopup } from "../NFCWrite/NFCPopup";
import { useUserNeedsCard } from "@/hooks/useUserNeedsCard";
import { getStatusLabel, getStatusColor } from "@/lib/registrationStatus";

interface TableCellProps extends CellContext<Registration, unknown> {
  refreshTable: () => Promise<void>;
}

export const TableCell = memo(
  ({ getValue, column, row, refreshTable }: TableCellProps) => {
    const initialValue = getValue();
    const columnMeta = column.columnDef.meta as ColumnMeta;
    const [value, setValue] = useState(initialValue);

    // NFC popup state - controls when to show membership card writing interface
    const [showNfcPopup, setShowNfcPopup] = useState(false);

    useEffect(() => {
      setValue(getStatusLabel(initialValue as string));
    }, [initialValue, column.id, row.original.id]);

    const onBlur = async () => {
      let eventId = row.original["eventID;year"].slice(
        0,
        row.original["eventID;year"].indexOf(";"),
      );
      let year = row.original["eventID;year"].slice(
        row.original["eventID;year"].indexOf(";") + 1,
      );

      const body = prepareUpdatePayload(column.id, value, eventId, year);

      try {
        await updateRegistrationData(row.original.id, row.original.fname, body);
        await refreshTable();
      } catch (error) {
        console.error("Failed to update registration:", error);
      }
    };

    const onSelectChange = async (newValue: string) => {
      if (newValue == value) return;

      let eventId = row.original["eventID;year"].slice(
        0,
        row.original["eventID;year"].indexOf(";"),
      );
      let year = row.original["eventID;year"].slice(
        row.original["eventID;year"].indexOf(";") + 1,
      );

      const body = prepareUpdatePayload(column.id, newValue, eventId, year);

      try {
        await updateRegistrationData(row.original.id, row.original.fname, body);
        setValue(newValue);
      } catch (error) {
        console.error("Failed to update registration:", error);
      }
    };

    if (column.id === "registrationStatus" || column.id === "points") {
      if (columnMeta?.type === "select") {
        const handleSelectChange = (newValue: string) => {
          onSelectChange(newValue);
        };

        return (
          <>
            <Select
              onValueChange={handleSelectChange}
              defaultValue={initialValue as string}
            >
              <SelectTrigger
                className="rounded-full text-xs text-bt-blue-500 h-fit py-1.5 border-none shadow-inner-md gap-2"
                style={{
                  backgroundColor: getStatusColor(initialValue as string),
                }}
              >
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

            {/* NFC popup for membership card writing */}
            {showNfcPopup && (
              <NfcPopup
                firstName={row.original.fname}
                email={row.original.id}
                uuid={""}
                exit={() => {
                  setShowNfcPopup(false);
                }}
                numCards={0}
              />
            )}
          </>
        );
      } else if (columnMeta?.type === "number") {
        return (
          <Input
            type="number"
            value={value as number}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setValue(Number(e.target.value))
            }
            onBlur={onBlur}
            className="w-24 h-8"
          />
        );
      }
    }

    return <span>{value as string}</span>;
  },
  (prevProps, nextProps) => {
    return (
      prevProps.getValue() === nextProps.getValue() &&
      prevProps.column.id === nextProps.column.id &&
      prevProps.row.original.id === nextProps.row.original.id &&
      prevProps.row.original["eventID;year"] ===
        nextProps.row.original["eventID;year"]
    );
  },
);

TableCell.displayName = "TableCell";
