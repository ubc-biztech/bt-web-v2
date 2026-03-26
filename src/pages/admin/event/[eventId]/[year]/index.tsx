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
import TeamsTab from "@/components/EventsDashboard/TeamsTab";
import AnalyticsTab from "@/components/EventsDashboard/AnalyticsTab";

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
        console.log(data);
        console.log("temp");
      }
    }
  }, [router.isReady, router.query.eventId, router.query.year]);

  if (!router.isReady) return null;

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
            <div className="flex flex-row gap-4 md:gap-6 text-bt-green-300 text-sm md:text-base">
              <Link
                href={`/admin/event/${router.query.eventId}/${router.query.year}/edit`}
                className="flex flex-row gap-1.5 md:gap-2 items-center hover:underline"
              >
                <Pencil className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Edit Event
              </Link>
              <div className="text-bt-blue-300">|</div>
              <Link
                href={`/event/${router.query.eventId}/${router.query.year}/edit`}
                className="flex flex-row gap-1.5 md:gap-2 items-center hover:underline"
              >
                <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                View Public Page
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-6 w-full">
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
