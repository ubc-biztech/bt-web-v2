import { UserEventCard } from "@/components/EventUserCard/UserEventCard";
import { fetchBackend } from "@/lib/db";
import { BiztechEvent } from "@/types/types";
import { ListIcon, SearchIcon, Bookmark } from "lucide-react";
import React, { ChangeEvent, useState } from "react";

interface EventProps {
  events: BiztechEvent[];
}

const filterStates = {
  registered: "registered",
  saved: "saved",
};

export default function Page({ events }: EventProps) {
  const [searchField, setSearchField] = useState("");
  const [filterState, setFilterState] = useState("");
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchField(e.target.value);
  };

  return (
    <main className="bg-primary-color min-h-screen">
      <div className="mx-auto pt-8 p-5 md:pt-20 md:l-20 md:pr-20  flex flex-col">
        <span>
          <h2 className="text-white text-xl lg:text-[40px]">Event Dashboard</h2>
          <div className="flex items-center justify-between h-[40px]">
            <p className="text-baby-blue font-poppins">View and register for our events!</p>
          </div>
        </span>
        <div className="bg-navbar-tab-hover-bg h-[1px] my-4" />
        <div className="flex flex-row space-x-3">
          <div className="relative mb-6 w-full lg:w-[400px]">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5">
              <SearchIcon width={15} height={15} color="#6578A8" />
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 text-dark-navy"
              placeholder="Search for events by name"
              value={searchField}
              onChange={handleChange}
            />
          </div>
          <div
            className="bg-events-card-bg p-2 h-[46px] rounded-lg flex-row justify-center items-center space-x-1 px-20 shrink hidden lg:flex cursor-pointer"
            onClick={() => setFilterState(filterStates.registered)}
          >
            <ListIcon height={20} width={20} /> <p>Registered</p>
          </div>
          <div
            className="bg-events-card-bg p-2 h-[46px] rounded-lg flex-row justify-center items-center space-x-1 px-20 shrink hidden lg:flex cursor-pointer"
            onClick={() => setFilterState(filterStates.saved)}
          >
            <Bookmark height={20} width={20} /> <p>Saved</p>
          </div>
        </div>
        <div className="flex flex-row space-x-3 lg:hidden">
          <div
            className="bg-events-card-bg p-2 h-[46px] rounded-lg flex-row justify-center items-center space-x-1 flex grow cursor-pointer"
            onClick={() => setFilterState(filterStates.registered)}
          >
            <ListIcon height={20} width={20} /> <p>Registered</p>
          </div>
          <div
            className="bg-events-card-bg p-2 h-[46px] rounded-lg flex-row justify-center items-center space-x-1 flex grow cursor-pointer"
            onClick={() => setFilterState(filterStates.saved)}
          >
            <Bookmark height={20} width={20} /> <p>Saved</p>
          </div>
        </div>
        <UserEventCard title="Current Events" events={events} />
      </div>
    </main>
  );
}

export async function getStaticProps() {
  // const events = await fetchBackend({ endpoint: "/events", method: "GET", authenticatedCall: false });
  // mock for testing
  const events = [
    {
      endDate: "2024-04-30T20:05:34.931Z",
      year: 2024,
      isPublished: true,
      partnerRegistrationQuestions: [],
      description: "asdf",
      feedback: "",
      createdAt: 1714507569426,
      ename: "asdf",
      capac: 123,
      elocation: "asdf",
      imageUrl:
        "https://www.wikihow.com/images/thumb/d/db/Get-the-URL-for-Pictures-Step-2-Version-6.jpg/v4-460px-Get-the-URL-for-Pictures-Step-2-Version-6.jpg",
      id: "asdfasdfasdf",
      deadline: "2024-04-30T20:05:34.931Z",
      partnerDescription: "asdf",
      isApplicationBased: false,
      startDate: "2024-04-30T20:05:34.931Z",
      pricing: { members: 0 },
      registrationQuestions: [],
      updatedAt: 1714507569426,
    },
    {
      endDate: "2024-04-30T20:10:35.991Z",
      year: 2024,
      isPublished: true,
      partnerRegistrationQuestions: [],
      description: "asdf",
      feedback: "",
      createdAt: 1714507851023,
      ename: "nonono",
      capac: 123,
      elocation: "123",
      imageUrl:
        "https://www.wikihow.com/images/thumb/d/db/Get-the-URL-for-Pictures-Step-2-Version-6.jpg/v4-460px-Get-the-URL-for-Pictures-Step-2-Version-6.jpg",
      id: "nonono",
      deadline: "2024-04-30T20:10:35.991Z",
      partnerDescription: "asdf",
      isApplicationBased: false,
      startDate: "2024-04-30T20:10:35.991Z",
      pricing: { members: 0 },
      registrationQuestions: [],
      updatedAt: 1714507851023,
    },
    {
      endDate: "2024-04-30T20:10:35.991Z",
      year: 2024,
      isPublished: false,
      partnerRegistrationQuestions: [],
      description: "asdf",
      feedback: "",
      createdAt: 1714507851023,
      ename: "nonono",
      capac: 123,
      elocation: "123",
      imageUrl:
        "https://www.wikihow.com/images/thumb/d/db/Get-the-URL-for-Pictures-Step-2-Version-6.jpg/v4-460px-Get-the-URL-for-Pictures-Step-2-Version-6.jpg",
      id: "nonono",
      deadline: "2024-04-30T20:10:35.991Z",
      partnerDescription: "asdf",
      isApplicationBased: false,
      startDate: "2024-04-30T20:10:35.991Z",
      pricing: { members: 0 },
      registrationQuestions: [],
      updatedAt: 1714507851023,
    },
  ];

  return {
    props: {
      events: events,
    },
  };
}
