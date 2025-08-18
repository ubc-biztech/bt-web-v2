import {
  Share,
  ExternalLink,
  Calendar,
  LinkIcon,
  IdCardLanyard,
  GraduationCap,
  Home,
} from "lucide-react";
import ShareProfileDrawer from "@/components/ProfilePage/ShareProfileDrawer";
import {
  BiztechProfile,
  DisplayUserField,
  HobbyTag,
  IconButton,
  LinkButton,
} from "@/components/ProfilePage/BizCardComponents";
import { GenericCardNFC } from "@/components/Common/Cards";
import { GetServerSideProps } from "next";
import { runWithAmplifyServerContext } from "@/util/amplify-utils";
import { fetchUserAttributes } from "@aws-amplify/auth/server";
import { fetchBackendFromServer } from "@/lib/db";
import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { redirect, useRouter as useNavRouter } from "next/navigation";

interface NFCProfilePageProps {
  profileData: BiztechProfile;
  error?: string;
}

const ProfilePage = ({ profileData, error }: NFCProfilePageProps) => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const router = useRouter();
  const navRouter = useNavRouter();

  let route = router.asPath;
  let domain =
    typeof window !== "undefined"
      ? window.location.origin
      : "v2.ubcbiztech.com";

  const fullURL = `${domain}${route}`;

  if (!profileData) {
    return (
      <div className="flex flex-col items-center gap-4 w-full text-pale-blue text-lg">
        Oops! No profile found.
        <IconButton
          label="Return to home"
          onClick={() => navRouter.push("/")}
          className="w-fit"
          icon={Home}
        />
      </div>
    );
  }

  const {
    profileType,
    fname,
    lname,
    pronouns,
    year,
    major,
    viewableMap,
    hobby1,
    hobby2,
    funQuestion1,
    funQuestion2,
    linkedIn,
    profilePictureURL,
    additionalLink,
    description,
  } = profileData;

  const questions = [funQuestion1, funQuestion2];

  const UserExternalLinks = () => (
    <div className="grid grid-cols-1 gap-4">
      {linkedIn && (
        <LinkButton linkIcon={ExternalLink} label="LinkedIn" url={linkedIn} />
      )}
      {additionalLink && (
        <LinkButton
          linkIcon={LinkIcon}
          label="Additional Link"
          url={additionalLink}
        />
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 text-white py-4 md:p-8 md:gap-8 space-y-6 md:space-y-0">
      <div className="flex flex-col justify-center items-center col-span-1 gap-4">
        <div className="place-items-center w-fit">
          <div className="w-32 h-32 bg-events-baby-blue rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl font-medium text-biztech-navy">FL</span>
          </div>
          <h1 className="text-center text-xl font-semibold mb-2">
            {fname} {lname}
          </h1>
          <p className="text-pale-blue mb-4">
            BizTech {profileType === "ATTENDEE" ? "Member" : "Exec"}
          </p>

          <IconButton
            icon={Share}
            label="Share Profile"
            onClick={() => setDrawerOpen(true)}
          />
        </div>

        <div className="hidden md:block">
          <UserExternalLinks />
        </div>
      </div>

      <div className="flex flex-col justify-center col-span-2 space-y-6 w-full">
        {/* Member Profile Section */}
        <GenericCardNFC title={`About ${fname}`} isCollapsible={false}>
          <div className="space-y-4">
            <p className="text-pale-blue text-sm">
              {description || "No description provided."}
            </p>

            {(hobby1 || hobby2) && (
              <>
                <div className="inline-flex flex-wrap items-center gap-2">
                  <span className="text-sm text-pale-blue">Hobbies:</span>
                  <div className="flex flex-wrap gap-2">
                    {hobby1 && <HobbyTag hobby={hobby1} />}
                    {hobby2 && <HobbyTag hobby={hobby2} />}
                  </div>
                </div>
                <div className="border-border-blue border-[0.5px]" />
              </>
            )}

            <div className="space-y-3">
              <DisplayUserField
                icon={IdCardLanyard}
                fieldName="School"
                fieldValue={pronouns}
              />
              <DisplayUserField
                icon={GraduationCap}
                fieldName="Major"
                fieldValue={major}
              />
              <DisplayUserField
                icon={Calendar}
                fieldName="Year"
                fieldValue={year}
              />
            </div>
          </div>
        </GenericCardNFC>

        <div className="block md:hidden">
          <UserExternalLinks />
        </div>

        {/* Q&A Section */}
        {(funQuestion1 || funQuestion2) && (
          <GenericCardNFC isCollapsible={false}>
            {questions.map((question, idx) => (
              <div key={idx} className="">
                <span className="rounded-lg">
                  <p className="text-sm text-pale-blue mb-2">{funQuestion1}</p>
                </span>

                {questions.length > 1 && (
                  <div className="border-border-blue border-[0.5px]" />
                )}
              </div>
            ))}
          </GenericCardNFC>
        )}
      </div>

      <ShareProfileDrawer
        isOpen={isDrawerOpen}
        setIsOpen={setDrawerOpen}
        url={fullURL}
      />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
}) => {
  const humanId = params?.id as string;

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

    console.log(humanId);

    const profileData = await fetchBackendFromServer({
      endpoint: `/profiles/profile/${humanId}`,
      method: "GET",
      authenticatedCall: false,
      nextServerContext,
    });

    console.log(profileData);

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
      },
    };
  }
};

export default ProfilePage;
