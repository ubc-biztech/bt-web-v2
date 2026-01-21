import Events from "@/constants/companion-events";
import { useRouter } from "next/router";
import { useMemo } from "react";

export default function CompanionSubpage() {
  const router = useRouter();
  const { eventId, year, page } = router.query;

  const event = useMemo(() => {
    if (!eventId || !year) return null;

    return Events.find((e) => e.eventID === eventId && e.year === Number(year));
  }, [eventId, year]);

  if (!event) return null;

  const PageComponent = event.pages?.[page as string];
  if (!PageComponent) return null;

  return <PageComponent event={event} />;
}
