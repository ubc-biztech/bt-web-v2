import { BiztechEvent } from "@/types/types";
import { AnimatePresence, m } from "framer-motion";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import { EventCard } from "./EventCard";

interface EventDashboardProps {
  events: BiztechEvent[];
  user: string;
  registered: string[];
  saved: string[];
  setSaved: Dispatch<SetStateAction<string[]>>;
}

export const EventDashboard: React.FC<EventDashboardProps> = ({
  events,
  user,
  registered,
  saved,
  setSaved,
}) => {
  const currentEvents = events.filter((event) => {
    const time = new Date(event.startDate);
    return new Date() < time;
  });

  const pastEvents = events.filter((event) => {
    const time = new Date(event.startDate);
    return new Date() > time;
  });

  return (
    <>
      {currentEvents.length > 0 && (
        <AnimatePresence mode="wait">
          <m.div
            layout
            key={"CurrentEvents"}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            transition={{
              type: "tween",
              ease: "easeInOut",
              duration: 0.5,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-white mb-3">Current Events</h4>
          </m.div>
        </AnimatePresence>
      )}
      <div className="flex flex-col mb-5">
        <AnimatePresence mode="popLayout">
          {currentEvents.length > 0 &&
            currentEvents.map((event, i) => {
              return (
                <div key={`${event.id + event.year + event.createdAt}`}>
                  <EventCard
                    event={event}
                    user={user}
                    registered={registered}
                    saved={saved}
                    setSaved={setSaved}
                  />
                </div>
              );
            })}
        </AnimatePresence>
      </div>
      {pastEvents.length > 0 && (
        <AnimatePresence mode="popLayout">
          <m.div
            layout
            key={"PastEvents"}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            transition={{
              type: "tween",
              ease: "easeInOut",
              duration: 0.3,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-white mb-3 opacity-40">Past Events</h4>
          </m.div>
        </AnimatePresence>
      )}
      <div className="flex flex-col opacity-40">
        {pastEvents.length > 0 &&
          pastEvents.map((event) => {
            return (
              <div key={`${event.id + event.year}`}>
                <EventCard
                  event={event}
                  user={user}
                  registered={registered}
                  saved={saved}
                  setSaved={setSaved}
                />
              </div>
            );
          })}
      </div>
    </>
  );
};
