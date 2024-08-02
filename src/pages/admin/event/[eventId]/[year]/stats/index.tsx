import { AttendeeBasicInformation } from "@/types";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { fetchRegistrationData } from "@/lib/dbUtils";

type Props = {
    initialData: AttendeeBasicInformation[] | null
}

export default function Statistics( { initialData }: Props) {
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
        const data = await fetchRegistrationData(eventId, year);
        return { props: { initialData: data } };
    } catch (error) {
        console.error("Failed to fetch initial data:", error);
        return { props: { initialData: null } };
    }
}