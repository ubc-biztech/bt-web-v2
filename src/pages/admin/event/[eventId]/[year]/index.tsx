import { useRouter } from "next/router";
import { DataTable } from "@/components/RegistrationTable/data-table";
import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { GetServerSideProps } from "next";
import { fetchBackend } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { SortableHeader } from "@/components/RegistrationTable/SortableHeader";
import { Registration } from "@/types/types";
import { BiztechEvent, RegistrationQuestion } from "@/types";
import Link from "next/link";
import { ChartLine, Edit, Eye, Pencil, Table2, UsersRound } from "lucide-react";
import Tabs from "@/components/EventsDashboard/Tabs";
import DynamicTabs from "@/components/EventsDashboard/Tabs";

type Props = {
  initialData: Registration[] | null;
  eventData: any | null;
};

export default function AdminEvent({ initialData, eventData }: Props) {
  const router = useRouter();
  const [isLoading, setLoading] = useState(!initialData);
  const [data, setData] = useState<Registration[] | null>(initialData);
  const [dynamicColumns, setDynamicColumns] = useState<
    ColumnDef<Registration>[]
  >([]);

  useEffect(() => {
    if (router.isReady) {
      const eventId = router.query.eventId as string;
      const year = router.query.year as string;

      if (eventId && year) {
        fetchBackend({
          endpoint: `/events/${eventId}/${year}`,
          method: "GET",
          authenticatedCall: false,
        }).then((eventDetails: BiztechEvent) => {
          const questionColumns =
            eventDetails.registrationQuestions?.map(
              (q: RegistrationQuestion) => ({
                id: q.label,
                header: q.label,
                accessorFn: (row: any) => {
                  return (
                    row.dynamicResponses?.[q.questionId] ??
                    row.dynamicResponses?.[
                      (
                        eventDetails?.registrationQuestionsAlternate as RegistrationQuestion[]
                      )?.find(
                        (altQ: RegistrationQuestion) => altQ.label === q.label,
                      )?.questionId ?? ""
                    ] ??
                    ""
                  );
                },
              }),
            ) || [];
          setDynamicColumns(questionColumns);
        });
      }
    }
  }, [router.isReady, router.query.eventId, router.query.year]);

  if (!router.isReady) return null;

  const tabs = [
    {
      label: (
        <div className="flex flex-row items-center gap-2 ">
          <Table2 className="w-4 h-4" /> View Data Table
        </div>
      ),
      value: "dataTable",
    },
    {
      label: (
        <div className="flex flex-row items-center gap-2 ">
          <UsersRound className="w-4 h-4" /> View Teams
        </div>
      ),
      value: "teams",
    },
    {
      label: (
        <div className="flex flex-row items-center gap-2 ">
          <ChartLine className="w-4 h-4" /> View Analytics
        </div>
      ),
      value: "analytics",
    },
  ];

  const panels = [
    {
      value: "dataTable",
      content: isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-white">Loading...</p>
        </div>
      ) : !data ? (
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
    { value: "teams", content: <div>Teams Content</div> },
    { value: "analytics", content: <div>Analytics Content</div> },
  ];

  return (
    <main className="min-h-screen">
      <div className="flex mt-8 flex-col">
        <div className="flex flex-col justify-start">
          <h2 className="text-white capitalize mb-2">
            Event Data - {router.query.eventId} {router.query.year}
          </h2>
          <div className="flex flex-col md:flex-row w-full items-start md:items-center md:justify-between gap-4">
            <p className="text-bt-blue-0">
              View and edit attendee registration data.
            </p>
            <div className="flex flex-row gap-6 text-bt-green-300">
              <Link
                href={`/admin/event/${router.query.eventId}/${router.query.year}/edit`}
                className="flex flex-row gap-2 items-center hover:underline"
              >
                <Pencil className="w-4 h-4" />
                Edit Event Details
              </Link>
              <div className="md:block hidden">|</div>
              <Link
                href={`/event/${router.query.eventId}/${router.query.year}/edit`}
                className="flex flex-row gap-2 items-center hover:underline"
              >
                <Eye className="w-4 h-4" />
                View Public Page
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 w-full">
          <DynamicTabs tabs={tabs} panels={panels} />
        </div>
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { eventId, year } = context.params as { eventId: string; year: string };

  try {
    const [registrationData, eventData] = await Promise.all([
      fetchBackend({
        endpoint: `/registrations?eventID=${eventId}&year=${year}`,
        method: "GET",
        authenticatedCall: false,
      }),
      fetchBackend({
        endpoint: `/events/${eventId}/${year}`,
        method: "GET",
        authenticatedCall: false,
      }),
    ]);

    if (!eventData.registrationQuestions) {
      eventData.registrationQuestions = [];
    }
    if (!eventData.counts) {
      eventData.counts = {};
    }

    return {
      props: {
        initialData: registrationData.data,
        eventData: eventData,
      },
    };
  } catch (error) {
    console.error("Failed to fetch initial data:", error);
    return { props: { initialData: null, eventData: null } };
  }
};
