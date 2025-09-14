import React, { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";

import StatsIcon from "../../../public/assets/icons/chart_icon.svg";
import QrIcon from "../../../public/assets/icons/qr_icon.svg";
import RefreshIcon from "../../../public/assets/icons/refresh_icon.svg";
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
  const router = useRouter();

  const handleIconClick = (iconType: string) => {
    if (iconType === "stats") {
      const currentPath = window.location.pathname;
      router.push(`${currentPath}/stats`);
    }
  };

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
