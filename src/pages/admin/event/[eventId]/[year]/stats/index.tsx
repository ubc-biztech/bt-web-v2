import { AttendeeBasicInformation, DBRegistrationStatus } from "@/types";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { fetchRegistrationData } from "@/lib/dbUtils";
import ChartBox from "@/components/stats/ChartBox";
import StatsTable from "@/components/stats/StatsTable";
import BarChart from "@/components/stats/BarChart";
import PieChart from "@/components/stats/PieChart";
import PercentageBars from "@/components/stats/PercentageBars";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from "react";

type Props = {
  initialData: AttendeeBasicInformation[] | null;
};

const DIETARY_RESTRICTION_MAPPING: Record<string, string> = {
  none: "None",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  glutenFree: "Gluten-free",
  other: "Other",
};

const ACCEPTED_STATUSES = [
  DBRegistrationStatus.ACCEPTED,
  DBRegistrationStatus.ACCEPTED_COMPLETE,
  DBRegistrationStatus.ACCEPTED_PENDING,
  DBRegistrationStatus.REGISTERED,
  DBRegistrationStatus.CHECKED_IN,
];

const getFieldCounts = (
  data: AttendeeBasicInformation[],
  field: string,
  mapping?: Record<string, string>,
) => {
  const counts: Record<string, number> = {};

  for (const userData of data) {
    const value = getNestedValue(userData, field);

    if (value !== undefined && value !== null) {
      const label = mapping
        ? mapping[String(value)] || String(value)
        : String(value);
      counts[label] = counts[label] + 1 || 1;
    }
  }
  return Object.entries(counts)
    .sort()
    .map(([label, value]) => ({ label, value }));
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
  const [showAcceptedOnly, setShowAcceptedOnly] = useState(false);

  const filteredData = useMemo(() => {
    if (!initialData) return [];
    if (!showAcceptedOnly) return initialData;
    return initialData.filter((user: any) =>
      ACCEPTED_STATUSES.includes(user.registrationStatus),
    );
  }, [initialData, showAcceptedOnly]);

  const handleBack = () => {
    const currentPath = window.location.pathname;
    const parentPath = currentPath.split("/stats")[0];
    router.push(parentPath);
  };

  return (
    <main className="bg-bt-blue-600 min-h-screen">
      <div className="container mx-auto p-10 flex flex-col">
        <span>
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-white mb-4 hover:text-bt-blue-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-white">Event Statistics</h2>
              <p className="text-bt-blue-100">
                Statistics {">"} {router.query.eventId} {router.query.year}
              </p>
            </div>
            <div className="flex items-center space-x-2 mt-4 md:mt-0 bg-white/10 p-2 rounded-lg">
              <Checkbox
                id="accepted-only"
                checked={showAcceptedOnly}
                onCheckedChange={(checked) =>
                  setShowAcceptedOnly(checked as boolean)
                }
                className="border-white data-[state=checked]:bg-white data-[state=checked]:text-bt-blue-600"
              />
              <Label
                htmlFor="accepted-only"
                className="text-white cursor-pointer font-medium"
              >
                Show Accepted Only
              </Label>
            </div>
          </div>

          <ChartBox height="250px" title="Registration Status">
            {filteredData && (
              <PercentageBars
                data={getFieldCounts(filteredData, "registrationStatus")}
              />
            )}
          </ChartBox>
          <div className="flex gap-0 flex-col lg:flex-row lg:gap-4">
            <ChartBox width="33%" height="300px" title="Attendee Year Level">
              {filteredData && (
                <BarChart
                  data={getFieldCounts(filteredData, "basicInformation.year")}
                />
              )}
            </ChartBox>
            <ChartBox width="66%" height="300px" title="Heard Event From">
              {filteredData && (
                <PieChart
                  data={getFieldCounts(
                    filteredData,
                    "basicInformation.heardFrom",
                  )}
                />
              )}
            </ChartBox>
          </div>
          <div className="flex gap-0 flex-col lg:flex-row lg:gap-4">
            <ChartBox width="66%" height="300px" title="Faculty">
              {filteredData && (
                <PieChart
                  data={getFieldCounts(
                    filteredData,
                    "basicInformation.faculty",
                  )}
                />
              )}
            </ChartBox>
            <ChartBox width="33%" height="300px" title="Dietary Restrictions">
              {filteredData && (
                <StatsTable
                  data={getFieldCounts(
                    filteredData,
                    "basicInformation.diet",
                    DIETARY_RESTRICTION_MAPPING,
                  )}
                />
              )}
            </ChartBox>
          </div>
          <ChartBox width="66%" height="300px" title="Pronouns">
            {filteredData && (
              <PieChart
                data={getFieldCounts(filteredData, "basicInformation.gender")}
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
