import { useState } from "react";
import { Disc3 } from "lucide-react";
import { fetchBackend } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { getWheelEntries, WheelEntry, WheelSubmission } from "./entries";
import PrizeWheel from "./PrizeWheel";

export default function PrizeWheelButton({
  eventId,
  year,
  eventName,
}: {
  eventId: string;
  year: string;
  eventName: string;
}) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<WheelEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unnamed, setUnnamed] = useState(0);
  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchBackend({
        endpoint: `/events/${encodeURIComponent(eventId)}/${encodeURIComponent(year)}/feedback/attendee/submissions`,
        method: "GET",
      });
      if (!Array.isArray(result.submissions))
        throw new Error("Invalid response");
      const submissions: WheelSubmission[] = result.submissions;
      setEntries(getWheelEntries(submissions));
      setUnnamed(submissions.filter((s) => !s.respondentName?.trim()).length);
    } catch {
      setError("Couldn’t load attendee feedback. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <Button
        type="button"
        onClick={() => {
          setOpen(true);
          void refresh();
        }}
        variant="green"
        className="gap-2"
      >
        <Disc3 className="h-4 w-4" /> Spin the wheel
      </Button>
      <PrizeWheel
        key={`${eventId}/${year}`}
        open={open}
        onOpenChange={setOpen}
        entries={entries}
        eventName={eventName}
        loading={loading}
        error={error}
        unnamed={unnamed}
        onRefresh={refresh}
      />
    </>
  );
}
