import React, { useEffect, useState } from "react";
import { BiztechEvent, User } from "@/types";
import { fetchBackendFromServer } from "@/lib/db";
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
import { useRedirect } from "@/hooks/useRedirect";
import { Spinner } from "@/components/ui/spinner";
import PageLoadingState from "@/components/Common/PageLoadingState";
import { GetServerSideProps } from "next";

interface ProfilePageProps {
  profile: User | null;
  events: BiztechEvent[];
  registrations: Registration[];
  highlightedEvent: BiztechEvent | null;
}

const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  events,
  registrations,
  highlightedEvent,
}) => {
  const router = useRouter();

  if (!profile) {
    router.push("/login");
  }

  function getEventState(event: BiztechEvent | null) {
    return event && toDate(event.startDate) < toDate(new Date())
      ? "Past"
      : "Upcoming";
  }

  return (
    <div className="h-full relative">
      <h3 className="text-white text-lg lg:text-xl">
        {profile?.fname ? `Hey ${profile.fname}!` : "Hey"}
      </h3>
      <p className="text-pale-blue">Welcome back to BizTech</p>
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
          <div className="text-pale-blue h-full flex flex-col justify-center">
            <BizImage
              height={480}
              width={720}
              alt="Event cover image"
              src={highlightedEvent?.imageUrl || "/assets/images/not-found.png"}
              style={{ objectFit: "cover" }}
              className="h-full rounded-xl border-[0.5px] border-pale-blue/60"
            />
            {highlightedEvent ? (
              <div className="flex flex-wrap flex-row justify-between gap-4 items-center mt-4">
                <div>
                  <h4>{highlightedEvent?.ename}</h4>

                  <p className="text-xs text-pale-blue">
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
                  className="bg-neon-green hover:bg-dark-green text-dark-navy rounded-full"
                  disabled={getEventState(highlightedEvent) === "Past"}
                />
              </div>
            ) : (
              <div className="h-full w-full place-content-center text-center text-pale-blue">
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
    const profile = await fetchBackendFromServer({
      endpoint: `/users/self`,
      method: "GET",
      nextServerContext,
    });

    const events = await fetchBackendFromServer({
      endpoint: `/events`,
      method: "GET",
      authenticatedCall: false,
      nextServerContext,
    });

    // 3. Fetch registrations for this user
    const registrationsRes = await fetchBackendFromServer({
      endpoint: `/registrations/?email=${profile.email}`,
      method: "GET",
      authenticatedCall: false,
      nextServerContext,
    });

    // 4. Filter and highlight events
    const allEvents = events.filter(
      (event: BiztechEvent) =>
        toDate(event.startDate) > toDate(new Date(2024, 9, 1)),
    );
    const highlightedEvent = getHighlightedEvent(allEvents);

    return {
      props: {
        profile,
        events: allEvents,
        registrations: registrationsRes.data,
        highlightedEvent: highlightedEvent || null,
      },
    };
  } catch (err: any) {
    if (err.status === 404) {
      return {
        redirect: {
          destination: "/membership",
          permanent: false,
        },
      };
    }

    // Optionally handle other errors
    return {
      props: {
        profile: null,
        events: [],
        registrations: [],
        highlightedEvent: null,
      },
    };
  }
};

export default ProfilePage;
