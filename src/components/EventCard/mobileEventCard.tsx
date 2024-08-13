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
    initialData: BiztechEvent | null,
    eventClick: (event: BiztechEvent) => void;
}


export default function MobileEventCard({ initialData, eventClick }: Props) {

    const startTime = initialData ? extractTime(initialData.startDate) : "";
    const dateTime = initialData ? extractMonthDay(initialData.startDate) : "";
    const displayDate = initialData ? startTime + ' ' + dateTime : "Event not Found";

    const handleMobileMoreClick = () => {
        if (initialData) {
            eventClick(initialData)
        }
    }

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
                    <Button variant="ghost" className="text-white bg-transparent w-2 h-7 absolute top-6.5 right-3" onClick={handleMobileMoreClick}>
                        <MoreVertIcon />
                    </Button>
                </div>
                <p className="p3 text-baby-blue mt-2 mb-2">{displayDate}</p>
            </CardFooter>
        </Card>
    );
};
