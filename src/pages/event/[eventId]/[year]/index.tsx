"use client"
import { EventRegistrationForm } from "@/components/Events/EventRegistrationForm";
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
        "partnerRegistrationQuestions": [],
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
        "updatedAt": 1723477932960
    }
   
    return (
        <main className="bg-primary-color min-h-screen">
            <div className="mx-auto flex flex-col">
                <EventRegistrationForm onSubmit={handleSubmit} event={event}/>
            </div>
        </main>
    );
}