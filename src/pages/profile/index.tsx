import { fetchBackendFromServer } from "@/lib/db";
import { GetServerSideProps } from "next";
import { BiztechEvent, User } from "@/types";
import HeaderCard from "@/components/ProfilePage/HeaderCard";
import AttributesCard from "@/components/ProfilePage/AttributesCard";
import SuggestedConnectionsCard from "@/components/ProfilePage/SuggestedConnectionsCard";
import SuggestedConnectionsSection from "@/components/ProfilePage/SuggestedConnectionsSection";
import { checkMembership } from "@/lib/membership";
import { UnauthenticatedUserError } from "@/lib/dbUtils";

interface ProfilePageProps {
  profileData: User;
  events?: BiztechEvent[];
  error?: string;
  suggestions: any[];
  hasMembership: boolean;
}

export default function ProfilePage({
  profileData,
  error,
  hasMembership,
}: ProfilePageProps) {
  if (error) {
    return (
      <div className="text-bt-red-200 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  const userRole = hasMembership
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
        hasMembership={hasMembership}
      />
      <div className="grid grid-cols-1 gap-4 w-full">
        <AttributesCard profileData={profileData} userRole={userRole} />
        {/* Load suggestions after page paint */}
        <SuggestedConnectionsSection />
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
    const hasMembership = await checkMembership(
      profileData.email ?? profileData.id,
    );

    return { props: { profileData, hasMembership } };
  } catch (error: any) {
    console.error("Error in getServerSideProps:", error);

    if (
      error?.name === UnauthenticatedUserError.name ||
      error?.status === 401 ||
      error?.status === 403 ||
      error?.message === "Authentication required but no valid session found"
    ) {
      return {
        redirect: {
          destination: "/login?redirect=%2Fprofile",
          permanent: false,
        },
      };
    }

    if (error?.status === 404) {
      return {
        redirect: {
          destination: "/onboarding",
          permanent: false,
        },
      };
    }

    return {
      props: {
        profileData: null,
        hasMembership: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
    };
  }
};
