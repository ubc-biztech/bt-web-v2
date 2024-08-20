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
import Image from "next/image";
import PopoutIcon from "../../../public/assets/icons/popout_icon.svg";
import { Registration } from '@/types/types'

interface EditCellProps {
    row: Row<Registration>
    table: Table<Registration>
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

            <DialogContent className="max-w-md w-full bg-events-active-tab-bg">
                <DialogHeader>
                    <DialogTitle className="text-white">{row.original.basicInformation.fname} {row.original.basicInformation.lname}</DialogTitle>
                    <span className="italic">Form Responses</span>
                </DialogHeader>
                {/* divider */}

                <div className="w-full h-[1px] bg-[#8DA1D1] my-3"/>

                <Button onClick={handleEdit}>Save changes</Button>

            </DialogContent>
        </Dialog>
    )
}
