import { Attendee } from "@/components/RegistrationTable/columns";
import { BasicInformation } from "@/types";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

type Props = {
    initialData: BasicInformation[] | null
}

export default function Statistics() {
    const router = useRouter()

    return (
        <main className="bg-primary-color min-h-screen">
          <div className="container mx-auto p-10 flex flex-col">
                <span>
                    <h2 className="text-white">Event Statistics</h2>
                    <p className="text-baby-blue font-poppins">Statistics {">"} {router.query.eventId} {router.query.year}</p>
                    {/* 
                    insert charts here
                    */}
                </span>
            </div>
        </main>
    );
}



export const getServerSideProps: GetServerSideProps = async (context) => {
    const { eventId, year } = context.params as { eventId: string, year: string };

    try {
        const data = await fetchRegistationData(eventId, year);
        return { props: { initialData: data } };
    } catch (error) {
        console.error("Failed to fetch initial data:", error);
        return { props: { initialData: null } };
    }
}

async function fetchRegistationData(eventId: string, year: string) {
    // TODO - fetch data registration data from backend. This is just returning a Mock, likely won't be the final data struct format

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
            shouldNotDisplay: "THIS SHOULD NOT BE DISPLAYING."
        })
    }

    return data
}
