import React, { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import { LucideRefreshCcw, ScanQrCode } from "lucide-react";

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
    <div className="flex flex-row gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="green"
              onClick={() => setQrReaderToggled(!isQrReaderToggled)}
              className="p-2 shadow-inner-blue-convex"
            >
              <ScanQrCode />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle QR Scanner</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="green"
              onClick={refreshTable}
              className="p-2 shadow-inner-blue-convex"
            >
              <LucideRefreshCcw />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh Table</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
