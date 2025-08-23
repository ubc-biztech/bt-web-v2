import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Row, Table } from "@tanstack/react-table";
import Image from "next/image";
import PopoutIcon from "../../../public/assets/icons/popout_icon.svg";
import UserInfo from "./editCellPopUp.tsx/userInfo";
import UserResponses from "./editCellPopUp.tsx/userResponses";
import { RegistrationQuestion } from "@/types";
import router from "next/router";
import { fetchBackend } from "@/lib/db";
import { Registration } from "@/types/types";
import { BiztechEvent } from "@/types/types";
import { SquareArrowOutUpRight } from "lucide-react";

interface EditCellProps {
  row: Row<Registration>;
  table: Table<Registration>;
  refreshTable: () => Promise<void>;
  eventData: BiztechEvent;
}

export const EditCell: React.FC<EditCellProps> = ({
  row,
  table,
  refreshTable,
  eventData,
}) => {
  const handleEdit = () => {
    console.log("Editing row:", row.original);
    // close the dialog
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <SquareArrowOutUpRight className="hover:bg-bt-blue-300 p-1 rounded-sm w-7 h-7 transition-color duration-200 ease-in-out cursor-pointer"/>
      </DialogTrigger>

      <DialogContent className="max-w-[750px] w-full max-h-lg bg-bt-blue-400/70 backdrop-blur-md border-0 shadow-inner-white-lg">
        <DialogHeader>
          <DialogTitle className="text-white">
            {row.original.fname} {row.original.basicInformation.lname}
          </DialogTitle>
          <span className="italic text-white">Form Responses</span>
        </DialogHeader>
        <div className="max-w-full h-[1px] bg-divider my-3" />

        <div className="max-h-[500px] max-w-full overflow-y-auto">
          <UserInfo row={row} table={table} refreshTable={refreshTable} />
          <div className="max-w-full h-[1px] bg-divider my-3">
            <UserResponses
              questions={
                eventData.registrationQuestions as RegistrationQuestion[]
              }
              responses={row.original.dynamicResponses}
            />
          </div>
        </div>
        <div className="w-full h-[1px] bg-divider my-3" />
        <DialogTrigger asChild>
          <Button onClick={handleEdit}>Close</Button>
        </DialogTrigger>
      </DialogContent>
    </Dialog>
  );
};
