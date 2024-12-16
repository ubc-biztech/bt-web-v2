import React, { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Row, Table } from "@tanstack/react-table"
import Image from "next/image";
import PopoutIcon from "../../../public/assets/icons/popout_icon.svg";
import UserInfo from "./editCellPopUp.tsx/userInfo"
import UserResponses from './editCellPopUp.tsx/userResponses'
import { RegistrationQuestion } from '@/types'
import router from 'next/router'
import { fetchBackend } from '@/lib/db'
import { Attendee } from './columns'
import { BiztechEvent } from '@/types/types'

interface EditCellProps {
  row: Row<Attendee>
  table: Table<Attendee>
  refreshTable: () => Promise<void>
  eventData: BiztechEvent
}

export const EditCell: React.FC<EditCellProps> = ({ row, table, refreshTable, eventData }) => {
  const handleEdit = () => {
    console.log("Editing row:", row.original);
    // close the dialog
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="p-0">
          <Image src={PopoutIcon} alt="Popout Icon" width={25} height={25} className={"min-w-6"} />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[750px] w-full max-h-lg bg-events-active-tab-bg border-0">
        <DialogHeader>
          <DialogTitle className="text-white">{row.original.fname} {row.original.basicInformation.lname}</DialogTitle>
          <span className="italic text-white">Form Responses</span>
        </DialogHeader>
        <div className="max-w-full h-[1px] bg-divider my-3" />

        <div className="max-h-[500px] max-w-full overflow-y-auto">
          <UserInfo 
            row={row} 
            table={table} 
            refreshTable={refreshTable}
          />
          <div className="max-w-full h-[1px] bg-divider my-3">
            <UserResponses 
              questions={eventData.registrationQuestions as RegistrationQuestion[]} 
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
}
