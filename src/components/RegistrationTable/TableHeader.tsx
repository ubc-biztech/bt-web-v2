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
import { Filter, Search, Download, Copy, Check } from "lucide-react";
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

type SelectValue =
  | "all"
  | "attendees"
  | "partners"
  | "waitlisted"
  | "acceptedPending"
  | "acceptedComplete"
  | "accepted"
  | "incomplete"
  | "cancelled"
  | "checkedIn"
  | "registered";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [massUpdateError, setMassUpdateError] = useState<string | null>(null);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [copiedEmails, setCopiedEmails] = useState(false);

  const handleSelectChange = (value: SelectValue) => {
    setSelectedValue(value);
    onFilterChange(value);
  };

  const getSelectedRows = () => {
    return table.getFilteredSelectedRowModel().rows;
  };

  const handleMassUpdate = async () => {
    if (!newStatus) return;
    const selectedRows = getSelectedRows();
    setIsSubmitting(true);
    setMassUpdateError(null);
    try {
      const updates = selectedRows.map((row: any) => ({
        email: row.original.id || row.original.email,
        fname: row.original.firstName || row.original.fname || "",
        applicationStatus: newStatus,
      }));
      await fetchBackend({
        endpoint: "/registrations/",
        method: "PUT",
        data: {
          eventID: eventId,
          eventYear: Number(year),
          updates,
        },
        authenticatedCall: false,
      });
      setShowMassUpdateStatus(false);
      setNewStatus("");
      table.resetRowSelection();
      await refreshTable();
    } catch (err: any) {
      console.error("Failed to mass update:", err);
      setMassUpdateError(err.message || "Failed to update registrations");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;
    const selectedRows = getSelectedRows();
    setIsSubmitting(true);
    setTeamError(null);
    try {
      const memberIDs = selectedRows.map(
        (row: any) => row.original.id || row.original.email,
      );
      await fetchBackend({
        endpoint: "/team/make",
        method: "POST",
        data: {
          team_name: teamName.trim(),
          eventID: eventId,
          year: Number(year),
          memberIDs,
        },
      });
      setShowCreateTeam(false);
      setTeamName("");
      table.resetRowSelection();
      await refreshTable();
    } catch (err: any) {
      console.error("Failed to create team:", err);
      setTeamError(
        err.message ||
          "Failed to create team. Members must be checked in and not already on a team.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getExportRows = () => {
    const selectedRows = getSelectedRows();
    if (selectedRows.length > 0) {
      return selectedRows.map((r: any) => r.original);
    }
    return table.getFilteredRowModel().rows.map((r: any) => r.original);
  };

  const handleExportCSV = () => {
    const rows = getExportRows();
    if (rows.length === 0) return;

    const headers = [
      "Email",
      "First Name",
      "Last Name",
      "Registration Status",
      "Application Status",
      "Points",
      "Is Partner",
      "Faculty",
      "Year",
      "Diet",
      "Student ID",
      "Created At",
    ];

    const csvRows = rows.map((r: any) => [
      r.id || "",
      r.basicInformation?.fname || r.fname || "",
      r.basicInformation?.lname || r.lname || "",
      r.registrationStatus || "",
      r.applicationStatus || "",
      r.points ?? "",
      r.isPartner ? "Yes" : "No",
      r.basicInformation?.faculty || "",
      r.basicInformation?.year || "",
      r.basicInformation?.diet || "",
      r.studentId || "",
      r.createdAt ? new Date(r.createdAt).toISOString() : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvRows.map((row: string[]) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `registrations_${eventId}_${year}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyEmails = () => {
    const rows = getExportRows();
    const emails = rows
      .map((r: any) => r.id || r.email || "")
      .filter(Boolean)
      .join(", ");
    navigator.clipboard.writeText(emails);
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3 md:gap-0 xl:flex-row items-stretch xl:items-center justify-between">
      <div className="flex items-center relative gap-1.5 md:gap-2 flex-wrap md:flex-nowrap">
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

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="bg-[#6578A8] rounded-md px-2"
                onClick={handleExportCSV}
              >
                <Download className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {selectedRowsCount > 0
                ? `Export ${selectedRowsCount} selected as CSV`
                : "Export filtered as CSV"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="bg-[#6578A8] rounded-md px-2"
                onClick={handleCopyEmails}
              >
                {copiedEmails ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {copiedEmails
                ? "Copied!"
                : selectedRowsCount > 0
                  ? `Copy ${selectedRowsCount} selected emails`
                  : "Copy all filtered emails"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

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
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="attendees">Attendees</SelectItem>
            <SelectItem value="partners">Partners</SelectItem>
            <SelectItem value="waitlisted">Waitlisted</SelectItem>
            <SelectItem value="acceptedPending">Accepted Pending</SelectItem>
            <SelectItem value="acceptedComplete">Confirmed</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="incomplete">Incomplete</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="checkedIn">Checked-In</SelectItem>
            <SelectItem value="registered">Registered</SelectItem>
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

          {massUpdateError && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-3 py-2 rounded text-sm">
              {massUpdateError}
            </div>
          )}
          <Select onValueChange={setNewStatus} value={newStatus}>
            <SelectTrigger className="bg-bt-blue-400 text-white">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="registered">Registered</SelectItem>
              <SelectItem value="checkedIn">Checked-In</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="waitlisted">Waitlisted</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleMassUpdate}
            className="text-bt-blue-400 bg-bt-green-300"
            disabled={isSubmitting || !newStatus}
          >
            {isSubmitting
              ? "Updating..."
              : `Update ${getSelectedRows().length} Registration${getSelectedRows().length === 1 ? "" : "s"}`}
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

          {teamError && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-3 py-2 rounded text-sm">
              {teamError}
            </div>
          )}
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
            disabled={isSubmitting || !teamName.trim()}
          >
            {isSubmitting
              ? "Creating..."
              : `Create Team (${getSelectedRows().length} members)`}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
