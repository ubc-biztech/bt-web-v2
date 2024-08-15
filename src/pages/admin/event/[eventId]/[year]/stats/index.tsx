import { UserEventData } from "@/types";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { fetchRegistrationData } from "@/lib/dbUtils";
import PercentageBars from "@/components/stats/PercentageBars";
import ChartBox from "@/components/stats/ChartBox";
import BarChart from "@/components/stats/BarChart";
import PieChart from "@/components/stats/PieChart";
import StatsTable from "@/components/stats/StatsTable";

type Props = {
  initialData: UserEventData[] | null;
};

const getFieldCounts = (data: UserEventData[], field: string) => {
  const counts: Record<string, number> = {};

  for (const userData of data) {
    const value = getNestedValue(userData, field);

    if (value !== undefined && value !== null) {
      counts[String(value)] = (counts[String(value)] + 1 || 1);
    }
  }
  return Object.entries(counts).sort().map(([label, value]) => ({ label, value }));
};

const getNestedValue = (userData: Record<string, any>, field: string) => {
    const keys = field.split(".");
    for (const key of keys) {
      userData = userData?.[key];
    }
    return userData;
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
          <ChartBox height="250px" title="Registration Status">
            {initialData && (
              <PercentageBars
                data={getFieldCounts(initialData, "registrationStatus")}
              />
            )}
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
