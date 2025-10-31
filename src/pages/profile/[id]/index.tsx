import {
  Share,
  ExternalLink,
  Calendar,
  LinkIcon,
  IdCardLanyard,
  GraduationCap,
  Home,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
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
import { User } from "@/types";

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
  const { toast } = useToast();

  // State for managing check-in availability
  // checkin available when checkInEvent exists
  const [checkInEvent, setCheckInEvent] = useState<{
    eventID: string;
    year: number;
    ename: string;
  } | null>(null);

  // State for managing check-in permissions
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasCheckedIn, setHasCheckedIn] = useState<boolean>(false);

  const handleUserCheckIn = async (
    eventData: {
      eventID: string;
      year: number;
    },
    userEmail: string,
  ) => {
    // First, check if user is already checked in
    try {
      const registrationData = await fetchBackend({
        endpoint: `/registrations?email=${userEmail}`,
        method: "GET",
        authenticatedCall: false,
      });

      const eventRegistration = registrationData.data.find(
        (reg: any) =>
          reg["eventID;year"] === `${eventData.eventID};${eventData.year}`,
      );

      if (!eventRegistration) {
        toast({
          title: "Check-in Failed",
          description: "The user is not registered for this event.",
          variant: "destructive",
        });
        return false;
      }

      if (
        eventRegistration.registrationStatus ===
        REGISTRATION_STATUS.CHECKED_IN
      ) {
        toast({
          title: "Check-in Failed",
          description:
            "The user's registration was already checked in. Cannot check-in.",
          variant: "destructive",
        });
        return false;
      }

      if (
        eventRegistration.registrationStatus === REGISTRATION_STATUS.CANCELLED
      ) {
        toast({
          title: "Check-in Failed",
          description:
            "The user's registration was cancelled. Cannot check-in.",
          variant: "destructive",
        });
        return false;
      }

      if (
        eventRegistration.registrationStatus ===
        REGISTRATION_STATUS.WAITLISTED
      ) {
        toast({
          title: "Check-in Failed",
          description: "The user is on the waitlist. Cannot check-in.",
          variant: "destructive",
        });
        return false;
      }

      // ACCEPTEDCOMPLETE -> User has to confirm spot by paying (?)
      if (
        eventRegistration.registrationStatus !==
        REGISTRATION_STATUS.ACCEPTEDCOMPLETE
      ) {
        toast({
          title: "Check-in Failed",
          description:
            "The user has not confirmed their spot or paid. Cannot check-in.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error("Failed to check registration status:", error);
      toast({
        title: "Check-in Failed",
        description: "Failed to verify registration status.",
        variant: "destructive",
      });
      return false;
    }

    const checkInData = {
      eventID: eventData.eventID,
      year: eventData.year,
      registrationStatus: REGISTRATION_STATUS.CHECKED_IN,
    };

    const loadingToast = toast({
      title: "Checking user in...",
      description: (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Please wait while we check in the user.</span>
        </div>
      ),
    });

    try {
      await fetchBackend({
        endpoint: `/registrations/${userEmail}/${profileData.fname}`,
        method: "PUT",
        data: checkInData,
      });

      loadingToast.update({
        id: loadingToast.id,
        title: "User Checked In",
        description: (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
            <span>
              {profileData.fname} {profileData.lname} has been checked in.
            </span>
          </div>
        ),
      });
      return true;
    } catch (error: any) {
      console.error("Check-in failed:", error);

      if (error.status === 409) {
        loadingToast.update({
          id: loadingToast.id,
          title: "Check-in Failed",
          description: "The user is not registered for this event.",
          variant: "destructive",
        });
      } else {
        loadingToast.update({
          id: loadingToast.id,
          title: "Check-in Failed",
          description: "Failed to automatically check in the user.",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const checkInUserToEvent = async () => {
    try {
      if (!checkInEvent) {
        // Should never reach this point
        return;
      }

      const response = await fetchBackend({
        endpoint: `/members/email/${profileID}`,
        method: "GET",
      });

      const success = await handleUserCheckIn(checkInEvent, response.email);
      if (success) {
        setHasCheckedIn(true);
      }
    } catch (error) {
      console.error("Failed to check in user:", error);
    }
  };

  useEffect(() => {

    const initializeCheckInAvailability = async () => {
      try {
        const currentUser = await fetchBackend({
          endpoint: "/users/self",
          method: "GET",
        });

        setCurrentUser(currentUser);

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
            const [ename, eventEndTimeStr, eventIdAndYear] =
              cachedEventData.split("#");
            const [eventId, year] = eventIdAndYear.split(";");
            const eventEndTime = new Date(eventEndTimeStr);

            // check that cache is not stale
            if (eventEndTime > currentTime) {
              activeEventData = {
                id: eventId,
                year: parseInt(year),
                endDate: eventEndTimeStr,
                ename
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
            const cacheKey = `${activeEventData.ename}#${activeEventData.endDate}#${activeEventData.id};${activeEventData.year}`;
            localStorage.setItem("activeEvent", cacheKey);
          }
        }

        if (activeEventData) {
          const eventData = {
            eventID: activeEventData.id,
            year: activeEventData.year,
            ename: activeEventData.ename,
          };
          setCheckInEvent(eventData);

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
      : "app.ubcbiztech.com";

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
            </div>

            {(checkInEvent && currentUser?.admin) && (
              <div className="flex gap-4 justify-center mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
                <IconButton
                  icon={CheckCircle}
                  label={`Check In to ${checkInEvent.ename}`}
                  onClick={checkInUserToEvent}
                  disabled={hasCheckedIn/* Avoid prompting to check-in right after checking in */}
                />
              </div>
            )}
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
                  fieldName="Pronouns"
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
