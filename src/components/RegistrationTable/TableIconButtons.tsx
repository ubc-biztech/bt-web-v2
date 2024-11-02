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
  isQrReaderToggled: boolean;
  setQrReaderToggled: Dispatch<SetStateAction<boolean>>;
  refreshTable: () => Promise<void>;
}

export const TableIconButtons: React.FC<TableButtonProps> = ({
  isQrReaderToggled,
  setQrReaderToggled,
  refreshTable,
}) => {
  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              onClick={() => setQrReaderToggled(!isQrReaderToggled)}
            >
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
            <Button variant="ghost" onClick={refreshTable}>
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
