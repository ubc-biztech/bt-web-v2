import React from "react";
import {
  Card,
  CardFooter,
} from "@/components/ui/card";
// more-vert icon
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Button } from "@/components/ui/button"

// this is placeholder if no event image is found
import placeHolderImage from '../../assets/event-placeholder.jpeg';
import Image from 'next/image';

type Props = {
    initialData: BiztechEvent | null,
    clickEffect: (eventClicked?: string) => void;
}

// type definition for a BiztechEvent
type BiztechEvent = {
    id: string;
    year: number;
    capac: number;
    createdAt: number;
    description: string;
    elocation: string;
    ename: string;
    startDate: string;
    endDate: string;
    imageUrl: string;
    updatedAt: number;
};


// mobile event card display
// initialData: contains the event passed in
// clickEffect: the function which toggles the popUp to be rendered when the 'more' button is clicked
// passes the event name to identify which event was clicked. 
// Function is defined as 'clickEffect' in events.tsx
export default function MobileEventCard({ initialData, clickEffect }: Props) {
    // using regex functions to extract time and start date in a readable format
    const startTime = initialData? extractTime(initialData.startDate) : "Event not Found";
    const dateTime = initialData? extractMonthDay(initialData.startDate): "Event not Found";


    return (
        <Card className="w-full h-[100px] border-none bg-events-card-bg flex p-2 mb-4 relative">
            <Image
                src={placeHolderImage} // TODO: REPLACE WITH EVENT IMAGE WHEN FETCH DATA
                alt="event-image"
                className="w-2/5 h-9/10 rounded-lg"
                />
        <CardFooter className="font-poppins text-white block mt-4 mb-4 ml-1 mr-1 pb-0">
        <div className="flex items-center justify-between">
            <p className="p1 text-white font-500">{initialData?.ename}</p> 
            <Button variant="ghost" className="text-white bg-transparent w-2 h-7 absolute top-6.5 right-3" onClick={() => clickEffect(initialData?.ename)}>
                <MoreVertIcon/>
            </Button>
        </div>
            <p className="p3 text-baby-blue mt-2 mb-2">{dateTime} {startTime}</p> 
        </CardFooter>
        </Card>
    );
};

// Functions to extract a readable format of the event start times:
function extractTime(dateTimeString: string): string {
    const date = new Date(dateTimeString); // Create date object from ISO 8601 string
    const hours = date.getUTCHours(); // Get hours in UTC
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
  
    // Convert hours from 24-hour format to 12-hour format
    const formattedHours = hours % 12 || 12; // Handle midnight (0 hours)
  
    // Format the time as HH:mmam/pm
    const formattedTime = `${formattedHours}:${minutes.toString().padStart(2, "0")}${ampm}`;
  
    return formattedTime;
}

function extractMonthDay(dateTimeString: string): string {
    const date = new Date(dateTimeString); // Creates a date object from ISO 8601 string
    const options: Intl.DateTimeFormatOptions = {
        month: "long", // Full month name
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    };

    // Format the date using Intl.DateTimeFormat
    const formattedDate = date.toLocaleDateString("en-US", options);

    return formattedDate;
}