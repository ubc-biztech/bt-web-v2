import { Card, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import placeHolderImage from "../../assets/event-placeholder.jpeg";
import { extractTime, extractMonthDay } from "@/util/extractDateAndTime";
import { BiztechEvent } from "@/types";
import { isMobile } from "@/util/isMobile";
import { useState, useEffect } from "react";

interface EventCardProps {
  initialData: BiztechEvent | null;
}

const EventCard: React.FC<EventCardProps> = ({ initialData }) => {
  const startTime = initialData
    ? extractTime(initialData.startDate)
    : "Event not Found";
  const dateTime = initialData
    ? extractMonthDay(initialData.startDate)
    : "Event not Found";
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  useEffect(() => {
    const userAgent = navigator.userAgent;
    setIsMobileDevice(isMobile(userAgent));
  }, []);
  return (
    <Card
      className="w-1/3 border-none bg-events-card-bg"
      style={{ width: isMobileDevice ? "50%" : "33%" }}
    >
      <Image
        src={placeHolderImage}
        alt="event-image"
        className="w-full h-[100px] rounded-t-lg"
      />
      <CardFooter
        className="font-poppins p-3 gap-0.5 flex flex-col text-left items-start
      "
      >
        <h6 className="text-white font-500 text-sm">{initialData?.ename}</h6>
        <p className="text-baby-blue text-xs">
          {dateTime} {startTime}
        </p>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
