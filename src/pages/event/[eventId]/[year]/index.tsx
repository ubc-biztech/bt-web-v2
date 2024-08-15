"use client"
import { AttendeeEventRegistrationForm } from "@/components/Events/AttendeeEventRegistrationForm";
import { PartnerEventRegistrationForm } from "@/components/Events/PartnerEventRegistrationForm";
import { BiztechEvent } from "@/types";

export default function FormRegister() {
    const handleSubmit = async (data: any) => {
        // TODO: implement API call here
        console.log(data)
    }
    const event: BiztechEvent = {
        "endDate": "2024-10-31T20:05:00.000Z",
        "year": 2024,
        "isPublished": true,
        "partnerRegistrationQuestions": [
            {
                "charLimit": 10,
                "questionId": "b7ed3485-8fe0-4735-8cd2-037ad1fe290a",
                "questionImageUrl": "asdf",
                "label": "testtext",
                "type": "TEXT",
                "choices": "",
                "required": true
            },
            {
                "label": "check",
                "questionId": "4c7a513f-77a6-4651-bb67-55a32eafebfd",
                "type": "CHECKBOX",
                "choices": "test1,test,2",
                "required": true
            },
            {
                "label": "sel",
                "questionId": "df7051f1-1652-45c6-8e92-ba79b47d01f8",
                "type": "SELECT",
                "choices": "s1,s2",
                "required": true
            },
            {
                "label": "up",
                "questionId": "4ba52f99-9d05-469c-8aeb-5e34bfb8de33",
                "type": "UPLOAD",
                "choices": "",
                "required": true
            },
            {
                "participantCap": "12",
                "label": "work",
                "questionId": "81774071-d660-4e6e-aa43-82cd967153dd",
                "type": "WORKSHOP SELECTION",
                "choices": "w1,w2,w3",
                "required": true
            },
            {
                "label": "skills",
                "questionId": "800727dd-1ae9-4ad9-953e-6d65948d6021",
                "type": "SKILLS",
                "choices": "s1,s,5,other",
                "isSkillsQuestion": true,
                "required": true
            },
            {
                "label": "skills",
                "questionId": "800727dd-1ae9-4ad9-953e-6d65948d60215",
                "type": "SKILLS",
                "choices": "s1,3,2,other",
                "isSkillsQuestion": true,
                "required": true
            }
        ],
        "description": "asdf",
        "feedback": "",
        "createdAt": 1714507569426,
        "ename": "asdf",
        "capac": 123,
        "elocation": "asdf",
        "imageUrl": "https://www.wikihow.com/images/thumb/d/db/Get-the-URL-for-Pictures-Step-2-Version-6.jpg/v4-460px-Get-the-URL-for-Pictures-Step-2-Version-6.jpg",
        "id": "asdfasdfasdf",
        "deadline": "2024-10-09T20:05:00.000Z",
        "isApplicationBased": false,
        "partnerDescription": "asdf",
        "pricing": {
            "members": 0,
            "nonMembers": 0
        },
        "startDate": "2024-10-30T20:05:00.000Z",
        "isCompleted": false,
        "registrationQuestions": [
            {
                "charLimit": 123,
                "questionId": "5ecb3c4c-ae0d-4807-8323-5a301949b1f5",
                "questionImageUrl": "https://gogo.com",
                "label": "test text",
                "type": "TEXT",
                "choices": "",
                "required": true
            },
            {
                "questionImageUrl": "https://gogo.com",
                "label": "test checkbox",
                "questionId": "467e6991-6d93-467e-92f2-9a93ec62e3df",
                "type": "CHECKBOX",
                "choices": "test,test1,test2",
                "required": true
            },
            {
                "questionImageUrl": "https://gogo.com",
                "label": "selection",
                "questionId": "f541220c-eeee-42c0-b695-fc702005260a",
                "type": "SELECT",
                "choices": "s1,s2,s3",
                "required": true
            },
            {
                "questionImageUrl": "https://gogo.com",
                "label": "test",
                "questionId": "be6d1bee-bd2d-44e2-a6ad-becfda4df4fd",
                "type": "UPLOAD",
                "choices": "",
                "required": true
            },
            {
                "participantCap": "20",
                "questionId": "6c79c4c7-5942-4731-9379-1b391d132bf9",
                "questionImageUrl": "https://gogo.com",
                "label": "which workshop?",
                "type": "WORKSHOP SELECTION",
                "choices": "w1,w2,w3",
                "required": true
            }
        ],
        "updatedAt": 1723579128641,
        "counts": {
            "registeredCount": 0,
            "checkedInCount": 0,
            "waitlistCount": 0,
            "dynamicCounts": [
                {
                    "questionId": "6c79c4c7-5942-4731-9379-1b391d132bf9",
                    "counts": [
                        {
                            "label": "w1",
                            "count": 0,
                            "cap": 20
                        },
                        {
                            "label": "w2",
                            "count": 0,
                            "cap": null
                        },
                        {
                            "label": "w3",
                            "count": 0,
                            "cap": null
                        }
                    ]
                }
            ]
        }
    }
   
    return (
        <main className="bg-primary-color min-h-screen">
            <div className="mx-auto flex flex-col">
                <AttendeeEventRegistrationForm onSubmit={handleSubmit} event={event}/>
                <PartnerEventRegistrationForm onSubmit={handleSubmit} event={event}/>
            </div>
        </main>
    );
}