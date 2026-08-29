import {
  CalendarDays,
  ExternalLink,
  Info,
  MapPin,
  Undo2,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import type { EventHomeEvent } from "./types";
import {
  getEventAccessLabel,
  getEventSubtitle,
  getExternalEventUrl,
  stripHtml,
} from "./utils";

type EventHeroHeaderProps = {
  event: EventHomeEvent;
};

type DetailRowProps = {
  icon: typeof MapPin;
  value: string;
  secondary?: string;
};

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const heroDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function getEventTimeRange(event: EventHomeEvent) {
  const start = event.startDate ? new Date(event.startDate) : null;
  const end = event.endDate ? new Date(event.endDate) : null;

  if (!start || Number.isNaN(start.getTime())) return "";
  if (!end || Number.isNaN(end.getTime())) return timeFormatter.format(start);

  return `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`;
}

function getEventDateLabel(event: EventHomeEvent) {
  const start = event.startDate ? new Date(event.startDate) : null;
  const end = event.endDate ? new Date(event.endDate) : null;

  if (!start || Number.isNaN(start.getTime())) return "Date TBA";
  if (!end || Number.isNaN(end.getTime()))
    return heroDateFormatter.format(start);
  if (start.toDateString() === end.toDateString()) {
    return heroDateFormatter.format(start);
  }

  return `${heroDateFormatter.format(start)} - ${heroDateFormatter.format(end)}`;
}

function HeroMetaItem({ icon: Icon, value, secondary }: DetailRowProps) {
  return (
    <span className="inline-flex min-w-0 items-center gap-3 text-[14px] font-600 leading-none text-bt-blue-0">
      <Icon
        className="h-[17px] w-[17px] shrink-0 text-bt-blue-0"
        aria-hidden="true"
      />
      <span className="min-w-0">
        <span className="block truncate">{value}</span>
        {secondary && (
          <span className="mt-1 block truncate text-[11px] text-bt-blue-0">
            {secondary}
          </span>
        )}
      </span>
    </span>
  );
}

export function EventHeroHeader({ event }: EventHeroHeaderProps) {
  const externalUrl = getExternalEventUrl(event);
  const subtitle = getEventSubtitle(event);
  const timeRange = getEventTimeRange(event);

  return (
    <section className="overflow-hidden rounded-lg border border-bt-blue-300 bg-bt-blue-600 shadow-[0_16px_40px_rgba(0,0,0,0.22)] lg:rounded-none lg:border-x-0 lg:border-t-0 lg:shadow-none">
      <div className="relative min-h-[260px] overflow-hidden bg-bt-blue-700 md:min-h-[294px]">
        {event.imageUrl ? (
          <div
            className="absolute inset-0 bg-bt-blue-700 bg-cover bg-center"
            aria-label={`${event.ename} cover`}
            role="img"
            style={{ backgroundImage: `url("${event.imageUrl}")` }}
          />
        ) : (
          <div className="absolute inset-0 bg-bt-blue-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,17,32,0)_0%,rgba(11,17,32,0.6)_42%,rgba(11,17,32,0.95)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,17,32,0.78)_0%,rgba(11,17,32,0.2)_42%,rgba(11,17,32,0)_100%)]" />

        <Link
          href="/events"
          className="absolute left-5 top-5 z-20 inline-flex items-center gap-1.5 text-[12px] font-700 text-bt-blue-0 transition hover:text-white md:left-8 md:top-6 md:text-sm"
        >
          <Undo2 className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
          Back to Events
        </Link>

        {externalUrl && (
          <Link
            href={externalUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${event.ename} event link`}
            className="absolute right-5 top-5 z-20 inline-flex h-9 w-9 items-center justify-center rounded-md border border-bt-blue-300 bg-bt-blue-500 text-white transition hover:bg-bt-blue-400 md:right-8 md:top-6"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}

        <div className="relative z-10 flex min-h-[260px] flex-col justify-end px-5 pb-7 pr-16 pt-20 md:min-h-[294px] md:justify-start md:px-10 md:pb-7 md:pr-20 md:pt-[114px]">
          <div className="max-w-[820px]">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#6043e3] px-3.5 py-1.5 text-[12px] font-800 uppercase tracking-[0] text-[#eaf6fe] md:text-[16px]">
              <UsersRound className="h-4 w-4 shrink-0" aria-hidden="true" />
              Event
            </span>
            <h1 className="mt-3 break-words text-[38px] font-800 leading-none tracking-[0] text-white md:text-[56px]">
              {event.ename}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm font-700 text-[#d7d7d7]">{subtitle}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
              <HeroMetaItem
                icon={CalendarDays}
                value={getEventDateLabel(event)}
                secondary={timeRange}
              />
              <HeroMetaItem
                icon={MapPin}
                value={event.elocation || "Location TBA"}
              />
              <HeroMetaItem
                icon={UsersRound}
                value={getEventAccessLabel(event)}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EventAboutCard({ event }: EventHeroHeaderProps) {
  const overview =
    stripHtml(event.description) ||
    "More event details will be available soon.";

  return (
    <section className="rounded-lg border border-[#263451] bg-[#0B152C] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.18)] md:p-5 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
      <div className="flex items-center gap-2">
        <Info className="h-[17px] w-[17px] text-white" aria-hidden="true" />
        <h2 className="text-[24px] font-800 leading-none text-white">
          About Event
        </h2>
      </div>
      <div className="mt-3 md:max-h-[132px] md:overflow-y-auto md:pr-3 md:[scrollbar-color:#555_transparent] md:[scrollbar-width:thin] md:[&::-webkit-scrollbar-thumb]:rounded-full md:[&::-webkit-scrollbar-thumb]:bg-[#555] md:[&::-webkit-scrollbar-track]:bg-transparent md:[&::-webkit-scrollbar]:w-1.5 lg:max-h-[132px]">
        <p className="whitespace-pre-line text-[16px] font-500 leading-normal text-bt-blue-0">
          {overview}
        </p>
      </div>
    </section>
  );
}
