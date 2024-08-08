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
import { RegQuestionData, UserQuestionIDs, UserResponse } from '@/types'
import router from 'next/router'

interface EditCellProps {
    row: Row<Attendee>
    table: Table<Attendee>
}

export const EditCell: React.FC<EditCellProps> = ({ row, table }) => {
    const [questions, setQuestions] = useState<RegQuestionData[]>([]);
    const [responses, setResponses] = useState<{ [key: string]: UserResponse }>({});

    useEffect(() => {
        if (router.isReady) {
            const eventId = router.query.eventId as string;
            const attendeeId = row.original.id;
            const eventYear = router.query.year as string;

            if (eventId && attendeeId && eventYear) {
                fetchQuestionsAndResponses(attendeeId, eventId, eventYear).then(data => {
                    setQuestions(data.questions);
                    setResponses(data.responses);
                }).catch(error => {
                    console.error("Error fetching questions and responses:", error);
                });
            }
        }
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
                    <DialogTitle className="text-white">{row.original.firstName} {row.original.lastName}</DialogTitle>
                    <span className="italic text-white">Form Responses</span>
                </DialogHeader>
                {/* divider */}
                <div className="max-w-full h-[1px] bg-[#8DA1D1] my-3" />
                <div className="max-h-[300px] max-w-full overflow-y-auto">
                    <UserInfo row={row} table={table} />
                    <div className="max-w-full h-[1px] bg-[#8DA1D1] my-3">
                    <UserResponses questions={questions} responses={responses} />
                    </div>
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

const fetchQuestionsAndResponses = async (attendeeId: string, eventId: string, eventYear: string) => {
    // TODO: Replace mock data with actual backend call
    const mockQuestions: RegQuestionData[] = 
        [ { "M" : { "questionImageUrl" : { "S" : "" }, "label" : { "S" : "What school do you attend?" }, "questionId" : { "S" : "bede9713-17cf-4bb9-b362-8c30a1e5b543" }, "type" : { "S" : "SELECT" }, "choices" : { "S" : "UBC,SFU,KPU,Douglas,High School,..." }, "required" : { "BOOL" : true } } }, { "M" : { "label" : { "S" : "Do you have any accessibility/mobility needs that you would need us to know about?" }, "questionId" : { "S" : "49512eca-eec6-4639-b70c-f60f2e0a9371" }, "type" : { "S" : "SELECT" }, "choices" : { "S" : "Yes,No" }, "required" : { "BOOL" : true } } }, { "M" : { "label" : { "S" : "If you answered \"Yes\" to the question above, please let us know of any accommodations you will need below:" }, "questionId" : { "S" : "ee2b5b93-3792-4332-ba83-24b995f12094" }, "type" : { "S" : "TEXT" }, "choices" : { "S" : "" }, "required" : { "BOOL" : false } } }, { "M" : { "label" : { "S" : "LinkedIn URL:" }, "questionId" : { "S" : "013bb98c-4286-4649-bbb9-fbc27185925c" }, "type" : { "S" : "TEXT" }, "choices" : { "S" : "" }, "required" : { "BOOL" : false } } }, { "M" : { "label" : { "S" : "Resume:" }, "questionId" : { "S" : "ea4a8fa7-7bcf-4f86-af60-27ac61c7680b" }, "type" : { "S" : "UPLOAD" }, "choices" : { "S" : "" }, "required" : { "BOOL" : false } } }, { "M" : { "label" : { "S" : "Do you consent to us sharing your resume with our attending partners? (If you didn't upload one, select N/A)" }, "questionId" : { "S" : "f33ba987-6a5f-4ea2-9ba9-ca5f087e6fef" }, "type" : { "S" : "SELECT" }, "choices" : { "S" : "Yes,No,N/A" }, "required" : { "BOOL" : true } } }, { "M" : { "label" : { "S" : "Do you consent to having your email added to our sponsors' mailing lists? " }, "questionId" : { "S" : "a04e1064-65b2-4873-bede-9c4d5cbd32c3" }, "type" : { "S" : "SELECT" }, "choices" : { "S" : "Yes,No" }, "required" : { "BOOL" : true } } }, { "M" : { "label" : { "S" : "Would you be interested in getting your headshot taken at the conference?" }, "questionId" : { "S" : "24f0b385-d92e-43be-92a3-2b225964a778" }, "type" : { "S" : "SELECT" }, "choices" : { "S" : "Yes,No" }, "required" : { "BOOL" : true } } }, { "M" : { "label" : { "S" : "What's the first thing that comes to mind when you hear \"Digital Disruptions\"?" }, "questionId" : { "S" : "04f58eea-1861-4da3-8e4c-8d8e994ce8ba" }, "type" : { "S" : "TEXT" }, "choices" : { "S" : "" }, "required" : { "BOOL" : true } } }, { "M" : { "label" : { "S" : "Would you like to participate in our Attendee Showcase (view the event description above for more info)? If so, please complete ALL of the questions from this point on, otherwise, you may skip them." }, "questionId" : { "S" : "cb1a1e83-f581-473c-97e0-48e9a88d7d20" }, "type" : { "S" : "SELECT" }, "choices" : { "S" : "I would like to participate,I would not like to participate" }, "required" : { "BOOL" : true } } }, { "M" : { "label" : { "S" : "[A/S] Project Name" }, "questionId" : { "S" : "16ce18ff-9e88-4988-8965-b3edc172437a" }, "type" : { "S" : "TEXT" }, "choices" : { "S" : "" }, "required" : { "BOOL" : false } } }, { "M" : { "label" : { "S" : "[A/S] Full names of those who contributed to this project (you may only submit projects with up to 4 contributors MAX)" }, "questionId" : { "S" : "0836c57c-6163-4905-acb5-6578510b5a63" }, "type" : { "S" : "TEXT" }, "choices" : { "S" : "" }, "required" : { "BOOL" : false } } }, { "M" : { "label" : { "S" : "[A/S] Brief description of your project" }, "charLimit" : { "N" : "350" }, "questionId" : { "S" : "5328b778-e593-4077-bd58-d7b0f7cd1752" }, "type" : { "S" : "TEXT" }, "choices" : { "S" : "" }, "required" : { "BOOL" : false } } }, { "M" : { "label" : { "S" : "[A/S] Key technologies used to create your project" }, "questionId" : { "S" : "10231b92-5503-4a22-a205-25d99bee580b" }, "type" : { "S" : "TEXT" }, "choices" : { "S" : "" }, "required" : { "BOOL" : false } } }, { "M" : { "label" : { "S" : "[A/S] Relevant photo of your project (i.e. logo, screenshot of webpage, photo of prototype, etc)" }, "questionId" : { "S" : "e44b5fea-b18a-41bf-b6f2-e685b88d74da" }, "type" : { "S" : "UPLOAD" }, "choices" : { "S" : "" }, "required" : { "BOOL" : false } } }, { "M" : { "label" : { "S" : "[A/S] Link to your project/to learn more about your project (i.e. Github repo, website link, etc)" }, "questionId" : { "S" : "1099caf7-6e25-4c9a-97ab-c7628d1507e9" }, "type" : { "S" : "TEXT" }, "choices" : { "S" : "" }, "required" : { "BOOL" : false } } }, { "M" : { "label" : { "S" : "I confirm that the project I submitted abides by Blueprint's Attendee Showcase requirements (stated in this form's description)" }, "questionId" : { "S" : "f83944a8-97e2-421c-903c-aac91106fe34" }, "type" : { "S" : "SELECT" }, "choices" : { "S" : "I confirm,I didn't submit a project" }, "required" : { "BOOL" : true } } } ]
    ;
    // The 'test' user from the database was used here for the responses
    const mockResponses: UserQuestionIDs = {
        "ee2b5b93-3792-4332-ba83-24b995f12094": { S: "asdf" },
        "04f58eea-1861-4da3-8e4c-8d8e994ce8ba": { S: "asdf" },
        "bede9713-17cf-4bb9-b362-8c30a1e5b543": { S: "UBC" },
        "cb1a1e83-f581-473c-97e0-48e9a88d7d20": { S: "I would not like to participate" },
        "ea4a8fa7-7bcf-4f86-af60-27ac61c7680b": { S: "https://drive.google.com/file/d/1Q60JBkifak4gSrZL65KvafCPVA2HwcZ4/view?usp=drivesdk" },
        "013bb98c-4286-4649-bbb9-fbc27185925c": { S: "asdf" },
        "24f0b385-d92e-43be-92a3-2b225964a778": { S: "No" },
        "a04e1064-65b2-4873-bede-9c4d5cbd32c3": { S: "No" },
        "49512eca-eec6-4639-b70c-f60f2e0a9371": { S: "No" },
        "f33ba987-6a5f-4ea2-9ba9-ca5f087e6fef": { S: "No" },
        "f83944a8-97e2-421c-903c-aac91106fe34": { S: "I didn't submit a project" }
    };

    return {
        questions: mockQuestions,
        responses: mockResponses,
    };
};


