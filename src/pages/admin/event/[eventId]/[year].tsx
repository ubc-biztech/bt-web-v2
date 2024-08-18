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

    let data = []
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
            dynamicResponses: 
                {
                    "ee2b5b93-3792-4332-ba83-24b995f12094": "asdf",
                    "04f58eea-1861-4da3-8e4c-8d8e994ce8ba": "asdf",
                    "bede9713-17cf-4bb9-b362-8c30a1e5b543": "UBC",
                    "cb1a1e83-f581-473c-97e0-48e9a88d7d20": "I would not like to participate",
                    "ea4a8fa7-7bcf-4f86-af60-27ac61c7680b": "https://drive.google.com/file/d/1Q60JBkifak4gSrZL65KvafCPVA2HwcZ4/view?usp=drivesdk",
                    "013bb98c-4286-4649-bbb9-fbc27185925c": "asdf",
                    "24f0b385-d92e-43be-92a3-2b225964a778": "No",
                    "a04e1064-65b2-4873-bede-9c4d5cbd32c3": "No",
                    "49512eca-eec6-4639-b70c-f60f2e0a9371": "No",
                    "f33ba987-6a5f-4ea2-9ba9-ca5f087e6fef": "No",
                    "f83944a8-97e2-421c-903c-aac91106fe34": "I didn't submit a project"
                  },
        })
    }

  return data;
}
