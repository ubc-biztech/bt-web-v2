import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { updateRegistrationData, prepareUpdatePayload } from "@/lib/dbUtils";
import { Registration } from "@/types/types";
import { Table } from "@tanstack/react-table";

interface SelectCellProps {
  row: Registration;
  column: string;
  originalValue: string | number;
  dropDownList: string[];
  table: Table<Registration>;
  refreshTable: () => Promise<void>;
}

const SelectCell: React.FC<SelectCellProps> = ({
  row,
  column,
  originalValue,
  dropDownList,
  table,
  refreshTable,
}) => {
  const [value, setValue] = useState(originalValue);

  const onBlur = async () => {
    let eventId = row["eventID;year"].slice(
      0,
      row["eventID;year"].indexOf(";"),
    );
    let year = row["eventID;year"].slice(row["eventID;year"].indexOf(";") + 1);

    const body = prepareUpdatePayload(column, value, eventId, year);

    try {
      await updateRegistrationData(row.id, row.fname, body);
      await refreshTable();
    } catch (error) {
      console.error("Failed to update registration:", error);
    }
  };

  const onSelectChange = async (newValue: string) => {
    setValue(newValue);
    let eventId = row["eventID;year"].slice(
      0,
      row["eventID;year"].indexOf(";"),
    );
    let year = row["eventID;year"].slice(row["eventID;year"].indexOf(";") + 1);

    const body = prepareUpdatePayload(column, newValue, eventId, year);

    try {
      await updateRegistrationData(row.id, row.fname, body);
      await refreshTable();
    } catch (error) {
      console.error("Failed to update registration:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const getLabel = (value: string) => {
    switch (value) {
      case "registered":
        return "Registered";
      case "checkedIn":
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

  return (
    <div>
      {dropDownList ? (
        <Select onValueChange={onSelectChange} defaultValue="Not Found">
          <SelectTrigger className="p3 rounded-none bg-events-active-tab-bg text-white p-0 border-0 border-b-2 border-b-baby-blue">
            <SelectValue>{getLabel(value as string)}</SelectValue>
          </SelectTrigger>
          <SelectContent className="focus:border-0 bg-white">
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
};

export default SelectCell;
