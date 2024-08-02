import React, { ChangeEvent, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Row, Table } from "@tanstack/react-table"
import { Attendee } from "../columns"
import { ColumnMeta } from "../columns"
import { Input } from "@/components/ui/input"
import SelectCell from './userPopupEdit'

interface EditCellProps {
    row: Row<Attendee>,
}

const UserInfo: React.FC<EditCellProps> = ({ row }) => {

    const fieldsToDisplay = Object.keys(row.original).filter(key => key !== 'shouldNotDisplay');

    const fieldLabels: { [key: string]: string } = {
        appStatus: "Application Status",
        dynamicField1: "Dynamic Field",
        email: "Email",
        faculty: "Faculty",
        firstName: "First Name",
        id: "ID",
        lastName: "Last Name",
        points: "Points",
        regStatus: "Registration Status",
        studentNumber: "Student Number"
    };

    const dropDownList: { [key: string]: string[] } = {
        regStatus: [
            "Registered",
            "Checked-In",
            "Cancelled",
            "Incomplete"
        ],
        appStatus: [
            "Accepted",
            "Rejected"
        ],
    };


    return (
        <div className="text-white grid grid-cols-2 gap-4 m-3">
            {fieldsToDisplay.map((key) => (
                <div key={key}>
                    <label className="block font-bold text-baby-blue">{fieldLabels[key]}:</label>
                    {key === 'regStatus' || key === 'appStatus' ? (
                        <SelectCell originalValue={row.original[key]} dropDownList={dropDownList[key]}/>
                    ) : key === 'points' ? (
                        <SelectCell originalValue={row.original[key]} dropDownList={dropDownList[key]}/>
                    ) : (
                        <span>{row.original[key]}</span>
                    )}
                </div>
            ))}
        </div>
    )
}

export default UserInfo

