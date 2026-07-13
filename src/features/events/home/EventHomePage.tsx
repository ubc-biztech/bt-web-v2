import { useEvent, useEventCounts } from "@/queries/events";
import { useUserRegistrations } from "@/queries/registrations";
import { useUserAttributes } from "@/queries/user";
import { useRouter } from "next/router";
import { EventHeroHeader } from "./EventHeroHeader";
import { RegistrationStatusModule } from "./RegistrationStatusModule";
import type { EventHomeEvent, EventRegistrationRecord } from "./types";

const getRouteParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

function EventHomeSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-[280px] animate-pulse rounded-lg border border-[#242424] bg-[#151515]" />
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-[260px] animate-pulse rounded-lg border border-[#242424] bg-[#151515]" />
      </div>
    </div>
  );
}

function EventHomeError() {
  return (
    <div className="rounded-lg border border-bt-red-300/30 bg-bt-red-300/10 p-6">
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

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-transparent text-white">
      <div className="mx-auto flex w-full max-w-[1260px] flex-col">
        {!router.isReady || eventLoading ? (
          <EventHomeSkeleton />
        ) : eventError || !event ? (
          <EventHomeError />
        ) : (
          <>
            <div>
              <EventHeroHeader event={event as EventHomeEvent} />
            </div>
            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <RegistrationStatusModule
                event={event as EventHomeEvent}
                counts={counts}
                registration={registration}
                registrationLoading={registrationLoading}
                registrationHref={registrationHref}
                signedIn={signedIn}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
