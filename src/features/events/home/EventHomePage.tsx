import { useEvent, useEventCounts } from "@/queries/events";
import { useUserRegistrations } from "@/queries/registrations";
import { useUserAttributes } from "@/queries/user";
import { normalizeEventPageConfig } from "@/lib/eventPageConfig";
import { useRouter } from "next/router";
import { EventAboutCard, EventHeroHeader } from "./EventHeroHeader";
import { EventModuleRenderer } from "./EventModuleRenderer";
import type { EventHomeEvent, EventRegistrationRecord } from "./types";

const getRouteParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

function EventHomeSkeleton() {
  return (
    <div className="space-y-5 px-4 py-5 md:px-6 md:py-7 lg:px-7 lg:py-6">
      <div className="h-[280px] animate-pulse rounded-lg border border-[#242424] bg-[#151515]" />
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-[260px] animate-pulse rounded-lg border border-[#242424] bg-[#151515]" />
      </div>
    </div>
  );
}

function EventHomeError() {
  return (
    <div className="m-4 rounded-lg border border-bt-red-300/30 bg-bt-red-300/10 p-6 md:m-6 lg:m-7">
      <h1 className="text-2xl font-800 text-white">Event unavailable</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
        We could not load this event right now. Check that the event URL is
        correct, or try again later.
      </p>
    </div>
  );
}

export default function EventHomePage() {
  const router = useRouter();
  const eventId = getRouteParam(router.query.eventId);
  const year = getRouteParam(router.query.year);

  const {
    data: event,
    isLoading: eventLoading,
    isError: eventError,
  } = useEvent(eventId, year);
  const { data: counts } = useEventCounts(eventId, year);
  const { data: userAttributes, isLoading: userLoading } = useUserAttributes();
  const email = userAttributes?.email;
  const { data: registrations, isLoading: registrationsLoading } =
    useUserRegistrations(email);

  const eventKey = event ? `${event.id};${event.year}` : "";
  const registration = registrations?.find(
    (item) => item["eventID;year"] === eventKey,
  ) as EventRegistrationRecord | undefined;

  const signedIn = !!email;
  const registrationLoading =
    userLoading || (signedIn ? registrationsLoading : false);
  const registrationHref =
    eventId && year
      ? `/event/${eventId}/${year}/register`
      : event
        ? `/event/${event.id}/${event.year}/register`
        : "/events";
  const eventHomeEvent = event ? (event as EventHomeEvent) : undefined;
  const configuredEvent = eventHomeEvent
    ? {
        ...eventHomeEvent,
        eventPage: normalizeEventPageConfig(eventHomeEvent.eventPage),
      }
    : undefined;
  const configuredModules = configuredEvent?.eventPage.modules ?? [];
  const registrationModules = configuredModules.filter(
    (module) => module.id === "registration",
  );
  const contentModules = configuredModules.filter(
    (module) => module.id !== "registration",
  );

  return (
    <main className="-mx-8 -mb-8 -mt-8 min-h-screen bg-bt-blue-600 text-white md:-m-12 lg:-m-16">
      <div className="flex w-full max-w-none flex-col">
        {!router.isReady || eventLoading ? (
          <EventHomeSkeleton />
        ) : eventError || !configuredEvent ? (
          <EventHomeError />
        ) : (
          <>
            <EventHeroHeader event={configuredEvent} />
            <div className="px-4 pb-7 pt-6 md:px-10 md:pb-10 md:pt-9 lg:px-11 lg:pb-11 lg:pt-11">
              <div className="mx-auto w-full max-w-[1075px]">
                <div className="grid gap-6 lg:grid-cols-[minmax(260px,315px)_minmax(0,736px)] lg:items-start">
                  <EventModuleRenderer
                    className="grid grid-cols-1 gap-4"
                    event={configuredEvent}
                    counts={counts}
                    modules={registrationModules}
                    registration={registration}
                    registrationLoading={registrationLoading}
                    registrationHref={registrationHref}
                    signedIn={signedIn}
                  />
                  <EventAboutCard event={configuredEvent} />
                </div>

                <EventModuleRenderer
                  className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,527px)_minmax(0,1fr)]"
                  event={configuredEvent}
                  counts={counts}
                  modules={contentModules}
                  registration={registration}
                  registrationLoading={registrationLoading}
                  registrationHref={registrationHref}
                  signedIn={signedIn}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
