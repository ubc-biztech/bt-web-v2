import React, { useEffect, useState } from "react";
import { BiztechEvent, Profile } from "@/types";
import { UserInfo } from "@/components/ProfilePage/UserInfo";
import { UserEvents } from "@/components/ProfilePage/UserEvents";
import { fetchBackend } from "@/lib/db";
import { getCurrentUser } from "@aws-amplify/auth";
import { Attendee } from "@/types/types";

const sortRegistrationsByDate = (registrations: Attendee[]) => {
  // sorts events in descending order by createdAt, otherwise by updatedAt if event doesn't have createdAt field
  registrations.sort((a: Attendee, b: Attendee) => {
    const hasCreatedAtA = 'createdAt' in a && a.createdAt !== undefined;
    const hasCreatedAtB = 'createdAt' in b && b.createdAt !== undefined;

    if (hasCreatedAtA && !hasCreatedAtB) return -1;
    if (!hasCreatedAtA && hasCreatedAtA) return 1;
    if (hasCreatedAtA && hasCreatedAtB) return (b.createdAt as number) - (a.createdAt as number);
    return b.updatedAt- a.updatedAt
  })
  return registrations;
}

const fetchEventData = async (email: string) : Promise<BiztechEvent[]> => {
  const userRegistrations = await fetchBackend({
    endpoint: `/registrations/?email=${email}`,
    method: "GET",
    authenticatedCall: false,
  })
  const sortedRegistrations: Attendee[] = sortRegistrationsByDate(userRegistrations.data).slice(0, 3);

  const events = await Promise.all(
    sortedRegistrations.map(async (registration) => {
      const event = await fetchBackend({
        endpoint: `/events/?id=${registration["eventID;year"]}`,
        method: "GET",
        authenticatedCall: false,
      });
      return event[event.length - 1];
    })
  );
  return events;
};

const fetchProfileData = async (email: string) => {
  const profileData = await fetchBackend({
    endpoint: `/users/${email}`,
    method: "GET",
    authenticatedCall: true,
  })
  return profileData;
};

const ProfilePage = () => {
  const [registeredEvents, setRegisteredEvents] = useState<BiztechEvent[]>([]);
  const [savedEvents, setSavedEvents] = useState<BiztechEvent[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { signInDetails } = await getCurrentUser();
      const email = signInDetails?.loginId;
      let profileData = null;
      let events: BiztechEvent[] = [];
      if (email) {
        [profileData, events] = await Promise.all([
          fetchProfileData(email),
          fetchEventData(email),
        ]);
      }
      setProfile(profileData);
      setRegisteredEvents(events);
      setSavedEvents(events);
    };
    fetchData();
  }, []);

  return (
    <main className="bg-primary-color min-h-screen">
      <div className="container mx-auto p-6 lg:p-10 pt-16 lg:pt-24">
        <h3 className="text-white text-lg lg:text-xl">
          {profile?.fname
            ? `Welcome back, ${profile.fname}!`
            : "Welcome back!"}
        </h3>
        <div className="flex flex-col gap-6 mt-6 lg:flex-row">
          <UserInfo profile={profile} />
          <UserEvents
            registeredEvents={registeredEvents}
            savedEvents={savedEvents}
          />
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
