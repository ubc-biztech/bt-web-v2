import React, { useEffect, useState } from "react";
import { BiztechEvent, User } from "@/types";
import { fetchBackend, fetchBackendFromServer } from "@/lib/db";
import { fetchUserAttributes } from "@aws-amplify/auth";
import { Registration } from "@/types/types";
import Divider from "@/components/Common/Divider";
import { GenericCard } from "@/components/Common/Cards";
import Image from "next/image";
import { IconButton } from "@/components/Common/IconButton";
import { ArrowUpRight } from "lucide-react";
import EventsAttended from "@/components/Blocks/EventsAttended";
import { getHighlightedEvent } from "@/util/sort";
import { format, toDate } from "date-fns";
import BizImage from "@/components/Common/BizImage";
import { useRouter } from "next/navigation";
import { GetServerSideProps } from "next";
import { UnauthenticatedUserError } from "@/lib/dbUtils";
import PageLoadingState from "@/components/Common/PageLoadingState";
import { AuthError } from "@aws-amplify/auth";

interface ProfilePageProps {
  events: BiztechEvent[];
  highlightedEvent: BiztechEvent | null;
}

const ProfilePage: React.FC<ProfilePageProps> = ({
  events,
  highlightedEvent,
}) => {
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // First check if user is signed in using the reliable method (same as NavBar)
        const attributes = await fetchUserAttributes();
        const userEmail = attributes?.email || "";

        if (!userEmail) {
          // User is not authenticated, redirect to login
          await router.push("/login");
          return;
        }

        // User is authenticated, now check their profile for membership status
        const userProfile = await fetchBackend({
          endpoint: `/users/self`,
          method: "GET",
        });

        setProfile(userProfile);

        // Check if user is a member, if not redirect to membership
        if (!userProfile.isMember) {
          await router.push("/membership");
          return;
        }

        // Fetch user registrations
        const registrationsRes = await fetchBackend({
          endpoint: `/registrations/?email=${userProfile.email}`,
          method: "GET",
        });

        setRegistrations(registrationsRes.data || []);
        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching user data:", error);

        if (
          error instanceof AuthError &&
          error.name === "UserUnAuthenticatedException"
        ) {
          // User is not authenticated, redirect to login
          await router.push("/login");
        } else if (error.name === UnauthenticatedUserError.name) {
          // Backend says user is not authenticated, redirect to login
          await router.push("/login");
        } else if (error.status === 404) {
          // User profile doesn't exist, redirect to membership
          await router.push("/membership");
        } else {
          // Other errors - just log and show loading state
          console.error("Failed to fetch user data:", error);
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [router]);

  function getEventState(event: BiztechEvent | null) {
    return event && toDate(event.startDate) < toDate(new Date())
      ? "Past"
      : "Upcoming";
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PageLoadingState />
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <h3 className="text-white text-lg lg:text-xl">
        {profile?.fname ? `Hey ${profile.fname}!` : "Hey"}
      </h3>
      <p className="text-bt-blue-0">Welcome back to BizTech</p>
      <Divider />

      <Image
        src={"/assets/bizbot_peeking.png"}
        width={320}
        height={320}
        alt="BizBot"
        className="absolute -top-[38px] right-[60px] h-[150px] w-[auto] hidden lg:block"
      />
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-6 mt-6">
        <GenericCard
          title={
            getEventState(highlightedEvent) === "Past"
              ? "Our Latest Event"
              : "Our Next Event"
          }
        >
          <div className="text-bt-blue-0 h-full flex flex-col justify-center">
            <BizImage
              height={480}
              width={720}
              alt="Event cover image"
              src={highlightedEvent?.imageUrl || "/assets/images/not-found.png"}
              style={{ objectFit: "cover" }}
              className="h-full aspect-[8/5] rounded-xl border-[0.5px] border-bt-blue-0/60"
            />
            {highlightedEvent ? (
              <div className="flex flex-wrap flex-row justify-between gap-4 items-center mt-4">
                <div>
                  <h4>{highlightedEvent?.ename}</h4>

                  <p className="text-xs text-bt-blue-0">
                    {format(toDate(highlightedEvent.startDate), "LLLL d, yyyy")}
                  </p>
                </div>

                <IconButton
                  label="View Details"
                  icon={ArrowUpRight}
                  iconDirection="right"
                  onClick={() =>
                    router.push(
                      `/event/${highlightedEvent?.id}/${highlightedEvent.year}/register`,
                    )
                  }
                  size="lg"
                  className="bg-bt-green-500 hover:bg-bt-green-700 text-bt-blue-600 rounded-full"
                  disabled={getEventState(highlightedEvent) === "Past"}
                />
              </div>
            ) : (
              <div className="h-full w-full place-content-center text-center text-bt-blue-0">
                No event to show - check back soon!
              </div>
            )}
          </div>
        </GenericCard>

        <GenericCard title="Events Attended">
          <EventsAttended events={events} registrations={registrations} />
        </GenericCard>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const nextServerContext = { request: context.req, response: context.res };

  try {
    // Only fetch events on server side
    const events = await fetchBackendFromServer({
      endpoint: `/events`,
      method: "GET",
      authenticatedCall: false,
      nextServerContext,
    });

    // Filter and highlight events
    const allEvents = events.filter(
      (event: BiztechEvent) =>
        toDate(event.startDate) > toDate(new Date(2025, 9, 1)) &&
        event.isPublished,
    );
    const highlightedEvent = getHighlightedEvent(allEvents);

    return {
      props: {
        events: allEvents,
        highlightedEvent: highlightedEvent || null,
      },
    };
  } catch (err: any) {
    // If events fail to load, return empty data instead of redirecting
    console.error("Failed to fetch events:", err);
    return {
      props: {
        events: [],
        highlightedEvent: null,
      },
    };
  }
};

export default ProfilePage;
