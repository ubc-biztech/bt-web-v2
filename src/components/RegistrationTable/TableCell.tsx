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
import { DBRegistrationStatus, RegistrationStatusField } from "@/types";
import NFCPopup from "../NFCWrite/NFCPopup";
import { useUserNeedsCard } from "@/hooks/useUserNeedsCard";

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
    const [profileID, setProfileID] = useState<string | null>(null);

    // Use the custom hook for checking if user needs a card
    const { checkUserNeedsCard } = useUserNeedsCard();

    useEffect(() => {
      setValue(getLabel(initialValue as string));
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

        // Check if user needs an NFC membership card when status is set to checkedIn
        if (column.id === "registrationStatus" && newValue === "checkedIn") {
            const { needsCard, profileID } = await checkUserNeedsCard(
            row.original.id,
          );
          setShowNfcPopup(needsCard);
          setProfileID(profileID);
        }

        await refreshTable();
        setValue(newValue);
      } catch (error) {
        console.error("Failed to update registration:", error);
      }
    };

    const getColor = (value: string) => {
      switch (value) {
        case "Registered":
          return "#AAE7FF";
        case RegistrationStatusField.CHECKED_IN:
          return "#70E442";
        case "Waitlist":
          return "#D79EF1";
        case "Incomplete":
          return "#FFAD8F";
        case RegistrationStatusField.CANCELLED:
          return "#FB6F8E";
        case RegistrationStatusField.WAITLISTED:
          return "#D79EF1";
        default:
          return "#ffffff";
      }
    };
    // this can probably be defined and imported
    const getLabel = (value: string) => {
      switch (value) {
        case "registered":
          return "Registered";
        case "checkedin":
          return "Checked-In";
        case "incomplete":
          return "Incomplete";
        case "cancelled":
          return "Cancelled";
        case "accepted":
          return "Accepted";
        case "waitlist":
          return "Waitlist";
        case "reviewing":
          return "Reviewing";
        case "rejected":
          return "Rejected";
        default:
          return value;
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
                style={{ backgroundColor: getColor(value as string) }}
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
            {showNfcPopup && profileID && (
              <NFCPopup
                firstName={row.original.fname}
                email={row.original.id}
                uuid={profileID}
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
