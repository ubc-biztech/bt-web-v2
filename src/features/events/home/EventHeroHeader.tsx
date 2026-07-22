import {
  CalendarDays,
  ExternalLink,
  Info,
  MapPin,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { EventHomeEvent } from "./types";
import {
  formatEventDateRange,
  getEventSubtitle,
  getExternalEventUrl,
  getTargetAudience,
  stripHtml,
} from "./utils";

type EventHeroHeaderProps = {
  event: EventHomeEvent;
};

type DetailRowProps = {
  icon: typeof MapPin;
  label: string;
  value: string;
};

function DetailRow({ icon: Icon, label, value }: DetailRowProps) {
  return (
    <div className="flex max-w-full min-w-0 items-center gap-3 md:grid md:grid-cols-[18px_1fr] md:border-b md:border-[#263451] md:py-2 md:last:border-b-0">
      <Icon
        className="h-4 w-4 shrink-0 text-[#b8b8b8] md:mt-0.5 md:text-[#9f9f9f]"
        aria-hidden="true"
      />
      <div className="min-w-0 md:flex md:flex-row md:items-start md:justify-between md:gap-5">
        <p className="hidden text-xs font-700 text-[#9f9f9f] md:block">
          {label}
        </p>
        <p className="min-w-0 break-words text-sm font-600 leading-5 text-[#b8b8b8] md:text-right md:text-xs md:font-800 md:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

export function EventHeroHeader({ event }: EventHeroHeaderProps) {
  const overview =
    stripHtml(event.description) ||
    "More event details will be available soon.";
  const externalUrl = getExternalEventUrl(event);
  const eventInitial = event.ename?.charAt(0)?.toUpperCase() || "E";

  return (
    <section className="overflow-hidden rounded-lg border border-[#263451] bg-[#0B152C] shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
      <div className="relative min-h-[116px] overflow-hidden md:min-h-[132px]">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={`${event.ename} cover`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-bt-blue-500" />
        )}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/65" />

        {externalUrl && (
          <Link
            href={externalUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${event.ename} event link`}
            className="absolute right-4 top-4 z-20 inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#444] bg-[#3f3f3f] text-white transition hover:bg-[#505050]"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}

        <div className="relative z-10 flex min-h-[116px] flex-col justify-end gap-3 p-4 sm:flex-row sm:items-center sm:justify-start md:min-h-[132px] md:p-5">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-[#444] bg-[#f5f5f5] shadow-md md:h-12 md:w-12">
            {event.imageUrl ? (
              <Image
                src={event.imageUrl}
                alt=""
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-lg font-800 text-[#151515]">
                {eventInitial}
              </span>
            )}
          </div>
          <div className="min-w-0 pr-12 sm:pr-16">
            <h1 className="break-words text-[26px] font-800 leading-none tracking-[0] text-white md:text-[34px]">
              {event.ename}
            </h1>
            <p className="mt-1 text-sm font-600 text-[#c8c8c8]">
              {getEventSubtitle(event)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 border-t border-[#263451] p-4 md:grid-cols-[1.05fr_1fr] md:gap-6 md:p-5">
        <div className="order-2 md:order-1">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-bt-green-300" aria-hidden="true" />
            <h2 className="text-[22px] font-800 text-white sm:text-base md:text-lg">
              Event Overview
            </h2>
          </div>
          <div className="mt-3 md:max-h-[136px] md:overflow-y-auto md:pr-3 md:[scrollbar-color:#555_transparent] md:[scrollbar-width:thin] md:[&::-webkit-scrollbar-thumb]:rounded-full md:[&::-webkit-scrollbar-thumb]:bg-[#555] md:[&::-webkit-scrollbar-track]:bg-transparent md:[&::-webkit-scrollbar]:w-1.5">
            <p className="max-w-2xl whitespace-pre-line text-sm leading-6 text-[#b8b8b8]">
              {overview}
            </p>
            {externalUrl && (
              <p className="mt-4 text-xs text-[#aaa] md:text-sm">
                For more info, visit{" "}
                <Link
                  href={externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-700 text-[#8f86ff] transition hover:text-[#b8b3ff]"
                >
                  {event.ename} event page
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </Link>
              </p>
            )}
          </div>
        </div>

        <div className="order-1 flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-[#263451] pb-5 md:order-2 md:block md:border-b-0 md:pb-0 md:pl-6">
          <DetailRow
            icon={MapPin}
            label="Location"
            value={event.elocation || "Location TBA"}
          />
          <DetailRow
            icon={CalendarDays}
            label="Dates"
            value={formatEventDateRange(event.startDate, event.endDate)}
          />
          <DetailRow
            icon={UsersRound}
            label="Target audience"
            value={getTargetAudience()}
          />
        </div>
      </div>
    </section>
  );
}
