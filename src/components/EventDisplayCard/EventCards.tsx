import { BiztechEvent } from "@/types/types";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import { EventCard } from "./EventCard";

interface UserCardProps {
  events: BiztechEvent[];
  user: string;
  saved: string[];
  setSaved: Dispatch<SetStateAction<string[]>>;
}

export const EventCards: React.FC<UserCardProps> = ({ events, user, saved, setSaved }) => {
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
      <AnimatePresence mode="popLayout">
        {currentEvents.length > 0 && (
          <motion.div
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
          </motion.div>
        )}
        <div className="flex flex-col space-y-5 mb-5">
          {currentEvents &&
            currentEvents
              .filter((e) => {
                return e.isPublished;
              })
              .map((event) => {
                return <EventCard event={event} user={user} saved={saved} setSaved={setSaved} />;
              })}
        </div>
        {pastEvents.length > 0 && (
          <motion.div
            key={"PastEvents"}
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
            <h4 className="text-white mb-3 opacity-40">Past Events</h4>
          </motion.div>
        )}
        <div className="flex flex-col space-y-5 opacity-40">
          {pastEvents &&
            pastEvents
              .filter((e) => {
                return e.isPublished;
              })
              .map((event) => {
                return <EventCard event={event} user={user} saved={saved} setSaved={setSaved} />;
              })}
        </div>
      </AnimatePresence>
    </>
  );
};
