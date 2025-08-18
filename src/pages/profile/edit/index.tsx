import { BiztechProfile } from "@/components/ProfilePage/BizCardComponents";
import { GetServerSideProps } from "next";
import { runWithAmplifyServerContext } from "@/util/amplify-utils";
import { fetchUserAttributes } from "@aws-amplify/auth/server";
import { fetchBackendFromServer } from "@/lib/db";
import { EditProfilePage } from "@/components/ProfilePage/EditProfilePage";

interface NFCProfilePageProps {
  profileData: BiztechProfile;
  error?: string;
  isOwner?: boolean;
}

const ProfilePage = ({ profileData, error }: NFCProfilePageProps) => {
  return <EditProfilePage profileData={profileData} />;
};

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
      endpoint: `/profiles/user`,
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
        isOwner: false,
      },
    };
  }
};

export default ProfilePage;
