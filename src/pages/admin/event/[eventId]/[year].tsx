import { useRouter } from "next/router";
import { Attendee } from "@/components/RegistrationTable/columns";
import { DataTable } from "@/components/RegistrationTable/data-table";
import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { GetServerSideProps } from "next";
import { fetchBackend } from "@/lib/db";

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

  let data: Attendee[] = [];

  // FOR TESTING
  // console.log(`/registrations?eventID=${eventId}&year=${year}`)
  // this may return {size, data} not just the data
  //const queryParams = new URLSearchParams({ eventID: "hello-hacks", year: String(2023) }).toString();

  let registrationData = await fetchBackend({
    endpoint: `/registrations?eventID=${eventId}&year=2024`,
    method: "GET",
    authenticatedCall: false
  });

  // ADDING EXTRA REGISTRANTS FOR TESTING 

  let testApps = [{
    'eventID;year': 'blueprint;2024',
    applicationStatus: 'accepted',
    dynamicResponses: {
      '0a34f9d2-12a5-4aed-abe5-d7d897f2fb5e': 'yes',
      'bede9713-17cf-4bb9-b362-8c30a1e5b543': 'UBC'
    },
    fname: 'Eliana',
    studentId: '54263975',
    points: 800,
    updatedAt: 1706341269746,
    scannedQRs: ["WEJdk-workshop1","oAcaI-inifnite","oAcaI-inifnite","oAcaI-inifnite","oAcaI-inifnite"],
    basicInformation: {
      fname: 'Eliana',
      lname: 'Barbosa',
      major: 'N/A',
      gender: ['She/Her/Hers'],
      year: '2nd Year',
      diet: 'None',
      heardFrom: 'Instagram',
      faculty: 'Commerce'
    },
    isPartner: false,
    id: 'eliana@ubcbiztech.com',
    registrationStatus: 'checkedIn'
  }];

  testApps = testApps.concat(registrationData.data);

  return testApps;
}