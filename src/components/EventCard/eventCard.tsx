import React, { useEffect, useRef } from "react";
import { useState } from "react";
import PopupModal from './popup/editPopUp';
import {
  Card,
  CardFooter,
} from "@/components/ui/card";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Button } from "@/components/ui/button"
import { extractTime, extractMonthDay } from '../../util/extractDate'; 

// this is placeholder if no event image is found
import placeHolderImage from '../../assets/event-placeholder.jpeg';
import Image from 'next/image';
import { BiztechEvent } from "@/types/biztechEvent";

type Props = {
    initialData: BiztechEvent | null,
    setIsDelete: React.Dispatch<React.SetStateAction<boolean>>,
    eventClick: (event: BiztechEvent) => void;
}

interface PopUpItem {
   title: string;
}

const popUpItems: PopUpItem[] = [
    {
     title: 'Edit Event',
    },
    {
     title: 'View as Member',
    },
    {
     title: 'Delete Event',
    },
];

export default function EventCard({ initialData, setIsDelete, eventClick }: Props) {
    // couldn't use the same state as mobile, because that opened the popup modal for every event 
    // instead of the specific one which was clicked.
    const [isModalOpen, setModal] = useState(false)
    const startTime = initialData? extractTime(initialData.startDate) : "";
    const dateTime = initialData? extractMonthDay(initialData.startDate): "";
    const displayDate = initialData? startTime + ' ' + dateTime : "Event not Found";

    const ref = useRef<HTMLDivElement>(null);

    const handlePopUpModalClick = () => {
        if (initialData) {
        eventClick(initialData)
        }
        setModal(!isModalOpen)
    }

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (!isModalOpen && ref.current && !ref.current.contains(event.target as Node)) {
                setModal(false);
            }
        }
    
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
            <Button variant="ghost" className="text-white bg-transparent w-2 h-7" onClick={handlePopUpModalClick} >
                {isModalOpen? <PopupModal popUpItems={popUpItems} setIsDelete={setIsDelete} ref={ref} /> : <MoreVertIcon/>}
            </Button>
        </div>
            <p className="p3 text-baby-blue mt-2 mb-2">{displayDate}</p> 
        </CardFooter>
        </Card>
    );
};
