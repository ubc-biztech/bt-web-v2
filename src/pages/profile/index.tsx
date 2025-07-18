import React, { useEffect, useState } from "react";
import { BiztechEvent, User } from "@/types";
import { UserInfo } from "@/components/ProfilePage/UserInfo";
import { UserEvents } from "@/components/ProfilePage/UserEvents";
import { fetchBackend } from "@/lib/db";
import { fetchUserAttributes } from "@aws-amplify/auth";
import { Registration } from "@/types/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const sortRegistrationsByDate = (registrations: Registration[]) => {
  // sorts events in descending order by createdAt, otherwise by updatedAt if event doesn't have createdAt field
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

const fetchEventData = async (email: string): Promise<BiztechEvent[]> => {
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

  return events;
};

const fetchProfileData = async (email: string) => {
  const profileData = await fetchBackend({
    endpoint: `/users/${email}`,
    method: "GET",
    authenticatedCall: true,
  });

  console.log(profileData);
  return profileData;
};

const ProfilePage = () => {
  const [registeredEvents, setRegisteredEvents] = useState<BiztechEvent[]>([]);
  const [savedEvents, setSavedEvents] = useState<BiztechEvent[]>([]);
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const attributes = await fetchUserAttributes();

        const email = attributes.email;
        if (!email) throw new Error("No email found");

        const [profileData, events] = await Promise.all([
          fetchProfileData(email),
          fetchEventData(email),
        ]);

        setProfile(profileData);
        setRegisteredEvents(events);
        setSavedEvents(events);
      } catch (err) {
        console.error("Failed to fetch user profile data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="bg-primary-color min-h-screen">
      <div className="container mx-auto p-6 lg:p-10 pt-16 lg:pt-24">
        <h3 className="text-white text-lg lg:text-xl">
          {profile?.fname ? `Welcome back, ${profile.fname}!` : "Welcome back!"}
        </h3>
        <Link href="/profile/nfc">
          <Button className="bg-signup-input-border"> View NFC Profile </Button>
        </Link>
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
