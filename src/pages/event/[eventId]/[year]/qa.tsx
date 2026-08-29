import { useRouter } from "next/router";
import { useEvent } from "@/queries/events";
import { useUserAttributes } from "@/queries/user";
import { QaPage } from "@/features/events/qa/QaPage";

const getParam = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v;

export default function EventQaPage() {
  const router = useRouter();
  const eventId = getParam(router.query.eventId);
  const year = getParam(router.query.year);

  const { data: event } = useEvent(eventId, year);
  const { data: userAttributes } = useUserAttributes();
  const isAdmin = userAttributes?.isAdmin ?? false;
  const signedIn = !!userAttributes;

  if (!router.isReady || !eventId || !year) return null;

  return (
    <QaPage
      eventId={eventId}
      year={year}
      eventName={event?.ename}
      isAdmin={isAdmin}
      signedIn={signedIn}
    />
  );
}
