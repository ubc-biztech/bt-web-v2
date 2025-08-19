import { fetchBackendFromServer, fetchBackend } from "@/lib/db";
import { fetchUserAttributes } from "@aws-amplify/auth/server";
import { GetServerSideProps } from "next";
import { runWithAmplifyServerContext } from "@/util/amplify-utils";
import { Registration } from "@/types/types";
import { BiztechEvent, User } from "@/types";
import HeaderCard from "@/components/ProfilePage/HeaderCard";
import AttributesCard from "@/components/ProfilePage/AttributesCard";

interface ProfilePageProps {
  profileData: User;
  events: BiztechEvent[];
  error?: string;
}

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
      <div className="grid grid-cols-1 gap-4 w-full">
        <AttributesCard profileData={profileData} userRole={userRole} />
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  try {
    const nextServerContext = { request: req, response: res };

    const profileData = await fetchBackendFromServer({
      endpoint: `/users/self`,
      method: "GET",
      authenticatedCall: true,
      nextServerContext,
    });

    return {
      props: {
        profileData,
      },
    };
  } catch (error) {
    console.error("Error in getServerSideProps:", error);
    return {
      props: {
        profileData: null,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
    };
  }
};
