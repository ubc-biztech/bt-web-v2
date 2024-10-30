import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Row, Table } from "@tanstack/react-table"
import { Attendee } from "./columns"
import Image from "next/image";
import PopoutIcon from "../../../public/assets/icons/popout_icon.svg";
import UserInfo from "./editCellPopUp.tsx/userInfo"
import UserResponses from './editCellPopUp.tsx/userResponses'
import { RegistrationQuestion } from '@/types'
import router from 'next/router'
import { fetchBackend } from '@/lib/db'

interface EditCellProps {
  row: Row<Attendee>
  table: Table<Attendee>
}

export const EditCell: React.FC<EditCellProps> = ({ row, table }) => {
  const [questions, setQuestions] = useState<RegistrationQuestion[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (router.isReady) {
        const eventId = router.query.eventId as string;
        const attendeeId = row.original.id;
        const eventYear = router.query.year as string;

        if (eventId && attendeeId && eventYear) {
          try {
            const data = await fetchQuestionsAndResponses(attendeeId, eventId, eventYear);
            setQuestions(data.questions);
          } catch (error) {
            console.error("Error fetching questions and responses:", error);
          }
        }
      }
    };

    fetchData();
  }, [row.original.id]);



  const handleEdit = () => {
    // table.options.meta?.updateData(row.index, column, value);
    // Handle edit logic here
    console.log("Editing row:", row.original)
    // close the dialog
  }

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
        {/* divider */}
        <div className="max-w-full h-[1px] bg-divider my-3" />

        <div className="max-h-[500px] max-w-full overflow-y-auto">
          <UserInfo row={row.original} table={table} />
          {/* divider */}
          <div className="max-w-full h-[1px] bg-divider my-3">
            <UserResponses questions={questions} responses={row.original.dynamicResponses} />
          </div>
        </div>
        {/* divider */}
        <div className="w-full h-[1px] bg-divider my-3" />
        {/* Added DialogTrigger here to close dialog upon button click */}
        <DialogTrigger asChild>
          {/* Do we want this to be a save changes button instead? */}
          <Button onClick={handleEdit}>Close</Button>
        </DialogTrigger>
      </DialogContent>
    </Dialog>
  )
}

async function fetchQuestionsAndResponses(attendeeId: string, eventId: string, eventYear: string) {

  let data;
  try {
    data = await fetchBackend({ endpoint: `/events/${eventId}/${eventYear}`, method: "GET", authenticatedCall: false });
  } catch (e) {
    console.error("Error fetching event questions");
  }

  return {
    questions: data.registrationQuestions
  };
};


