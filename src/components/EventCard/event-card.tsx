import React, { useEffect, useRef } from "react";
import { useState } from "react";
import PopupModal from './popup/edit-pop-up';
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
    setIsDelete: React.Dispatch<React.SetStateAction<boolean>>,
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

interface PopUpItem {
   title: string;
   link: string;
}

const popUpItems: PopUpItem[] = [
    {
     title: 'Edit Event',
     link: 'javascript:void(0)',
    },
    {
     title: 'View as Member',
     link: 'javascript:void(0)',
    },
    {
     title: 'Delete Event',
     link: 'javascript:void(0)',
    },
];

// desktop event-card display 
// initialData: the event to be displayed on the card
// setIsDelete: the state modifier for isDelete
// clickEffect: the function which toggles the popUp to be rendered when the 'more' button is clicked
// passes the event name to identify which event was clicked. 
export default function EventCard({ initialData, setIsDelete, clickEffect }: Props) {
    // state which toggles whether the popUp for this specific event should be rendered
    // couldn't use the same state as mobile, because that opened the popup modal for every event 
    // instead of the specific one which was clicked.
    const [isModalOpen, setModal] = useState(false)
    // using regex functions to extract time and start date in a readable format
    const startTime = initialData? extractTime(initialData.startDate) : "Event not Found";
    const dateTime = initialData? extractMonthDay(initialData.startDate): "Event not Found";
    const ref = useRef<HTMLDivElement>(null);

    // function to detect a click off
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (!isModalOpen && ref.current && !ref.current.contains(event.target as Node)) {
                setModal(false);
            }
        }
    
        // Bind the event listener
        document.addEventListener('mousedown', handleClickOutside);
    
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [ref]);

    return (
        <Card className="w-9/10 border-none bg-events-card-bg">
            <Image
                src={placeHolderImage} 
                alt="event-image"
                className="w-full h-[250px] rounded-t-lg"
                />
        <CardFooter className="font-poppins text-white block mt-4 mb-4 ml-1 mr-1 pb-0">
        <div className="flex items-center justify-between">
            <h5 className="text-white font-500">{initialData?.ename}</h5>  
            <Button variant="ghost" className="text-white bg-transparent w-2 h-7" onClick={() => {clickEffect(initialData?.ename); setModal(!isModalOpen)}} >
                {isModalOpen? <PopupModal popUpItems={popUpItems} setIsDelete={setIsDelete} ref={ref} /> : <MoreVertIcon/>}
            </Button>
        </div>
            <p className="p3 text-baby-blue mt-2 mb-2">{dateTime} {startTime}</p> 
        </CardFooter>
        </Card>
    );
};

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
