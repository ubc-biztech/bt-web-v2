import { useRouter } from "next/router";
import { Attendee } from "@/components/RegistrationTable/columns";
import { DataTable } from "@/components/RegistrationTable/data-table";
import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { GetServerSideProps } from "next";

// Dynamic columns
const dynamicColumns: ColumnDef<Attendee>[] = [
  {
    accessorKey: "dynamicField1",
    header: "Dynamic Field 1",
  },
  {
    accessorKey: "dynamicField2",
    header: "Dynamic Field 2",
  },
  // Fetch dynamic columns from events DB - backend to do.
];

type Props = {
  initialData: Attendee[] | null;
};

export default function AdminEvent({ initialData }: Props) {
  const router = useRouter();
  const [isLoading, setLoading] = useState(!initialData);
  const [data, setData] = useState<Attendee[] | null>(initialData);

  useEffect(() => {
    if (!initialData && router.isReady) {
      const eventId = router.query.eventId as string;
      const year = router.query.year as string;

      if (eventId && year) {
        fetchRegistationData(eventId, year).then((d) => {
          setData(d);
          setLoading(false);
        });
      }
    }
  }, [router.isReady, router.query.eventId, router.query.year, initialData]);

  if (!router.isReady) return null;

  return (
    <main className="bg-primary-color min-h-screen">
      <div className="container mx-auto p-10 flex flex-col">
        <span>
          <h2 className="text-white">Event Overview</h2>
          <p className="text-baby-blue font-poppins">
            Manage Events {">"} {router.query.eventId} {router.query.year}
          </p>
        </span>
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
          />
        )}
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { eventId, year } = context.params as { eventId: string; year: string };

  try {
    const data = await fetchRegistationData(eventId, year);
    return { props: { initialData: data } };
  } catch (error) {
    console.error("Failed to fetch initial data:", error);
    return { props: { initialData: null } };
  }
};

async function fetchRegistationData(eventId: string, year: string) {
  // TODO - fetch data from backend. This is just returning a Mock, likely won't be the final data struct format

  let data = [];
  for (let i = 0; i < 200; i++) {
    data.push({
      id: i.toString(),
      regStatus: "Checked-In",
      appStatus: "Accepted",
      firstName: "John",
      lastName: "Smith",
      email: "testing@ubcbiztech.com",
      points: 0,
      studentNumber: "12345678",
      faculty: "Comm...",
      dynamicField1: "aa...",
      shouldNotDisplay: "THIS SHOULD NOT BE DISPLAYING.",
    });
  }

  return data;
}
