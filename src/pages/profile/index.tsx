import React, { useEffect, useState } from "react";
import { BiztechEvent, MemberStatus, Profile } from "@/types";
import { UserInfo } from "@/components/ProfilePage/UserInfo";
import { UserEvents } from "@/components/ProfilePage/UserEvents";

const fetchEventData = async () => {
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
    });
  }
  return data;
};

const fetchProfileData = async () => {
  const profile = {
    name: "John Smith",
    email: "biztechuser@gmail.com",
    pronouns: "They/Them/Their",
    school: "UBC",
    studentId: "12345678",
    year: "3rd",
    dietary: "none",
    faculty: "Commerce",
    major: "BTM",
    status: MemberStatus.Member,
  };
  return profile;
};

const ProfilePage = () => {
  const [registeredEvents, setRegisteredEvents] = useState<BiztechEvent[]>([]);
  const [savedEvents, setSavedEvents] = useState<BiztechEvent[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const profile = await fetchProfileData();
      setProfile(profile);
      const events = await fetchEventData();
      setRegisteredEvents(events);
      setSavedEvents(events);
    };
    fetchData();
  }, []);

  return (
    <main className="bg-primary-color min-h-screen">
      <div className="container mx-auto p-10 pt-24">
        <h3 className="text-white">
          {profile?.name ? `Welcome back, ${profile.name}!` : "Welcome back!"}
        </h3>
        <div className="flex gap-6 mt-6">
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
