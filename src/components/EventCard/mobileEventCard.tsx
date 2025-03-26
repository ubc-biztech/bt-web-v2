import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
// more-vert icon
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Button } from "@/components/ui/button"
import { extractTime, extractMonthDay } from '../../util/extractDate';


// this is placeholder if no event image is found
import placeHolderImage from '../../assets/event-placeholder.jpeg';
import Image from 'next/image';
import { BiztechEvent } from "@/types/types";
import { ModalHandlers } from "@/pages/admin/home";
import { PopUpItem } from "./types";
import PopupModal from './popup/editPopUp';

type Props = {
    event: BiztechEvent | null,
    eventClick: (event: BiztechEvent) => void;
    modalHandlers: ModalHandlers;
}

const editEventPopupItems: PopUpItem[] = [
    PopUpItem.EditEvent,
    PopUpItem.ViewAsMember,
    PopUpItem.DeleteEvent,
];

export default function MobileEventCard({ event, eventClick, modalHandlers }: Props) {
    const [isModalOpen, setModal] = useState(false)
    const startTime = event ? extractTime(event.startDate) : "";
    const dateTime = event ? extractMonthDay(event.startDate) : "";
    const displayDate = event ? startTime + ' ' + dateTime : "Event not Found";

    const cardRef = useRef<HTMLDivElement>(null);

    const handleMobileMoreClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the card click from firing
        if (event) {
            setModal(!isModalOpen);
        }
    }

    const handleClick = () => {
        if (event) {
            if (isModalOpen) {
                setModal(false)
            } else {
                eventClick(event)
            }
        }
    }

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (isModalOpen && cardRef.current && !cardRef.current.contains(event.target as Node)) {
                setModal(false);
            }
        }
        
            document.addEventListener('mousedown', handleClickOutside);
        
            return () => {
              document.removeEventListener('mousedown', handleClickOutside);
            };
        }, [cardRef, isModalOpen]);


    return (
        <Card className="font-poppins w-full h-[100px] border-none bg-events-card-bg p-2 mb-4 flex" onClick={handleClick} ref={cardRef}>
            <Image
                src={event?.imageUrl ?? placeHolderImage}
                alt="event-image"
                className="h-full w-2/5 rounded-lg object-cover mr-4"
                width={100}
                height={100}
            />
            <div className="flex-1 flex items-center justify-between">
                <div className="max-w-[70%] overflow-hidden">
                    <p className="p1 text-white font-500 truncate">{event?.ename}</p>
                    <p className="p3 text-baby-blue">{displayDate}</p>
                </div>
                <Button variant="ghost" className="text-white bg-transparent w-2 h-7 absolute right-8" 
                    onClick={handleMobileMoreClick}
                >
                    <div className="relative">
                        <MoreVertIcon />
                        <div className="absolute z-50 top-full right-[200px]">
                            {isModalOpen && event &&
                                <PopupModal 
                                    editEventPopupItems={editEventPopupItems} 
                                    modalHandlers={modalHandlers} 
                                    eventID={event.id} 
                                    eventYear={event.year} 
                            />}
                        </div>
                    </div>
                </Button>
            </div>
        </Card>
    );
};
