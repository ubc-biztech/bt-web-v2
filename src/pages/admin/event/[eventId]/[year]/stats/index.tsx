import { BasicInformation } from "@/types";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { fetchRegistrationData } from "@/lib/dbUtils";
import PercentageBars from "@/components/stats/PercentageBars";
import ChartBox from "@/components/stats/ChartBox";
import BarChart from "@/components/stats/BarChart";
import PieChart from "@/components/stats/PieChart";
import StatsTable from "@/components/stats/StatsTable";

type Props = {
  initialData: BasicInformation[] | null;
};

const getFieldCounts = (data: BasicInformation[], field: string) => {
  const counts: Record<string, number> = {};
  data.forEach((item) => {
    const keys = field.split(".");
    let value: any = item;
    keys.forEach((key) => {
      value = value ? value[key] : undefined;
    });

    if (value !== undefined) {
      counts[value] = (counts[value] || 0) + 1;
    }
  });
  return Object.entries(counts).map(([label, value]) => ({
    label,
    value,
  }));
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
          <ChartBox height="200px" title="Registration Status">
            <PercentageBars data={getFieldCounts(initialData, "registrationStatus")}/>
          </ChartBox>
          <div className="flex gap-0 flex-col lg:flex-row lg:gap-4">
            <ChartBox width="33%" height="300px" title="Attendee Year Level">
              {initialData && (
                <BarChart
                  data={getFieldCounts(initialData, "basicInfo.year")}
                />
              )}
            </ChartBox>
            <ChartBox width="66%" height="300px" title="Heard Event From">
              {initialData && (
                <PieChart
                  data={getFieldCounts(initialData, "basicInfo.heardFrom")}
                />
              )}
            </ChartBox>
          </div>
          <div className="flex gap-0 flex-col lg:flex-row lg:gap-4">
            <ChartBox width="66%" height="300px" title="Faculty">
              {initialData && (
                <PieChart
                  data={getFieldCounts(initialData, "basicInfo.faculty")}
                />
              )}
            </ChartBox>
            <ChartBox width="33%" height="300px" title="Dietary Restrictions">
              {initialData && (
                <StatsTable
                  data={getFieldCounts(initialData, "basicInfo.diet")}
                />
              )}
            </ChartBox>
          </div>
          <ChartBox width="66%" height="300px" title="Pronouns">
              {initialData && (
                <PieChart
                  data={getFieldCounts(initialData, "basicInfo.gender")}
                />
              )}
            </ChartBox>
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
