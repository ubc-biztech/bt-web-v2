import { BiztechEvent } from "@/types/types";
import Image from "next/image";
import React, { useEffect } from "react";

interface UserCardProps {
  title: string;
  events: BiztechEvent[];
}

const months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];

export const UserEventCard: React.FC<UserCardProps> = ({ title, events }) => {
  useEffect(() => {
    console.log(events);
  }, []);

  const timeStateIndicator = (event: BiztechEvent) => {
    const startDate = new Date(event.startDate);
    const deadline = new Date(event.deadline);
    if (new Date() >= deadline && startDate >= new Date()) {
      return <div className="rounded-full font-poppins px-2 py-1 text-white bg-secondary-color text-[12px] flex items-center">COMING UP</div>;
    } else if (startDate > new Date()) {
      return (
        <div className="rounded-full px-2 py-1 font-poppins  text-white bg-events-coming-up text-[12px] flex items-center">
          REGISTER BY {`${deadline.getMonth() + 1}/${deadline.getDate()}`}
        </div>
      );
    } else {
      return <></>;
    }
  };
  return (
    <>
      <h4 className="text-white mb-3">{title}</h4>
      <div className="flex flex-col space-y-5">
        {events &&
          events
            .filter((e) => {
              return e.isPublished;
            })
            .map((event) => {
              let dateString = new Date(event.startDate);
              return (
                <div className="bg-events-user-card-bg w-full p-3 rounded-[10px]" key={event.id}>
                  <div className="flex flex-row space-x-5 relative">
                    <div className="relative w-[200px] h-[130px] overflow-hidden rounded-lg">
                      <Image className="object-cover" fill src={event.imageUrl} alt={event.ename} />
                    </div>
                    <div className="flex flex-col space-y-1 grow">
                      <div className="font-600 text-[24px] py-2 flex flex-row space-x-3 items-center">
                        <div>{event.ename}</div>
                        <div className="hidden lg:block">{timeStateIndicator(event)}</div>
                      </div>
                      <p className="text-sm text-events-baby-blue">
                        {`${months[dateString.getMonth()]} ${dateString.getDate()}, ${event.year}}`}, {dateString.toTimeString().slice(0, 5)}
                      </p>
                      <div className="flex flex-row items-center justify-between w-full">
                        <p className="text-sm text-events-baby-blue">
                          {`${event.pricing ? "$" + event.pricing.members.toFixed(2) : "Free!"}`}{" "}
                          {event.pricing.nonMembers ? `(Non-members ${event.pricing?.nonMembers.toFixed(2)})` : "(Members only)"}
                        </p>
                        <div className="lg:hidden">{timeStateIndicator(event)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
    </>
  );
};
