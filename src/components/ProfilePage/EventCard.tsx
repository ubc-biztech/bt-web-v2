import { Card, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import placeHolderImage from "../../assets/event-placeholder.jpeg";

interface EventCardProps {
  initialData: BiztechEvent | null;
}

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

const EventCard: React.FC<EventCardProps> = ({ initialData }) => {
  const startTime = initialData
    ? extractTime(initialData.startDate)
    : "Event not Found";
  const dateTime = initialData
    ? extractMonthDay(initialData.startDate)
    : "Event not Found";
  return (
    <Card
      className="w-1/3 border-none bg-events-card-bg"
      style={{ backgroundColor: "#394971" }}
    >
      <Image
        src={placeHolderImage}
        alt="event-image"
        className="w-full h-[100px] rounded-t-lg"
      />
      <CardFooter
        className="font-poppin p-3 gap-0.5 flex flex-col text-left items-start
      "
      >
        <h6 className="text-white font-500">{initialData?.ename}</h6>
        <p className="text-baby-blue">
          {dateTime} {startTime}
        </p>
      </CardFooter>
    </Card>
  );
};

export default EventCard;

function extractTime(dateTimeString: string): string {
  const date = new Date(dateTimeString); // Create date object from ISO 8601 string
  const hours = date.getUTCHours(); // Get hours in UTC
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? "pm" : "am";

  // Convert hours from 24-hour format to 12-hour format
  const formattedHours = hours % 12 || 12; // Handle midnight (0 hours)

  // Format the time as HH:mmam/pm
  const formattedTime = `${formattedHours}:${minutes
    .toString()
    .padStart(2, "0")}${ampm}`;

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
