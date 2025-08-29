import BarChart from "@/components/Stats/BarChart";
import ChartBox from "@/components/Stats/ChartBox";
import PieChart from "@/components/Stats/PieChart";
import { fetchBackendFromServer } from "@/lib/db";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { Member, User } from "@/types";

type Props = {
  membersData: Member[] | null;
};

const getFieldCounts = (
  data: (Member | User)[],
  field: string,
  parser?: (arg: any) => any,
) => {
  const counts: Record<string, number> = {};

  for (const userData of data) {
    let value = getNestedValue(userData, field);
    if (parser) {
      value = parser(value);
    }

    if (value == undefined || value == null) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        counts[String(item)] = counts[String(item)] + 1 || 1;
      }
    } else {
      counts[String(value)] = counts[String(value)] + 1 || 1;
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

export default function MembershipsPage({ membersData }: Props) {
  return (
    <main className="bg-primary-color min-h-screen w-full">
      <div className="w-full">
        <div className="mx-auto pt-8 pb-8 md:px-20 px-5 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <span>
            <h2 className="text-white text-xl lg:text-[40px]">
              Membership Statistics
            </h2>
            <div className="flex items-center justify-between h-[40px]">
              <p className="text-baby-blue font-poppins">
                View and manage membership statistics
              </p>
            </div>
          </span>
          <div className="bg-navbar-tab-hover-bg h-[1px] my-4 flex gap-0 flex-col lg:flex-row lg:gap-4" />
          {/* Type of Member - Field doesn't exist in either type */}
          <div className="xl:col-span-2">
            <ChartBox height="300px" title="Type of Member">
              {membersData && (
                <BarChart data={getFieldCounts(membersData, "education")} />
              )}
            </ChartBox>
          </div>

          <ChartBox height="300px" title="Academic Year Level">
            {membersData && (
              <BarChart data={getFieldCounts(membersData, "year")} />
            )}
          </ChartBox>

          <ChartBox height="300px" title="Faculty">
            {membersData && (
              <PieChart data={getFieldCounts(membersData, "faculty")} />
            )}
          </ChartBox>

          <div className="xl:col-span-2">
            <ChartBox height="300px" width="600 px" title="Major">
              {membersData && (
                <BarChart data={getFieldCounts(membersData, "major")} />
              )}
            </ChartBox>
          </div>

          <ChartBox height="300px" title="Preferred Pronouns">
            {membersData && (
              <PieChart data={getFieldCounts(membersData, "pronouns")} />
            )}
          </ChartBox>

          <ChartBox height="300px" title="Any Dietary Restrictions?">
            {membersData && (
              <PieChart data={getFieldCounts(membersData, "diet")} />
            )}
          </ChartBox>

          <ChartBox height="300px" title="Are you an International Student?">
            {membersData && (
              <PieChart data={getFieldCounts(membersData, "international")} />
            )}
          </ChartBox>

          <ChartBox height="300px" title="Were you a BizTech member last year">
            {membersData && (
              <PieChart data={getFieldCounts(membersData, "prevMember")} />
            )}
          </ChartBox>

          <div className="xl:col-span-2">
            <ChartBox
              height="300px"
              title="What topics did you want to see the most discussed in the future?"
            >
              {membersData && (
                <BarChart
                  data={getFieldCounts(membersData, "topics", (t: string) => {
                    if (typeof t === "string") {
                      return t.split(",");
                    }
                    return [];
                  })}
                />
              )}
            </ChartBox>
          </div>

          <div className="xl:col-span-2">
            <ChartBox height="300px" title="How did you hear about us?">
              {membersData && (
                <BarChart data={getFieldCounts(membersData, "heardFrom")} />
              )}
            </ChartBox>
          </div>
        </div>
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const membersData = await fetchBackendFromServer({
      endpoint: `/members`,
      method: "GET",
      nextServerContext: {
        request: context.req,
        response: context.res,
      },
    });

    return {
      props: { membersData },
    };
  } catch (error) {
    console.error("Failed to fetch membership data:", error);
    return { props: { membersData: null } };
  }
};
