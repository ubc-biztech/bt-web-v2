import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { fetchBackend } from "@/lib/db";
import { BiztechEvent } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquareText, Users, Building2 } from "lucide-react";

export default function EventFeedbackHubPage() {
  const router = useRouter();
  const { eventId, year } = router.query;

  const [event, setEvent] = useState<BiztechEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId || !year) return;

    const loadEvent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const eventData = await fetchBackend({
          endpoint: `/events/${eventId}/${year}`,
          method: "GET",
          authenticatedCall: false,
        });
        setEvent(eventData);
      } catch (err: any) {
        setError(
          err?.message?.message || err?.message || "Failed to load event.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [eventId, year]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-bt-blue-600 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-xl border border-white/15 bg-white/5 p-6 text-center text-white">
          Loading feedback forms...
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-screen bg-bt-blue-600 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-xl border border-bt-red-200/40 bg-bt-red-200/10 p-6 text-center text-bt-red-100">
          {error || "Event not found."}
        </div>
      </main>
    );
  }

  const attendeeEnabled =
    Boolean(event.attendeeFeedbackEnabled) &&
    Array.isArray(event.attendeeFeedbackQuestions) &&
    event.attendeeFeedbackQuestions.length > 0;

  const partnerEnabled =
    Boolean(event.partnerFeedbackEnabled) &&
    Array.isArray(event.partnerFeedbackQuestions) &&
    event.partnerFeedbackQuestions.length > 0;

  return (
    <main className="min-h-screen bg-bt-blue-600 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-5xl space-y-5 sm:space-y-6">
        <Card className="overflow-hidden border-white/15 bg-bt-blue-500/40">
          <div className="relative aspect-[16/10] w-full bg-bt-blue-500/40 sm:aspect-[16/7]">
            {event.imageUrl ? (
              <Image
                src={event.imageUrl}
                alt={`${event.ename} cover image`}
                fill
                className="object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-bt-blue-700/95 via-bt-blue-700/55 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
              <p className="text-xs uppercase tracking-[0.12em] text-bt-blue-100">
                Event feedback
              </p>
              <h2 className="text-xl font-semibold text-white sm:text-3xl">
                {event.ename}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-bt-blue-100">
                Choose the feedback form that best matches your event role.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Card className="border-white/15 bg-white/[0.05]">
            <CardContent className="space-y-4 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-bt-green-300" />
                <h3 className="text-lg font-semibold text-white">
                  Attendee Feedback
                </h3>
              </div>
              <p className="text-sm text-bt-blue-100">
                Share your experience as a participant and help improve future
                events.
              </p>
              {attendeeEnabled ? (
                <Button
                  asChild
                  className="w-full bg-bt-green-300 text-bt-blue-600 hover:bg-bt-green-500"
                >
                  <Link
                    href={`/event/${event.id}/${event.year}/feedback/attendee`}
                  >
                    <MessageSquareText className="mr-2 h-4 w-4" /> Open attendee
                    form
                  </Link>
                </Button>
              ) : (
                <Button disabled className="w-full">
                  Attendee feedback is not available
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/15 bg-white/[0.05]">
            <CardContent className="space-y-4 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-bt-green-300" />
                <h3 className="text-lg font-semibold text-white">
                  Partner Feedback
                </h3>
              </div>
              <p className="text-sm text-bt-blue-100">
                Tell the team what worked for your organization and what could
                be better.
              </p>
              {partnerEnabled ? (
                <Button
                  asChild
                  className="w-full bg-bt-green-300 text-bt-blue-600 hover:bg-bt-green-500"
                >
                  <Link
                    href={`/event/${event.id}/${event.year}/feedback/partner`}
                  >
                    <MessageSquareText className="mr-2 h-4 w-4" /> Open partner
                    form
                  </Link>
                </Button>
              ) : (
                <Button disabled className="w-full">
                  Partner feedback is not available
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
