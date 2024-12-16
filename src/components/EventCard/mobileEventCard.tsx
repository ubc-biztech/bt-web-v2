import React from "react";
import {
    Card,
    CardFooter,
} from "@/components/ui/card";
// more-vert icon
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Button } from "@/components/ui/button"
import { extractTime, extractMonthDay } from '../../util/extractDate';


// this is placeholder if no event image is found
import placeHolderImage from '../../assets/event-placeholder.jpeg';
import Image from 'next/image';
import { BiztechEvent } from "@/types/types";

type Props = {
    event: BiztechEvent | null,
    eventClick: (event: BiztechEvent) => void;
}


export default function MobileEventCard({ event, eventClick }: Props) {

    const startTime = event ? extractTime(event.startDate) : "";
    const dateTime = event ? extractMonthDay(event.startDate) : "";
    const displayDate = event ? startTime + ' ' + dateTime : "Event not Found";

    const handleMobileMoreClick = () => {
        if (event) {
            eventClick(event)
        }
    }

    return (
        <Card className="w-full h-[100px] border-none bg-events-card-bg flex p-2 mb-4 relative">
            <Image
                src={event?.imageUrl ?? placeHolderImage}
                alt="event-image"
                className="w-2/5 h-9/10 rounded-lg"
                width={100}
                height={100}
            />
            <CardFooter className="font-poppins text-white block mt-4 mb-4 ml-1 mr-1 pb-0">
                <div className="flex items-center justify-between">
                    <p className="p1 text-white font-500">{event?.ename}</p>
                    <Button variant="ghost" className="text-white bg-transparent w-2 h-7 absolute top-6.5 right-3" onClick={handleMobileMoreClick}>
                        <MoreVertIcon />
                    </Button>
                </div>
                <p className="p3 text-baby-blue mt-2 mb-2">{displayDate}</p>
            </CardFooter>
        </Card>
    );
};
