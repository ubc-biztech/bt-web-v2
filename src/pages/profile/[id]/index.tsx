import {
  Share,
  ExternalLink,
  Calendar,
  LinkIcon,
  IdCardLanyard,
  GraduationCap,
  Home,
  CheckCircle,
} from "lucide-react";
import ShareProfileDrawer from "@/components/ProfilePage/ShareProfileDrawer";
import {
  BiztechProfile,
  DisplayUserField,
  HobbyTag,
  LinkButton,
} from "@/components/ProfilePage/BizCardComponents";
import { GenericCardNFC } from "@/components/Common/Cards";
import { GetServerSideProps } from "next";
import { fetchBackend, fetchBackendFromServer } from "@/lib/db";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useRouter as useNavRouter } from "next/navigation";
import Image from "next/image";
import ConnectionModal from "@/components/Connections/ConnectionModal/ConnectionModal";
import { ConnectedButton } from "@/components/ui/connected-button";
import { UnauthenticatedUserError } from "@/lib/dbUtils";
import { IconButton } from "@/components/Common/IconButton";
import { REGISTRATION_STATUS } from "@/constants/registrations";

interface NFCProfilePageProps {
  profileData: BiztechProfile;
  profileID: string;
  isConnected: boolean;
  signedIn: boolean;
  self: boolean;
  error?: string;
}

const ProfilePage = ({
  profileData,
  profileID,
  isConnected,
  signedIn,
  self,
  error,
}: NFCProfilePageProps) => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  // State for managing check-in availability - only available when user is admin and there's an active event
  const [checkInEvent, setCheckInEvent] = useState<{
    eventID: string;
    year: number;
  } | null>(null);

  useEffect(() => {
    const initializeCheckInAvailability = async () => {
      try {
        const currentUser = await fetchBackend({
          endpoint: "/users/self",
          method: "GET",
        });

        if (!currentUser.admin) {
          setCheckInEvent(null);
          return;
        }

        // Try to get active event from cache first
        const cachedEventData = localStorage.getItem("activeEvent");
        const currentTime = new Date();
        let activeEventData = null;

        if (cachedEventData) {
          try {
            const [eventEndTimeStr, eventIdAndYear] =
              cachedEventData.split("#");
            const [eventId, year] = eventIdAndYear.split(";");
            const eventEndTime = new Date(eventEndTimeStr);

            // check that chache is not stale
            if (eventEndTime > currentTime) {
              activeEventData = {
                id: eventId,
                year: parseInt(year),
                endDate: eventEndTimeStr,
              };
            }
          } catch (parseError) {
            console.error("Error parsing cached active event:", parseError);
          }
        }

        // Fetch from network if no valid cache
        if (!activeEventData) {
          activeEventData = await fetchBackend({
            endpoint: "/events/getActiveEvent",
            method: "GET",
          });

          // Cache the fetched event data with format {activeEvent: endTime#eventID;year}
          if (activeEventData) {
            const cacheKey = `${activeEventData.endDate}#${activeEventData.id};${activeEventData.year}`;
            localStorage.setItem("activeEvent", cacheKey);
          }
        }

        // Set check-in event if we have valid data
        if (activeEventData) {
          setCheckInEvent({
            eventID: activeEventData.id,
            year: activeEventData.year,
          });
        } else {
          setCheckInEvent(null);
        }
      } catch (error) {
        console.error("Error initializing check-in availability:", error);
        setCheckInEvent(null);
      }
    };

    initializeCheckInAvailability();
  }, []);

  // THIS FUNCTION IS NOT WORKING
  // !! WE NEED A WAY TO GO FROM profileID to email
  const handleUserCheckIn = async () => {
    if (!checkInEvent) {
      console.error("No active event available for check-in");
      return;
    }

    const checkInData = {
      eventID: checkInEvent.eventID,
      year: checkInEvent.year,
      registrationStatus: REGISTRATION_STATUS.CHECKED_IN,
    };

    try {
      await fetchBackend({
        endpoint: `/registrations/${profileID}/${fname}`,
        method: "PUT",
        data: checkInData,
      });

      console.log("Successfully checked in user:", profileID);
    } catch (error) {
      console.error("Check-in failed:", error);
    }
  };

  const router = useRouter();
  const navRouter = useNavRouter();

  const showScanModal = router.query.scan === "true";
  const handleCloseModal = () => {
    const { scan, ...restQuery } = router.query;
    router.replace(
      {
        pathname: router.pathname,
        query: restQuery,
      },
      undefined,
      { shallow: true },
    );
  };

  let route = router.asPath;
  let domain =
    typeof window !== "undefined"
      ? window.location.origin
      : "v2.ubcbiztech.com";

  const fullURL = `${domain}${route}`;

  if (!profileData) {
    return (
      <div className="flex flex-col items-center gap-4 w-full text-bt-blue-0 text-lg">
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
    hobby1,
    hobby2,
    funQuestion1,
    funQuestion2,
    linkedIn,
    profilePictureURL,
    additionalLink,
    description,
  } = profileData;

  const questions = [funQuestion1, funQuestion2].filter((q) => {
    return !!q;
  });

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
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 text-white py-4 md:p-8 md:gap-8 space-y-6 md:space-y-0">
        <div className="flex flex-col justify-center items-center col-span-1 gap-4">
          <div className="lg:place-items-center flex flex-col justify-center w-fit">
            <div className="w-32 h-32 bg-bt-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center relative overflow-hidden">
              {profilePictureURL ? (
                <Image
                  src={profilePictureURL}
                  alt="Profile Picture"
                  fill={true}
                  className="object-cover"
                />
              ) : (
                <span className="text-3xl font-medium text-bt-blue-500">
                  {fname[0].toUpperCase()}
                  {lname[0].toUpperCase()}
                </span>
              )}
            </div>
            <h1 className="text-center text-xl font-semibold mb-2">
              {fname} {lname}
            </h1>
            <p className="text-pale-blue mb-4 text-center">
              BizTech{" "}
              {profileType === "ATTENDEE"
                ? "Member"
                : profileType === "PARTNER"
                  ? "Partner"
                  : "Exec"}
            </p>

            {isConnected && (
              <ConnectedButton className="mb-4 before:bg-none border-bt-blue-0 border hover:bg-bt-blue-0/10 px-3 py-1 rounded-full text-sm font-medium font-sans">
                <CheckCircle />
                <span className="text-[12px] translate-y-[1px]">CONNECTED</span>
              </ConnectedButton>
            )}

            <div className="flex gap-4 justify-center">
              <IconButton
                icon={Share}
                label="Share Profile"
                onClick={() => setDrawerOpen(true)}
              />

              {checkInEvent && (
                <IconButton
                  icon={CheckCircle}
                  label="Check User In"
                  onClick={handleUserCheckIn}
                />
              )}
            </div>
          </div>

          <div className="hidden md:block">
            <UserExternalLinks />
          </div>
        </div>

        <div className="flex flex-col justify-center col-span-2 space-y-6 w-full">
          <GenericCardNFC title={`About ${fname}`} isCollapsible={false}>
            <div className="space-y-4">
              <p className="text-bt-blue-0 text-sm">
                {description || "No description provided."}
              </p>

              {(hobby1 || hobby2) && (
                <>
                  <div className="inline-flex flex-wrap items-center gap-2">
                    <span className="text-sm text-bt-blue-0">Hobbies:</span>
                    <div className="flex flex-wrap gap-2">
                      {hobby1 && <HobbyTag hobby={hobby1} />}
                      {hobby2 && <HobbyTag hobby={hobby2} />}
                    </div>
                  </div>
                  <div className="border-bt-blue-400 border-[0.5px]" />
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

          {questions.length > 0 && (
            <GenericCardNFC isCollapsible={false}>
              {questions.map((question, idx) => (
                <div key={idx} className="">
                  <p className="text-sm text-bt-blue-0 mb-2">{question}</p>

                  {idx < questions.length - 1 && (
                    <div className="border-bt-blue-400 border-[0.5px]" />
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
      {!isConnected && !self && (
        <ConnectionModal
          profileData={profileData}
          signedIn={signedIn}
          profileID={profileID}
          isVisible={showScanModal}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
  query,
}) => {
  const humanId = params?.id as string;

  const nextServerContext = {
    request: req,
    response: res,
  };

  let profileData = null;
  let isConnected = false;
  let signedIn = false;
  let self = false;

  try {
    const [profileResult, connectionResult] = await Promise.allSettled([
      fetchBackend({
        endpoint: `/profiles/profile/${humanId}`,
        method: "GET",
        authenticatedCall: false,
      }),
      fetchBackendFromServer({
        endpoint: `/interactions/journal/${humanId}`,
        method: "GET",
        nextServerContext,
      }),
    ]);

    if (profileResult.status !== "fulfilled") {
      console.error("Profile fetch failed:", profileResult.reason);
      return {
        props: {
          profileData: null,
          isConnected: false,
          profileID: humanId,
          signedIn: false,
        },
      };
    }

    profileData = profileResult.value;

    if (
      connectionResult.status !== "fulfilled" &&
      connectionResult.reason instanceof Error &&
      connectionResult.reason.name === UnauthenticatedUserError.name
    ) {
      // unauthenticated user
    } else if (connectionResult.status !== "fulfilled") {
      // error 400 means you checked a connection with yourself
      if (connectionResult.reason.status === 400) self = true;
    } else {
      isConnected = connectionResult.value.connected;
      signedIn = true;
    }

    return {
      props: {
        profileData,
        isConnected,
        profileID: humanId,
        self,
        signedIn,
      },
      redirect:
        isConnected && query && query.scan === "true"
          ? {
              destination: `/profile/${humanId}`,
              permanent: false,
              query: undefined,
            }
          : undefined,
    };
  } catch (error) {
    console.error("Unexpected error in getServerSideProps:", error);

    return {
      props: {
        profileData: null,
        isConnected: false,
        profileID: humanId,
        self,
        signedIn: false,
      },
    };
  }
};

export default ProfilePage;
