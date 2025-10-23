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
import { ApplicationStatus, RegistrationStatus } from "@/types/types";
import { NfcPopup } from "../NFCWrite/NFCPopup";
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

      const body = prepareUpdatePayload(
        column.id, 
        value, 
        eventId, 
        year,
        row.original.applicationStatus,
        row.original.registrationStatus
      );

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

      const body = prepareUpdatePayload(
        column.id, 
        newValue, 
        eventId, 
        year,
        row.original.applicationStatus,
        row.original.registrationStatus
      );

      try {
        await updateRegistrationData(row.original.id, row.original.fname, body);
        setValue(newValue);
        await refreshTable();
      } catch (error) {
        console.error("Failed to update registration:", error);
      }
    };

    // Updated color scheme for new status system
    const getColor = (value: string) => {
      switch (value) {
        // Application Status colors
        case ApplicationStatus.REGISTERED:
        case "Registered":
          return "#AAE7FF"; // Light blue
        case ApplicationStatus.INCOMPLETE:
        case "Incomplete":
          return "#FFAD8F"; // Orange
        case ApplicationStatus.ACCEPTED:
        case "Accepted":
          return "#70E442"; // Green
        case ApplicationStatus.WAITLISTED:
        case "Waitlist":
          return "#D79EF1"; // Purple
        case ApplicationStatus.REJECTED:
        case "Rejected":
          return "#FB6F8E"; // Red
        case ApplicationStatus.CHECKED_IN:
        case "Checked-In":
          return "#70E442"; // Green
        case ApplicationStatus.CANCELLED:
        case "Cancelled":
          return "#FB6F8E"; // Red
        
        // Registration Status colors
        case RegistrationStatus.REVIEWING:
        case "Reviewing":
          return "#AAE7FF"; // Light blue
        case RegistrationStatus.PENDING:
        case "Pending":
          return "#FFFF00"; // yellow 
        case RegistrationStatus.PAYMENTPENDING:
        case "Payment Pending":
          return "#FFFF00"; // yellow 
        case RegistrationStatus.COMPLETE:
        case "Complete":
          return "#70E442"; // Green
        
        // Legacy status support
        case "registered":
          return "#AAE7FF";
        case "checkedIn":
        case "checked-in":
          return "#70E442";
        case "waitlist":
        case "waitlisted":
          return "#D79EF1";
        case "incomplete":
          return "#FFAD8F";
        case "cancelled":
          return "#FB6F8E";
        case "accepted":
          return "#70E442";
        default:
          return "#ffffff";
      }
    };

    // Updated label mapping for new status system
    const getLabel = (value: string) => {
      switch (value) {
        // Application Status labels
        case ApplicationStatus.REGISTERED:
          return "Registered";
        case ApplicationStatus.INCOMPLETE:
          return "Incomplete";
        case ApplicationStatus.ACCEPTED:
          return "Accepted";
        case ApplicationStatus.WAITLISTED:
          return "Waitlisted";
        case ApplicationStatus.REJECTED:
          return "Rejected";
        case ApplicationStatus.CHECKED_IN:
          return "Checked-In";
        case ApplicationStatus.CANCELLED:
          return "Cancelled";
        
        // Registration Status labels
        case RegistrationStatus.REVIEWING:
          return "Reviewing";
        case RegistrationStatus.PENDING:
          return "Pending";
        case RegistrationStatus.PAYMENTPENDING:
          return "Payment Pending";
        case RegistrationStatus.COMPLETE:
          return "Complete";
        
        // Legacy status support
        case "registered":
          return "Registered";
        case "checkedIn":
        case "checked-in":
          return "Checked-In";
        case "incomplete":
          return "Incomplete";
        case "cancelled":
          return "Cancelled";
        case "accepted":
          return "Accepted";
        case "waitlist":
        case "waitlisted":
          return "Waitlisted";
        case "reviewing":
          return "Reviewing";
        case "rejected":
          return "Rejected";
        default:
          return value;
      }
    };

    // Enhanced status display for combined status information
    const getCombinedStatusDisplay = () => {
      if (column.id === "applicationStatus" || column.id === "registrationStatus") {
        const appStatus = row.original.applicationStatus;
        const regStatus = row.original.registrationStatus;
        
        // Show combined status for better context
        if (column.id === "applicationStatus") {
          if (appStatus === ApplicationStatus.ACCEPTED) {
            switch (regStatus) {
              case RegistrationStatus.PENDING:
                return "Accepted (Awaiting Confirmation)";
              case RegistrationStatus.PAYMENTPENDING:
                return "Accepted (Payment Required)";
              case RegistrationStatus.COMPLETE:
                return "Accepted (Confirmed)";
              default:
                return getLabel(appStatus);
            }
          }
          return getLabel(appStatus);
        }
        
        if (column.id === "registrationStatus") {
          if (appStatus === ApplicationStatus.ACCEPTED) {
            switch (regStatus) {
              case RegistrationStatus.PENDING:
                return "Pending Confirmation";
              case RegistrationStatus.PAYMENTPENDING:
                return "Payment Required";
              case RegistrationStatus.COMPLETE:
                return "Confirmed";
              default:
                return getLabel(regStatus);
            }
          }
          return getLabel(regStatus);
        }
      }
      
      return getLabel(value as string);
    };

    if (column.id === "registrationStatus" || column.id === "applicationStatus" || column.id === "points") {
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
                <SelectValue>{getCombinedStatusDisplay()}</SelectValue>
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

    // For non-editable cells, show the combined status display if it's a status column
    if (column.id === "applicationStatus" || column.id === "registrationStatus") {
      return (
        <span 
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: getColor(value as string) }}
        >
          {getCombinedStatusDisplay()}
        </span>
      );
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