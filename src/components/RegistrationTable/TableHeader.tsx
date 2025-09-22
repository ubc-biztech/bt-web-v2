import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Filter, Search } from "lucide-react";
import { TableFilterButtons } from "./TableFilterButtons";
import { TableIconButtons } from "./TableIconButtons";
import { Table } from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input as SearchBar } from "@/components/RegistrationTable/Input";
import { fetchBackend } from "@/lib/db";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TableHeaderProps {
  table: Table<any>;
  filterButtonRef: React.RefObject<HTMLButtonElement>;
  rowSelection: Record<string, boolean>;
  isQrReaderToggled: boolean;
  setQrReaderToggled: Dispatch<SetStateAction<boolean>>;
  refreshTable: () => Promise<void>;
  onFilterChange: (value: SelectValue) => void;
  globalFilter: any;
  setGlobalFilter: (updater: any) => void;
  eventId: string;
  year: string;
}

type SelectValue = "attendees" | "partners" | "waitlisted";

export const TableHeader: React.FC<TableHeaderProps> = ({
  table,
  filterButtonRef,
  rowSelection,
  isQrReaderToggled,
  setQrReaderToggled,
  refreshTable,
  onFilterChange,
  globalFilter,
  setGlobalFilter,
  eventId,
  year,
}) => {
  const selectedRowsCount = Object.keys(rowSelection).length;
  const [showMassUpdateStatus, setShowMassUpdateStatus] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [teamName, setTeamName] = useState("");
  const [selectedValue, setSelectedValue] = useState<SelectValue>("attendees");

  const handleSelectChange = (value: SelectValue) => {
    setSelectedValue(value);
    onFilterChange(value);
  };

  const getSelectedRows = () => {
    return table.getFilteredSelectedRowModel().rows;
  };

  const handleMassUpdate = () => {
    const selectedRows = getSelectedRows();
    // Implement mass update logic here
    console.log(`Updating ${selectedRows.length} rows to status: ${newStatus}`);
    setShowMassUpdateStatus(false);
  };

  const handleCreateTeam = () => {
    const selectedRows = getSelectedRows();
    // Implement team creation logic here
    console.log(
      `Creating team "${teamName}" with ${selectedRows.length} members`,
    );
    setShowCreateTeam(false);
  };

  return (
    <div className="flex flex-col xl:flex-row items-center justify-between">
      <div className="flex items-center relative gap-2">
        {selectedRowsCount > 0 && (
          <TableFilterButtons
            selectedRowsCount={selectedRowsCount}
            table={table}
            setShowMassUpdateStatus={setShowMassUpdateStatus}
            setShowCreateTeam={setShowCreateTeam}
            setShowDeleteConfirm={setShowDeleteConfirm}
          />
        )}

        <TableIconButtons
          isQrReaderToggled={isQrReaderToggled}
          setQrReaderToggled={setQrReaderToggled}
          refreshTable={refreshTable}
        />

        <SearchBar
          startIcon={Search}
          placeholder="Search by keyword..."
          value={globalFilter}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setGlobalFilter(event.target.value)
          }
          className="bg-white shadow-inner-blue-concave"
        ></SearchBar>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="bg-[#6578A8] rounded-md">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="bg-[#6578A8] rounded-md px-2"
                    ref={filterButtonRef}
                  >
                    <Filter />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className={"bg-[#485A85]"}>
                  <DropdownMenuLabel className={"text-md font-600 pr-5"}>
                    Filter by Column
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className={"bg-[#8DA1D1]"} />
                  <DropdownMenuCheckboxItem
                    checked={table.getIsAllColumnsVisible()}
                    onCheckedChange={table.getToggleAllColumnsVisibilityHandler()}
                  >
                    Show All
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator className={"bg-[#8DA1D1]"} />
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent>
              <p>Filter</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between space-x-2 mt-4 lg:mt-0">
        <Select value={selectedValue} onValueChange={handleSelectChange}>
          <SelectTrigger className="w-[180px] bg-bt-blue-400 text-white">
            <SelectValue placeholder="Attendees" />
          </SelectTrigger>
          <SelectContent className="bg-[#485A85] text-white">
            <SelectItem value="attendees">Attendees</SelectItem>
            <SelectItem value="partners">Partners</SelectItem>
            <SelectItem value="waitlisted">Waitlisted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Dialog
        open={showMassUpdateStatus}
        onOpenChange={setShowMassUpdateStatus}
      >
        <DialogContent className="max-w-md w-full bg-bt-blue-400">
          <DialogHeader>
            <DialogTitle className="text-white">Mass Update Status</DialogTitle>
          </DialogHeader>

          {/* divider */}
          <div className="w-full h-[1px] bg-[#8DA1D1] my-3" />

          <div className="space-y-4 max-h-[30vh] sm:max-h-[40vh] md:max-h-[50vh] overflow-y-auto">
            {getSelectedRows().map((row, index) => (
              <div key={index} className="bg-[#485A85] px-5 py-4 rounded-lg">
                <span className="text-md font-600">
                  {row.original.firstName} {row.original.lastName}
                </span>
                <br />
                {row.original.email}
              </div>
            ))}
          </div>

          <div className="w-full h-[1px] bg-[#8DA1D1] my-3" />

          <Select onValueChange={setNewStatus}>
            <SelectTrigger className="bg-bt-blue-400 text-white">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="registered">Registered</SelectItem>
              <SelectItem value="checked-in">Checked-In</SelectItem>
              <SelectItem value="waitlisted">Waitlisted</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleMassUpdate}
            className="text-bt-blue-400 bg-bt-green-300"
          >
            Update Selection
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md w-full bg-bt-blue-400">
          <DialogHeader>
            <DialogTitle className="text-white">
              Delete Selected Registrations
            </DialogTitle>
          </DialogHeader>

          <div className="w-full h-[1px] bg-[#8DA1D1] my-3" />

          <div className="space-y-4 max-h-[30vh] sm:max-h-[40vh] md:max-h-[50vh] overflow-y-auto">
            {getSelectedRows().map((row, index) => (
              <div key={index} className="bg-[#485A85] px-5 py-4 rounded-lg">
                <span className="text-md font-600">
                  {row.original.id || row.original.email}
                </span>
                <br />
              </div>
            ))}
          </div>

          <div className="w-full h-[1px] bg-[#8DA1D1] my-3" />

          <Button
            onClick={async () => {
              const rows = getSelectedRows();
              const ids = rows.map((row: any) => row.original.id);
              try {
                await fetchBackend({
                  endpoint: "/registrations",
                  method: "DELETE",
                  data: { ids, eventID: eventId, year: Number(year) },
                  authenticatedCall: true,
                });
              } catch (e) {
                console.error("Failed to delete registrations", e);
              } finally {
                setShowDeleteConfirm(false);
                await refreshTable();
                table.resetRowSelection();
              }
            }}
            className="text-bt-blue-400 bg-bt-red-300"
          >
            Confirm Delete
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
        <DialogContent className="max-w-md w-full bg-bt-blue-400">
          <DialogHeader>
            <DialogTitle className="text-white">Create Team</DialogTitle>
          </DialogHeader>

          {/* divider */}
          <div className="w-full h-[1px] bg-[#8DA1D1] my-3" />

          <div className="space-y-4 max-h-[30vh] sm:max-h-[40vh] md:max-h-[50vh] overflow-y-auto">
            {getSelectedRows().map((row, index) => (
              <div key={index} className="bg-[#485A85] px-5 py-4 rounded-lg">
                <span className="text-md font-600">
                  Team Member #{index + 1}
                </span>
                <br />
                <span>
                  {row.original.firstName} {row.original.lastName} (
                  {row.original.email})
                </span>
              </div>
            ))}
          </div>

          <div className="w-full h-[1px] bg-[#8DA1D1] my-3" />

          <div>
            <Label htmlFor="teamName" className="text-white">
              Team Name
            </Label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              className="bg-bt-blue-400 text-white border-[#8DA1D1]"
            />
          </div>
          <Button
            onClick={handleCreateTeam}
            className="text-bt-blue-400 bg-bt-green-300"
          >
            Make Team
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
