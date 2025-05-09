import { useRouter } from "next/router";
import { DataTable } from "@/components/RegistrationTable/data-table";
import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { GetServerSideProps } from "next";
import { fetchBackend } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { SortableHeader } from "@/components/RegistrationTable/SortableHeader";
import { Attendee } from "@/components/RegistrationTable/columns";
import { BiztechEvent, RegistrationQuestion } from "@/types";

type Props = {
  initialData: Attendee[] | null;
  eventData: any | null;
};

export default function AdminEvent({ initialData, eventData }: Props) {
  const router = useRouter();
  const [isLoading, setLoading] = useState(!initialData);
  const [data, setData] = useState<Attendee[] | null>(initialData);
  const [dynamicColumns, setDynamicColumns] = useState<ColumnDef<Attendee>[]>([]);
  
  useEffect(() => {
    if (router.isReady) {
      const eventId = router.query.eventId as string;
      const year = router.query.year as string;
      
      if (eventId && year) {
        fetchBackend({
          endpoint: `/events/${eventId}/${year}`,
          method: "GET",
          authenticatedCall: false
        }).then((eventDetails: BiztechEvent) => {

          const questionColumns = eventDetails.registrationQuestions?.map((q: RegistrationQuestion) => ({
            id: q.label,
            header: q.label,
            accessorFn: (row: any) => {
              return row.dynamicResponses?.[q.questionId] || '';
            }
          })) || [];
          setDynamicColumns(questionColumns);
        });
      }
    }
  }, [router.isReady, router.query.eventId, router.query.year]);

  if (!router.isReady) return null;

  return (
    <main className="bg-primary-color min-h-screen">
      <div className="container mx-auto p-10 flex flex-col">
        <div className="flex justify-between items-center">
          <span>
            <h2 className="text-white">Event Overview</h2>
            <p className="text-baby-blue font-poppins">
              Manage Events {">"} {router.query.eventId} {router.query.year}
            </p>
          </span>
          <Button 
            onClick={() => router.push(`/admin/event/${router.query.eventId}/${router.query.year}/edit`)}
            className="bg-biztech-green"
          >
            Edit Event
          </Button>
        </div>
        
        {/*divider*/}
        <div className="w-full h-[2px] bg-login-form-card my-6" />

        {isLoading ? (
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
        )}
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
        authenticatedCall: false
      }),
      fetchBackend({
        endpoint: `/events/${eventId}/${year}`,
        method: "GET",
        authenticatedCall: false
      })
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
        eventData: eventData
      } 
    };
  } catch (error) {
    console.error("Failed to fetch initial data:", error);
    return { props: { initialData: null, eventData: null } };
  }
};
