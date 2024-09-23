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

async function fetchQuestionsAndResponses (attendeeId: string, eventId: string, eventYear: string) {
    // TODO: Replace mock data with actual backend call
    const mockQuestions: RegistrationQuestion[] = 
    [
        {
          "questionImageUrl": "",
          "label": "What school do you attend?",
          "questionId": "bede9713-17cf-4bb9-b362-8c30a1e5b543",
          "type": "SELECT",
          "choices": ["UBC", "SFU", "KPU", "Douglas", "High School", "..."],
          "required": true
        },
        {
          "label": "Do you have any accessibility/mobility needs that you would need us to know about?",
          "questionId": "49512eca-eec6-4639-b70c-f60f2e0a9371",
          "type": "SELECT",
          "choices": ["Yes", "No"],
          "required": true
        },
        {
          "label": "If you answered 'Yes' to the question above, please let us know of any accommodations you will need below:",
          "questionId": "ee2b5b93-3792-4332-ba83-24b995f12094",
          "type": "TEXT",
          "choices": [],
          "required": false
        },
        {
          "label": "LinkedIn URL:",
          "questionId": "013bb98c-4286-4649-bbb9-fbc27185925c",
          "type": "TEXT",
          "choices": [],
          "required": false
        },
        {
          "label": "Resume:",
          "questionId": "ea4a8fa7-7bcf-4f86-af60-27ac61c7680b",
          "type": "UPLOAD",
          "choices": [],
          "required": false
        },
        {
          "label": "Do you consent to us sharing your resume with our attending partners? (If you didn't upload one, select N/A)",
          "questionId": "f33ba987-6a5f-4ea2-9ba9-ca5f087e6fef",
          "type": "SELECT",
          "choices": ["Yes", "No", "N/A"],
          "required": true
        },
        {
          "label": "Do you consent to having your email added to our sponsors' mailing lists?",
          "questionId": "a04e1064-65b2-4873-bede-9c4d5cbd32c3",
          "type": "SELECT",
          "choices": ["Yes", "No"],
          "required": true
        },
        {
          "label": "Would you be interested in getting your headshot taken at the conference?",
          "questionId": "24f0b385-d92e-43be-92a3-2b225964a778",
          "type": "SELECT",
          "choices": ["Yes", "No"],
          "required": true
        },
        {
          "label": "What's the first thing that comes to mind when you hear 'Digital Disruptions'?",
          "questionId": "04f58eea-1861-4da3-8e4c-8d8e994ce8ba",
          "type": "TEXT",
          "choices": [],
          "required": true
        },
        {
          "label": "Would you like to participate in our Attendee Showcase (view the event description above for more info)? If so, please complete ALL of the questions from this point on, otherwise, you may skip them.",
          "questionId": "cb1a1e83-f581-473c-97e0-48e9a88d7d20",
          "type": "SELECT",
          "choices": ["I would like to participate", "I would not like to participate"],
          "required": true
        },
        {
          "label": "[A/S] Project Name",
          "questionId": "16ce18ff-9e88-4988-8965-b3edc172437a",
          "type": "TEXT",
          "choices": [],
          "required": false
        },
        {
          "label": "[A/S] Full names of those who contributed to this project (you may only submit projects with up to 4 contributors MAX)",
          "questionId": "0836c57c-6163-4905-acb5-6578510b5a63",
          "type": "TEXT",
          "choices": [],
          "required": false
        },
        {
          "label": "[A/S] Brief description of your project",
          "charLimit": 350,
          "questionId": "5328b778-e593-4077-bd58-d7b0f7cd1752",
          "type": "TEXT",
          "choices": [],
          "required": false
        },
        {
          "label": "[A/S] Key technologies used to create your project",
          "questionId": "10231b92-5503-4a22-a205-25d99bee580b",
          "type": "TEXT",
          "choices": [],
          "required": false
        },
        {
          "label": "[A/S] Relevant photo of your project (i.e. logo, screenshot of webpage, photo of prototype, etc)",
          "questionId": "e44b5fea-b18a-41bf-b6f2-e685b88d74da",
          "type": "UPLOAD",
          "choices": [],
          "required": false
        },
        {
          "label": "[A/S] Link to your project/to learn more about your project (i.e. Github repo, website link, etc)",
          "questionId": "1099caf7-6e25-4c9a-97ab-c7628d1507e9",
          "type": "TEXT",
          "choices": [],
          "required": false
        },
        {
          "label": "I confirm that the project I submitted abides by Blueprint's Attendee Showcase requirements (stated in this form's description)",
          "questionId": "f83944a8-97e2-421c-903c-aac91106fe34",
          "type": "SELECT",
          "choices": ["I confirm", "I didn't submit a project"],
          "required": true
        }
      ];

    return {
        questions: mockQuestions
    };
};


