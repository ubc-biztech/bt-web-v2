import { BiztechEvent } from "@/types/types";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Bookmark } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { fetchBackend } from "@/lib/db";
import Link from "next/link";

interface EventCardProps {
  event: BiztechEvent;
  user: string;
  registered: string[];
  saved: string[];
  setSaved: Dispatch<SetStateAction<string[]>>;
}

const months = [
  "Jan.",
  "Feb.",
  "Mar.",
  "Apr.",
  "May",
  "Jun.",
  "Jul.",
  "Aug.",
  "Sep.",
  "Oct.",
  "Nov.",
  "Dec.",
];

export const EventCard: React.FC<EventCardProps> = ({
  event,
  user,
  registered,
  saved,
  setSaved,
}) => {
  const [fill, setFill] = useState(false);
  let dateString = new Date(event.startDate);

  // const handleSaveClick = async (e: React.MouseEvent<SVGSVGElement>, id: string, year: number) => {
  //   e.preventDefault();
  //   let isFavourite;
  //   const eventId = `${id};${year}`;
  //   let newSaved: string[] = saved;
  //   if (saved.includes(eventId)) {
  //     newSaved = saved.filter((s) => {
  //       return s !== eventId;
  //     });
  //     isFavourite = false;
  //     setFill(false);
  //   } else {
  //     newSaved.push(eventId);
  //     isFavourite = true;
  //     setFill(true);
  //   }
  //   setSaved(newSaved);

  //   if (!user) {
  //     return;
  //   }

  //   const body = {
  //     eventID: id,
  //     year,
  //     isFavourite,
  //   };

  //   try {
  //     await fetchBackend({ endpoint: `/users/favEvent/${user}`, method: "PATCH", data: body });
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const timeStateIndicator = (ev: BiztechEvent) => {
    const startDate = new Date(ev.startDate);
    const deadline = new Date(ev.deadline);
    if (new Date() >= deadline && startDate >= new Date()) {
      return (
        <div className="rounded-full font-poppin font-[700] px-3 py-1 text-white bg-bt-green-300 text-[8px] lg:text-[12px]  flex items-center">
          COMING UP
        </div>
      );
    } else if (
      startDate > new Date() &&
      !registered.includes(`${ev.id};${ev.year}`)
    ) {
      return (
        <div className="rounded-full px-3 py-1 font-[700]  text-white bg-bt-pink text-[8px] lg:text-[12px] flex items-center">
          REGISTER BY {`${deadline.getMonth() + 1}/${deadline.getDate()}`}
        </div>
      );
    } else {
      return <></>;
    }
  };

  const registeredIndicator = (ev: BiztechEvent) => {
    if (registered.includes(`${ev.id};${ev.year}`)) {
      return (
        <div className="rounded-full font-poppin font-[700] px-3 py-1 text-white bg-black text-[8px] lg:text-[12px]  flex items-center">
          REGISTERED
        </div>
      );
    } else {
      return <></>;
    }
  };

  const dateText =
    `${months[dateString.getMonth()]} ${dateString.getDate()}, ${event.year}` +
    " " +
    `${dateString.toTimeString().slice(0, 5)}`;

  const eventPricingText =
    `${
      event.pricing && event.pricing?.members > 0
        ? "$" + event.pricing?.members.toFixed(2)
        : "Free!"
    } ` +
    `${
      event.pricing?.nonMembers > 0
        ? `(Non-members ${event.pricing?.nonMembers.toFixed(2)})`
        : event.pricing?.nonMembers === 0
        ? "(Non-members Free!)"
        : "(Members only)"
    }`;

  return (
    <>
      <AnimatePresence mode="popLayout">
        <Link href={`/event/${event.id}/${event.year}/register`}>
          <motion.div
            key={`${event.id + event.year + event.createdAt}`}
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
            <div className="bg-bt-blue-300 w-full p-3 rounded-[10px] my-2">
              <div className="flex flex-row space-x-5 relative">
                <div className="relative lg:w-[200px] lg:h-[130px] w-[100px] h-[75px] overflow-hidden rounded-lg shrink-0">
                  <Image
                    className="object-cover"
                    fill
                    src={event.imageUrl}
                    alt={event.ename}
                  />
                </div>
                <div className="flex flex-col space-y-1 grow">
                  <div className="font-600 text-sm lg:text-[24px] py-0.5 lg:py-2 flex flex-row space-x-3 items-center w-full">
                    <div>{event.ename}</div>
                    <div className="grow"></div>
                    <div className="hidden lg:block">
                      {registeredIndicator(event)}
                    </div>
                    <div className="hidden lg:block">
                      {timeStateIndicator(event)}
                    </div>
                    <div className="">
                      {/* TODO: awaiting backend favEvent fix */}
                      {/* <Bookmark
                      height={30}
                      width={30}
                      onClick={(e) => handleSaveClick(e, event.id, event.year)}
                      className={`cursor-pointer ${saved.includes(`${event.id};${event.year}`) || fill ? "fill-white" : ""}`}
                      /> */}
                    </div>
                  </div>
                  <p className="text-[10px] lg:text-sm text-events-bt-blue-100">
                    {dateText}
                  </p>
                  <div className="flex flex-row items-center justify-between w-full">
                    <p className="text-[10px] lg:text-sm text-events-bt-blue-100">
                      {eventPricingText}
                    </p>
                    <div className="lg:hidden flex grow justify-end mr-0.5">
                      {registeredIndicator(event)}
                    </div>
                    <div className="lg:hidden">{timeStateIndicator(event)}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </Link>
      </AnimatePresence>
    </>
  );
};
