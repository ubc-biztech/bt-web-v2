import React, { useEffect, useState } from "react";
import { BiztechEvent, MemberStatus, Profile } from "@/types";
import { UserInfo } from "@/components/ProfilePage/UserInfo";
import { UserEvents } from "@/components/ProfilePage/UserEvents";
import { fetchBackend } from "@/lib/db";
import { getCurrentUser } from "@aws-amplify/auth";

// Mock event and profile data
// TO DO: replace these with calls to backend
const fetchEventData = async () : Promise<BiztechEvent[]> => {
  let data = [];
  for (let i = 0; i < 10; i++) {
    data.push({
      id: "existingEvent1",
      year: 2020,
      capac: 123,
      createdAt: 1581227718674,
      description: "I am a description",
      elocation: "UBC",
      ename: "cool event",
      startDate: "2024-07-01T07:00:11.131Z",
      endDate: "2024-07-01T21:00:11.131Z",
      imageUrl: "https://i.picsum.photos/id/236/700/400.jpg",
      updatedAt: 1581227718674,
    } as BiztechEvent);
  }
  return data;
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
      const profile = await fetchProfileData(email);
      setProfile(profile);
      const events: BiztechEvent[] = await fetchEventData();
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
