import { fetchBackendFromServer, fetchBackend } from "@/lib/db";
import { fetchUserAttributes } from "@aws-amplify/auth/server";
import { GetServerSideProps } from "next";
import { runWithAmplifyServerContext } from "@/util/amplify-utils";
import { Registration } from "@/types/types";
import { BiztechEvent, User } from "@/types";
import EventStack from "@/components/Blocks/EventStack";
import HeaderCard from "@/components/ProfilePage/HeaderCard";
import AttributesCard from "@/components/ProfilePage/AttributesCard";

interface ProfilePageProps {
  profileData: User;
  events: BiztechEvent[];
  error?: string;
}

const sortRegistrationsByDate = (registrations: Registration[]) => {
  registrations.sort((a: Registration, b: Registration) => {
    const hasCreatedAtA = "createdAt" in a && a.createdAt !== undefined;
    const hasCreatedAtB = "createdAt" in b && b.createdAt !== undefined;

    if (hasCreatedAtA && !hasCreatedAtB) return -1;
    if (!hasCreatedAtA && hasCreatedAtA) return 1;
    if (hasCreatedAtA && hasCreatedAtB)
      return (b.createdAt as number) - (a.createdAt as number);
    return b.updatedAt - a.updatedAt;
  });
  return registrations;
};

export default function ProfilePage({
  profileData,
  events,
  error,
}: ProfilePageProps) {
  if (error) {
    return (
      <div className="text-light-red text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  const userRole = profileData.isMember
    ? "BizTech Member"
    : profileData.admin
      ? "BizTech Executive"
      : "Guest";

  return (
    <div className="h-full flex flex-col w-full gap-4">
      <HeaderCard
        fname={profileData.fname}
        lname={profileData.lname}
        userRole={userRole}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        <AttributesCard profileData={profileData} userRole={userRole} />
        <EventStack events={[]} />
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  try {
    const userAttributes = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: (contextSpec) => fetchUserAttributes(contextSpec),
    });

    const email = userAttributes.email;
    if (!email) {
      throw new Error("No email found");
    }

    const nextServerContext = {
      request: req,
      response: res,
    };

    const profileData = await fetchBackendFromServer({
      endpoint: `/users/${email}`,
      method: "GET",
      authenticatedCall: true,
      nextServerContext,
    });

    const userRegistrations = await fetchBackend({
      endpoint: `/registrations/?email=${email}`,
      method: "GET",
      authenticatedCall: false,
    });

    const sortedRegistrations: Registration[] = sortRegistrationsByDate(
      userRegistrations.data,
    ).slice(0, 3);

    const events = await Promise.all(
      sortedRegistrations.map(async (registration) => {
        const eventID = registration["eventID;year"].split(";")[0];
        const year = registration["eventID;year"].split(";")[1];
        const event = await fetchBackend({
          endpoint: `/events/?id=${eventID}&year=${year}`,
          method: "GET",
          authenticatedCall: false,
        });

        return event[event.length - 1];
      }),
    );

    return {
      props: {
        profileData,
        events: events || [],
      },
    };
  } catch (error) {
    console.error("Error in getServerSideProps:", error);
    return {
      props: {
        profileData: null,
        events: [],
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
    };
  }
};
