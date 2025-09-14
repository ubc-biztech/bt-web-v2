import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Table } from "@tanstack/react-table";

import CancelIcon from "../../../public/assets/icons/cancel_icon.svg";
import TeamsIcon from "../../../public/assets/icons/teams_icon.svg";
import MassUpdateIcon from "../../../public/assets/icons/massupdate_icon.svg";
import { FilePenLine, UsersRound } from "lucide-react";

interface TableFilterButtonsProps {
  selectedRowsCount: number;
  table: Table<any>;
  setShowMassUpdateStatus: (show: boolean) => void;
  setShowCreateTeam: (show: boolean) => void;
}

export const TableFilterButtons: React.FC<TableFilterButtonsProps> = ({
  selectedRowsCount,
  table,
  setShowMassUpdateStatus,
  setShowCreateTeam,
}) => {
  const handleIconClick = (action: string) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;

    if (action === "addToTeam") {
      setShowCreateTeam(true);
    } else if (action === "massUpdateStatus") {
      setShowMassUpdateStatus(true);
    }

    // You can pass the selected rows to the parent component if needed
    console.log("Selected rows:", selectedRows);
  };

  return (
    <div className="bg-[#2E4AA6] rounded-md flex items-center px-4 h-10 gap-4 shadow-inner-white-md">
      <span className="text-white font-semibold text-nowrap">
        {selectedRowsCount} Rows Selected
      </span>
      <div className="flex flex-row gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <UsersRound onClick={() => handleIconClick("addToTeam")} />
            </TooltipTrigger>
            <TooltipContent>Add to Team</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <FilePenLine
                onClick={() => handleIconClick("massUpdateStatus")}
              />
            </TooltipTrigger>
            <TooltipContent>Mass Update Status</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
