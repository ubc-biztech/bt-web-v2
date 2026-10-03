import { useRouter } from "next/router";
import { DataTable } from "@/components/RegistrationTable/data-table";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ColumnDef } from "@tanstack/react-table";
import { GetServerSideProps } from "next";
import { fetchBackend } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Registration } from "@/types/types";
import { RegistrationQuestion } from "@/types";
import Link from "next/link";
import {
  ChartLine,
  Eye,
  MessageSquareText,
  Pencil,
  Table2,
  UsersRound,
} from "lucide-react";
import DynamicTabs from "@/components/EventsDashboard/Tabs";
const TeamsTab = dynamic(
  () => import("@/components/EventsDashboard/TeamsTab"),
  {
    loading: () => (
      <p role="status" className="text-white p-4">
        Loading tab...
      </p>
    ),
  },
);
const AnalyticsTab = dynamic(
  () => import("@/components/EventsDashboard/AnalyticsTab"),
  {
    loading: () => (
      <p role="status" className="text-white p-4">
        Loading tab...
      </p>
    ),
  },
);
const FeedbackTab = dynamic(
  () => import("@/components/EventsDashboard/FeedbackTab"),
  {
    loading: () => (
      <p role="status" className="text-white p-4">
        Loading tab...
      </p>
    ),
  },
);
import EventOverviewGraphic from "@/components/EventsDashboard/EventOverviewGraphic";

export default function AdminEvent() {
  const router = useRouter();
  const { eventId, year } = router.query;
  if (
    !router.isReady ||
    typeof eventId !== "string" ||
    typeof year !== "string"
  ) {
    return null;
  }

  // Next reuses this page between events; remount to clear the previous event's data.
  return (
    <AdminEventContent
      key={`${eventId}/${year}`}
      eventId={eventId}
      year={year}
    />
  );
}

function AdminEventContent({
  eventId,
  year,
}: {
  eventId: string;
  year: string;
}) {
  const router = useRouter();
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState<Registration[] | null>(null);
  const [eventData, setEventData] = useState<any | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    Promise.all([
      fetchBackend({
        endpoint: `/registrations?eventID=${encodeURIComponent(eventId)}&year=${encodeURIComponent(year)}`,
        method: "GET",
        authenticatedCall: true,
      }),
      fetchBackend({
        endpoint: `/events/${encodeURIComponent(eventId)}/${encodeURIComponent(year)}`,
        method: "GET",
        authenticatedCall: false,
      }),
    ])
      .then(([registrations, event]) => {
        if (!event || !Array.isArray(registrations?.data)) {
          throw new Error("Invalid event data response");
        }
        if (cancelled) return;
        setData(registrations.data);
        setEventData({
          ...event,
          registrationQuestions: event.registrationQuestions || [],
          counts: event.counts || {},
        });
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId, year, attempt]);

  const dynamicColumns = useMemo<ColumnDef<Registration>[]>(
    () =>
      eventData?.registrationQuestions?.map((q: RegistrationQuestion) => ({
        id: q.label,
        header: q.label,
        accessorFn: (row: Registration) =>
          row.dynamicResponses?.[q.questionId] ??
          row.dynamicResponses?.[
            (
              eventData.registrationQuestionsAlternate as
                | RegistrationQuestion[]
                | undefined
            )?.find((altQ) => altQ.label === q.label)?.questionId ?? ""
          ] ??
          "",
      })) || [],
    [eventData],
  );

  const tabs = [
    {
      label: (
        <div className="flex flex-row items-center gap-1.5 md:gap-2">
          <Table2 className="w-4 h-4" />
          <span className="hidden xs:inline">Data Table</span>
          <span className="xs:hidden">Data</span>
        </div>
      ),
      value: "dataTable",
    },
    {
      label: (
        <div className="flex flex-row items-center gap-1.5 md:gap-2">
          <UsersRound className="w-4 h-4" /> Teams
        </div>
      ),
      value: "teams",
    },
    {
      label: (
        <div className="flex flex-row items-center gap-1.5 md:gap-2">
          <ChartLine className="w-4 h-4" /> Analytics
        </div>
      ),
      value: "analytics",
    },
    {
      label: (
        <div className="flex flex-row items-center gap-1.5 md:gap-2">
          <MessageSquareText className="w-4 h-4" />
          <span className="hidden xs:inline">Feedback</span>
          <span className="xs:hidden">FB</span>
        </div>
      ),
      value: "feedback",
    },
  ];

  const panels = [
    {
      value: "dataTable",
      content: isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-white">Loading...</p>
        </div>
      ) : !data || !eventData ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-white">Event not found</p>
        </div>
      ) : (
        <DataTable
          initialData={data}
          dynamicColumns={dynamicColumns}
          eventId={router.query.eventId as string}
          year={router.query.year as string}
          eventData={eventData}
        />
      ),
    },
    {
      value: "teams",
      content: (
        <TeamsTab
          eventId={router.query.eventId as string}
          year={router.query.year as string}
          registrations={data || undefined}
        />
      ),
    },
    {
      value: "analytics",
      content: <AnalyticsTab registrations={data} eventData={eventData} />,
    },
    {
      value: "feedback",
      content: eventData ? (
        <FeedbackTab
          eventId={router.query.eventId as string}
          year={router.query.year as string}
          eventData={eventData}
        />
      ) : (
        <div className="text-bt-blue-100 p-4">Loading event data...</div>
      ),
    },
  ];

  return (
    <main className="min-h-screen -mx-8 -mt-8 md:-mx-0 md:-mt-0">
      <div className="flex flex-col px-4 pt-4 md:px-0 md:pt-0 md:mt-8">
        <div className="flex flex-col justify-start">
          <h2 className="text-white capitalize mb-1 text-lg md:text-2xl">
            Event Data - {router.query.eventId} {router.query.year}
          </h2>
          <div className="flex flex-col md:flex-row w-full items-start md:items-center md:justify-between gap-3 md:gap-4">
            <p className="text-bt-blue-0 text-sm md:text-base">
              View and edit attendee registration data.
            </p>
            <div className="flex flex-row items-center gap-4 md:gap-6 text-bt-green-300 text-sm md:text-base">
              <Link
                href={`/admin/event/${router.query.eventId}/${router.query.year}/edit`}
                className="flex flex-row gap-1.5 md:gap-2 items-center hover:underline"
              >
                <Pencil className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Edit Event
              </Link>
              <div className="text-bt-blue-300">|</div>
              <Link
                href={`/event/${router.query.eventId}/${router.query.year}`}
                className="flex flex-row gap-1.5 md:gap-2 items-center hover:underline"
              >
                <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                View Public Page
              </Link>
              <div className="text-bt-blue-300">|</div>
              {eventData && (
                <EventOverviewGraphic
                  registrations={data}
                  eventData={eventData}
                />
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-6 w-full">
          {error ? (
            <div
              role="alert"
              className="flex flex-col items-center gap-4 py-16 text-white"
            >
              <p>Could not load event data. Please try again.</p>
              <Button onClick={() => setAttempt((value) => value + 1)}>
                Retry
              </Button>
            </div>
          ) : isLoading ? (
            <div
              role="status"
              className="flex justify-center items-center h-64 text-white"
            >
              Loading event data...
            </div>
          ) : (
            <DynamicTabs tabs={tabs} panels={panels} />
          )}
        </div>
      </div>
    </main>
  );
}

// Keep server-side routing so middleware still checks admin access on navigation.
// Data loads in the browser instead of blocking the route response.
export const getServerSideProps: GetServerSideProps = async () => ({
  props: {},
});
