"use client";

import { cn } from "@/lib/utils";
import { BiztechEvent } from "@/types";
import { format, toDate } from "date-fns";
import BizImage from "../Common/BizImage";
import Link from "next/link";
import { Registration } from "@/types/types";
import ConditionalLink from "../Common/ConditionalLink";

const img =
  "https://images.unsplash.com/photo-1744740618649-b324f7f1050d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxMXx8fGVufDB8fHx8fA%3D%3D";

interface EventsAttendedProps {
  events: BiztechEvent[];
  registrations: Registration[];
}

type formattedEvent = {
  slug: string;
  date: string;
  src: string;
  attended: boolean;
};

export default function EventsAttended({
  events,
  registrations,
}: EventsAttendedProps) {
  const registeredEventIds = Array.isArray(registrations)
    ? registrations.map((registration) => registration["eventID;year"])
    : [];

  const formattedEvents: formattedEvent[] = events.map(
    (event: BiztechEvent) => {
      return {
        slug: `/event/${event.id}/${event.year}/register`,
        date: format(toDate(event.startDate), "LLLL d"),
        src: event.imageUrl,
        attended: registeredEventIds.includes(`${event.id};${event.year}`),
      };
    },
  );

  const total = formattedEvents.length;
  const attended = formattedEvents.filter((e) => e.attended).length;
  const progress = (attended / total) * 100;

  if (formattedEvents.length <= 0) {
    return (
      <div className="h-full w-full place-content-center text-center text-bt-blue-0">
        No events available!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 md:gap-4 text-thin">
        {formattedEvents.slice(0, 8).map(({ slug, date, src, attended }) => (
          <ConditionalLink
            key={date}
            className={cn(
              "flex flex-col items-start gap-2 brightness-90",
              !attended && "opacity-40",
              attended &&
                "hover:scale-105 hover:brightness-100 transition-all duration-200",
            )}
            href={slug}
            disabled={!attended}
          >
            <div
              className={cn(
                "relative w-full aspect-square rounded-xl overflow-hidden",
              )}
            >
              <BizImage
                src={src}
                alt={date}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 30vw"
              />
            </div>
            <p className="text-xs text-bt-blue-0">{date}</p>
          </ConditionalLink>
        ))}
      </div>

      {formattedEvents.length > 8 && (
        <div className="text-bt-blue-0/50 text-end text-[0.8rem]">
          {`(+${formattedEvents.length - 8} more events)`}
        </div>
      )}

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-bt-green-700/40">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-bt-green-300 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-left text-sm text-bt-blue-0">
        You’ve attended{" "}
        <span className="font-semibold text-bt-green-300">
          {attended}/{total}
        </span>{" "}
        of our events this year!
      </p>
    </div>
  );
}
