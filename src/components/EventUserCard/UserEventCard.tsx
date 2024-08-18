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
                    <div className="flex flex-col space-y-1">
                      <div className="font-600 text-[24px] py-2">{event.ename}</div>
                      <p className="text-sm text-events-baby-blue">
                        {`${months[dateString.getMonth()]} ${dateString.getDate()}, ${dateString.getFullYear()}`}, {dateString.toTimeString().slice(0, 5)}
                      </p>
                      <p className="text-sm text-events-baby-blue">
                        {`${event.pricing ? "$" + event.pricing.members.toFixed(2) : "Free!"}`}{" "}
                        {event.pricing.nonMembers ? `(Non-members ${event.pricing?.nonMembers.toFixed(2)})` : "(Members only)"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
    </>
  );
};
