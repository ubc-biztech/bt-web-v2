import { useRouter } from "next/router";
import Events from "@/constants/companion-events";
import { useMemo } from "react";
import BluePrintProfile2026 from "@/components/companion/blueprint2026/pages/BluePrintProfile2026";

export default function ProfilePage() {
  const router = useRouter();
  const { eventId, year, profileId } = router.query;

  const event = useMemo(() => {
    if (!eventId || !year) return null;
    return Events.find((e) => e.eventID === eventId && e.year === Number(year));
  }, [eventId, year]);

  // For now, only Blueprint 2026 has a custom profile page
  // Other events can be added here with their own profile components
  if (event?.eventID === "blueprint" && event?.year === 2026) {
    return (
      <BluePrintProfile2026
        event={event}
        params={{ profileId: profileId as string }}
        profileId={profileId as string}
        eventId={eventId as string}
        year={year as string}
      />
    );
  }

  // Fallback - redirect to companion home if no profile page for this event
  if (router.isReady && eventId && year) {
    router.replace(`/events/${eventId}/${year}/companion`);
  }

  return null;
}
