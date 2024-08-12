import { BasicInformation } from "@/types";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { fetchRegistrationData } from "@/lib/dbUtils";
import PercentageBars from "@/components/stats/PercentageBars";
import ChartBox from "@/components/stats/ChartBox";

type Props = {
  initialData: BasicInformation[] | null;
};

export default function Statistics({ initialData }: Props) {
  const router = useRouter();

  return (
    <main className="bg-primary-color min-h-screen">
      <div className="container mx-auto p-10 flex flex-col">
        <span>
          <h2 className="text-white">Event Statistics</h2>
          <p className="text-baby-blue font-poppins">
            Statistics {">"} {router.query.eventId} {router.query.year}
          </p>
          <br />
          <ChartBox height="200px">
            <PercentageBars />
          </ChartBox>
          <div className="flex gap-4">
            <ChartBox width="33%" height="300px"></ChartBox>
            <ChartBox width="66%" height="300px"></ChartBox>
          </div>
        </span>
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { eventId, year } = context.params as { eventId: string; year: string };

  try {
    const data = await fetchRegistrationData(eventId, year);
    return { props: { initialData: data } };
  } catch (error) {
    console.error("Failed to fetch initial data:", error);
    return { props: { initialData: null } };
  }
};
