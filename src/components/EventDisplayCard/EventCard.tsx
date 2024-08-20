import { BiztechEvent } from "@/types/types";
import { motion } from "framer-motion";
import Image from "next/image";
import { Bookmark } from "lucide-react";
import { getCurrentUser } from "@aws-amplify/auth";
import { Dispatch, SetStateAction, useState } from "react";
import { fetchBackend } from "@/lib/db";

interface EventCardProps {
  event: BiztechEvent;
  user: string;
  saved: string[];
  setSaved: Dispatch<SetStateAction<string[]>>;
}

const months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];

export const EventCard: React.FC<EventCardProps> = ({ event, user, saved, setSaved }) => {
  const [fill, setFill] = useState(false);
  let dateString = new Date(event.startDate);

  const handleSaveClick = async (id: string, year: number) => {
    let isFavourite;
    const eventId = `${id};${year}`;
    let newSaved: string[] = saved;
    if (saved.includes(eventId)) {
      newSaved = saved.filter((s) => {
        return s !== eventId;
      });
      isFavourite = false;
      setFill(false);
    } else {
      newSaved.push(eventId);
      isFavourite = true;
      setFill(true);
    }

    const body = {
      eventID: id,
      year,
      isFavourite,
    };

    try {
      await fetchBackend({ endpoint: `/users/favEvent/${user}`, method: "PATCH", data: body });
    } catch (err) {
      console.error(err);
    }
    setSaved(newSaved);
  };

  const timeStateIndicator = (event: BiztechEvent) => {
    const startDate = new Date(event.startDate);
    const deadline = new Date(event.deadline);
    if (new Date() >= deadline && startDate >= new Date()) {
      return (
        <div className="rounded-full font-poppin font-[700] px-3 py-1 text-white bg-secondary-color text-[8px] lg:text-[12px]  flex items-center">
          COMING UP
        </div>
      );
    } else if (startDate > new Date()) {
      return (
        <div className="rounded-full px-3 py-1 font-poppins font-[700]  text-white bg-events-coming-up text-[8px] lg:text-[12px] flex items-center">
          REGISTER BY {`${deadline.getMonth() + 1}/${deadline.getDate()}`}
        </div>
      );
    } else {
      return <></>;
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{
          type: "tween",
          ease: "easeInOut",
          duration: 0.3,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-events-user-card-bg w-full p-3 rounded-[10px] my-2">
          <div className="flex flex-row space-x-5 relative">
            <div className="relative lg:w-[200px] lg:h-[130px] w-[100px] h-[75px] overflow-hidden rounded-lg shrink-0">
              <Image className="object-cover" fill src={event.imageUrl} alt={event.ename} />
            </div>
            <div className="flex flex-col space-y-1 grow">
              <div className="font-600 text-sm lg:text-[24px] py-0.5 lg:py-2 flex flex-row space-x-3 items-center w-full">
                <div>{event.ename}</div>
                <div className="hidden lg:block">{timeStateIndicator(event)}</div>
                <div className="grow flex justify-end">
                  <Bookmark
                    height={30}
                    width={30}
                    onClick={() => handleSaveClick(event.id, event.year)}
                    className={`cursor-pointer ${saved.includes(`${event.id};${event.year}`) || fill ? "fill-white" : ""}`}
                  />
                </div>
              </div>
              <p className="text-[10px] lg:text-sm text-events-baby-blue">
                {`${months[dateString.getMonth()]} ${dateString.getDate()}, ${event.year}`}, {dateString.toTimeString().slice(0, 5)}
              </p>
              <div className="flex flex-row items-center justify-between w-full">
                <p className="text-[10px] lg:text-sm text-events-baby-blue">
                  {`${event.pricing ? "$" + event.pricing.members.toFixed(2) : "Free!"}`}{" "}
                  {event.pricing.nonMembers ? `(Non-members ${event.pricing?.nonMembers.toFixed(2)})` : "(Members only)"}
                </p>
                <div className="lg:hidden">{timeStateIndicator(event)}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};
