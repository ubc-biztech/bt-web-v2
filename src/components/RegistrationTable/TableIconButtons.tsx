import React, { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import StatsIcon from "../../../public/assets/icons/chart_icon.svg";
import QrIcon from "../../../public/assets/icons/qr_icon.svg";
import RefreshIcon from "../../../public/assets/icons/refresh_icon.svg";

interface TableButtonProps {
  qr: boolean; // requires useState from parent so the QR can be toggled from a button elsewhere in the parent
  toggleQr: Dispatch<SetStateAction<boolean>>;
}

export const TableIconButtons: React.FC<TableButtonProps> = ({qr, toggleQr}) => {
  const handleIconClick = (action: string) => {
    console.log(`${action} action triggered`);
  };

  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Button variant="ghost" onClick={() => toggleQr(!qr)}>
              <Image
                src={QrIcon}
                alt="QR Icon"
                width={25}
                height={25}
                className={"min-w-6"}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle QR Scanner</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Button variant="ghost" onClick={() => handleIconClick("refresh")}>
              <Image
                src={RefreshIcon}
                alt="Refresh Icon"
                width={25}
                height={25}
                className={"min-w-6"}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh Table</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Button variant="ghost" onClick={() => handleIconClick("stats")}>
              <Image
                src={StatsIcon}
                alt="Stats Icon"
                width={25}
                height={25}
                className={"min-w-6"}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>View Statistics</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
