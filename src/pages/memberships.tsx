import BarChart from "@/components/Stats/BarChart";
import ChartBox from "@/components/Stats/ChartBox";
import PieChart from "@/components/Stats/PieChart";
import { fetchMembershipData } from "@/lib/dbUtils";
import { GetServerSideProps } from "next";
import { MembershipBasicInformation } from "@/types";

type Props = {
  initialData: MembershipBasicInformation[] | null;
};

const getFieldCounts = (data: MembershipBasicInformation[], field: string) => {
  const counts: Record<string, number> = {};

  for (const userData of data) {
    const value = getNestedValue(userData, field);

    if (value !== undefined && value !== null) {
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

export default function MembershipsPage({ initialData }: Props) {
  return (
    <main className='bg-primary-color min-h-screen w-full'>
      <div className='w-full'>
        <div className='mx-auto pt-8 pb-8 md:px-20 px-5 flex flex-col'>
          <span>
            <h2 className='text-white text-xl lg:text-[40px]'>Membership Statistics</h2>
            <div className='flex items-center justify-between h-[40px]'>
              <p className='text-baby-blue font-poppins'>View and manage membership statistics</p>
            </div>
          </span>
          <div className='bg-navbar-tab-hover-bg h-[1px] my-4 flex gap-0 flex-col lg:flex-row lg:gap-4'/>
          <ChartBox height='300px' title='Type of Member'>
            {initialData && <PieChart data={getFieldCounts(initialData, "basicInformation.memberType")} />}
          </ChartBox>
          <ChartBox height='300px' title='Academic Year Level'>
            {initialData && <BarChart data={getFieldCounts(initialData, "basicInformation.year")} />}
          </ChartBox>
          <ChartBox height='300px' title='Faculty'>
            {initialData && <PieChart data={getFieldCounts(initialData, "basicInformation.faculty")} />}
          </ChartBox>
          <ChartBox height='300px' title='Major'>
            {initialData && <BarChart data={getFieldCounts(initialData, "basicInformation.major")} />}
          </ChartBox>
          <ChartBox height='300px' title='Preferred Pronouns'>
            {initialData && <PieChart data={getFieldCounts(initialData, "basicInformation.pronouns")} />}
          </ChartBox>
          <ChartBox height='300px' title='Any Dietary Restrictions?'>
            {initialData && <PieChart data={getFieldCounts(initialData, "basicInformation.dietaryRestrictions")} />}
          </ChartBox>
          <ChartBox height='300px' title='Are you an International Student?'>
            {initialData && <PieChart data={getFieldCounts(initialData, "basicInformation.isInternational")} />}
          </ChartBox>
          <ChartBox height='300px' title='Were you a BizTech member last year'>
            {initialData && <PieChart data={getFieldCounts(initialData, "basicInformation.wasPreviousMember")} />}
          </ChartBox>
          <ChartBox height='300px' title='What topics did you want to see the most discussed in the future?'>
            {initialData && <BarChart data={getFieldCounts(initialData, "basicInformation.topicsOfInterest")} />}
          </ChartBox>
          <ChartBox height='300px' title='How did you hear about us?'>
            {initialData && <BarChart data={getFieldCounts(initialData, "basicInformation.heardFrom")} />}
          </ChartBox>
        </div>
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const data = await fetchMembershipData();
    return { props: { initialData: data } };
  } catch (error) {
    console.error("Failed to fetch membership data:", error);
    return { props: { initialData: null } };
  }
}; 