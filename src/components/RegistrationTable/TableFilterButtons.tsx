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
    <div className="bg-[#95AADC] rounded-md flex items-center space-x-5">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              onClick={() => table.toggleAllRowsSelected(false)}
            >
              <Image
                src={CancelIcon}
                alt="Deselect Icon"
                width={15}
                height={15}
                className={"min-w-3"}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Deselect</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <span className="text-bt-blue-400">{selectedRowsCount} Selected</span>
      <div className="flex flex-row">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                onClick={() => handleIconClick("addToTeam")}
              >
                <Image
                  src={TeamsIcon}
                  alt="Teams Icon"
                  width={25}
                  height={25}
                  className={"min-w-6"}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add to Team</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                onClick={() => handleIconClick("massUpdateStatus")}
              >
                <Image
                  src={MassUpdateIcon}
                  alt="Mass Update Icon"
                  width={25}
                  height={25}
                  className={"min-w-6"}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mass Update Status</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
