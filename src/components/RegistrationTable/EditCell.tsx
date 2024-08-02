import React from 'react'
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

interface EditCellProps {
    row: Row<Attendee>
    table: Table<Attendee>
}

export const EditCell: React.FC<EditCellProps> = ({ row }) => {
    const handleEdit = () => {
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

            <DialogContent className="max-w-[750px] max-h-lg bg-events-active-tab-bg border-0">
                <DialogHeader>
                    <DialogTitle className="text-white">{row.original.firstName} {row.original.lastName}</DialogTitle>
                    <span className="italic text-white">Form Responses</span>
                </DialogHeader>
                {/* divider */}
                <div className="w-full h-[1px] bg-[#8DA1D1] my-3" />
                <div className="max-h-[300px] overflow-y-auto">
                    <UserInfo row={row} />
                    <div className="w-full h-[1px] bg-[#8DA1D1] my-3" />
                    <UserResponses row={row} />
                </div>
                <div className="w-full h-[1px] bg-[#8DA1D1] my-3" />
                {/* Added DialogTrigger here to close dialog upon button click */}
                <DialogTrigger asChild>
                    <Button onClick={handleEdit}>Save changes</Button>
                </DialogTrigger>
            </DialogContent>
        </Dialog>
    )
}
