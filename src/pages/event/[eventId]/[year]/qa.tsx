import { useRouter } from "next/router";
import { useEffect } from "react";
import { useEvent } from "@/queries/events";
import { QaPage } from "@/features/events/qa/QaPage";
import { isEventModuleEnabled } from "@/lib/eventPageConfig";

const getParam = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v;

export default function EventQaPage() {
  const router = useRouter();
  const eventId = getParam(router.query.eventId);
  const year = getParam(router.query.year);

  const { data: event } = useEvent(eventId, year);
  const qaDisabled = !!event && !isEventModuleEnabled(event.eventPage, "qa");

  useEffect(() => {
    if (!router.isReady || !eventId || !year || !qaDisabled) return;

    router.replace(`/event/${eventId}/${year}`);
  }, [router, eventId, year, qaDisabled]);

  if (!router.isReady || !eventId || !year || qaDisabled) return null;

  return <QaPage eventId={eventId} year={year} eventName={event?.ename} />;
}
