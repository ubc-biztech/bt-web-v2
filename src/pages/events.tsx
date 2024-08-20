import { EventDashboard } from "@/components/EventDisplayCard/EventDashboard";
import { fetchBackend } from "@/lib/db";
import { BiztechEvent } from "@/types/types";
import { getCurrentUser } from "@aws-amplify/auth";
import { ListIcon, SearchIcon, Bookmark } from "lucide-react";
import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

interface registeredEvent {
  "eventID;year": string;
  [key: string | symbol]: unknown;
}

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
  const isCooldownRef = useRef(false);
  // these useStates will be empty arrays by default, but currently have mocks before i verify backend integration works
  const [saved, setSaved] = useState<string[]>(user["favedEventsID;year"]);
  const [registered, setRegistered] = useState<string[]>(
    registeredEvents.data.map((event: registeredEvent) => {
      return event["eventID;year"];
    })
  );
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const uiStateFilter = () => {
    let filteredEvents: BiztechEvent[] = events;
    if (filterState === filterStates.registered && user) {
      filteredEvents = filteredEvents.filter((ev) => {
        return registered.includes(`${ev.id};${ev.year}`);
      });
    } else if (filterState === filterStates.saved && user) {
      filteredEvents = filteredEvents.filter((ev) => {
        return saved.includes(`${ev.id};${ev.year}`);
      });
    }

    filteredEvents = filteredEvents.filter((ev) => {
      return ev.ename.startsWith(searchField);
    });

    return filteredEvents;
  };

  const displayedEvents = useMemo(() => uiStateFilter(), [uiStateFilter, filterState, searchField, saved]);

  const fetchData = async () => {
    try {
      const { signInDetails } = await getCurrentUser();
      const email = signInDetails?.loginId;
      const user = await fetchBackend({ endpoint: `/users/${email}`, method: "GET" });
      const registeredEvents = await fetchBackend({ endpoint: `/registrations?email=${email}`, method: "GET" });
      setEmail(email ? email : "");
      setSaved(user["favedEventsID;year"] ? user["favedEventsID;year"] : []);
      setRegistered(
        registeredEvents.data.map((event: registeredEvent) => {
          return event["eventID;year"];
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleUiClick = (s: string) => {
    if (isCooldownRef.current) {
      //return
    } else {
      if (filterState != s) {
        setFilterState(s);
      } else {
        setFilterState("");
      }
      isCooldownRef.current = true;
      setTimeout(() => {
        isCooldownRef.current = false;
      }, 400);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchField(e.target.value);
  };

  return (
    <main className="bg-primary-color min-h-screen w-full">
      <div className="mx-auto pt-8 p-5 lg:pt-20 lg:l-20 lg:pr-20  flex flex-col">
        <span>
          <h2 className="text-white text-xl lg:text-[40px]">Event Dashboard</h2>
          <div className="flex items-center justify-between h-[40px]">
            <p className="text-baby-blue font-poppins">View and register for our events!</p>
          </div>
        </span>
        <div className="bg-navbar-tab-hover-bg h-[1px] my-4" />
        <div className="flex flex-row space-x-3">
          <div className="relative lg:mb-6 mb-3 w-full lg:w-[400px]">
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
            className={`bg-events-card-bg p-2 h-[46px] rounded-lg flex-row justify-center items-center space-x-1 px-20 shrink hidden lg:flex cursor-pointer ${
              filterState === filterStates.registered ? "!bg-events-baby-blue" : ""
            }`}
            onClick={() => handleUiClick(filterStates.registered)}
          >
            <ListIcon height={20} width={20} className={`${filterState === filterStates.registered ? "text-events-user-card-bg fill-current" : ""}`} />{" "}
            <p className={`${filterState === filterStates.registered ? "text-events-user-card-bg" : ""}`}>Registered</p>
          </div>
          <div
            className={`bg-events-card-bg p-2 h-[46px] rounded-lg flex-row justify-center items-center space-x-1 px-20 shrink hidden lg:flex cursor-pointer ${
              filterState === filterStates.saved ? "!bg-events-baby-blue" : ""
            }`}
            onClick={() => handleUiClick(filterStates.saved)}
          >
            <Bookmark height={20} width={20} className={`${filterState === filterStates.saved ? "text-events-user-card-bg fill-current" : ""}`} />
            <p className={`${filterState === filterStates.saved ? "text-events-user-card-bg" : ""}`}>Saved</p>
          </div>
        </div>
        <div className="flex flex-row space-x-3 mb-6 lg:hidden">
          <div
            className={`bg-events-card-bg p-2 h-[46px] rounded-lg flex-row justify-center items-center space-x-1 shrink flex grow lg:hidden cursor-pointer ${
              filterState === filterStates.registered ? "!bg-events-baby-blue" : ""
            }`}
            onClick={() => handleUiClick(filterStates.registered)}
          >
            <ListIcon height={20} width={20} className={`${filterState === filterStates.registered ? "text-events-user-card-bg fill-current" : ""}`} />
            <p className={`${filterState === filterStates.registered ? "text-events-user-card-bg" : ""}`}>Registered</p>
          </div>
          <div
            className={`bg-events-card-bg p-2 h-[46px] rounded-lg flex-row justify-center items-center space-x-1 shrink flex grow lg:hidden cursor-pointer ${
              filterState === filterStates.saved ? "!bg-events-baby-blue" : ""
            }`}
            onClick={() => handleUiClick(filterStates.saved)}
          >
            <Bookmark height={20} width={20} className={`${filterState === filterStates.saved ? "text-events-user-card-bg fill-current" : ""}`} />
            <p className={`${filterState === filterStates.saved ? "text-events-user-card-bg" : ""}`}>Saved</p>
          </div>
        </div>

        <EventDashboard events={displayedEvents} user={email} saved={saved} setSaved={setSaved} />
      </div>
    </main>
  );
}

// MOCKS FOR TESTING
let events = [
  {
    endDate: "2024-04-30T20:05:34.931Z",
    year: 2024,
    isPublished: true,
    partnerRegistrationQuestions: [],
    description: "asdf",
    feedback: "",
    createdAt: 1714507569426,
    ename: "all ui states applied",
    capac: 123,
    elocation: "asdf",
    imageUrl: "https://www.wikihow.com/images/thumb/d/db/Get-the-URL-for-Pictures-Step-2-Version-6.jpg/v4-460px-Get-the-URL-for-Pictures-Step-2-Version-6.jpg",
    id: "blueprint",
    deadline: "2024-09-29T20:05:34.931Z",
    partnerDescription: "asdf",
    isApplicationBased: false,
    startDate: "2024-09-30T20:05:34.931Z",
    pricing: { members: 0 },
    registrationQuestions: [],
    updatedAt: 1714507569426,
    latitude: 23.133333,
    longitude: 21.33333,
    isCompleted: false,
    facebookUrl: "idk doesnt matter",
    registrationStatus: false,
    registrationQuestion: null,
    hasDomainSpecificQuestions: false,
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
    imageUrl: "https://www.wikihow.com/images/thumb/d/db/Get-the-URL-for-Pictures-Step-2-Version-6.jpg/v4-460px-Get-the-URL-for-Pictures-Step-2-Version-6.jpg",
    id: "nonono",
    deadline: "2024-04-30T20:10:35.991Z",
    partnerDescription: "asdf",
    isApplicationBased: false,
    startDate: "2024-09-30T20:10:35.991Z",
    pricing: { members: 0 },
    registrationQuestions: [],
    updatedAt: 1714507851023,
    latitude: 23.133333,
    longitude: 21.33333,
    isCompleted: false,
    facebookUrl: "idk doesnt matter",
    registrationStatus: false,
    registrationQuestion: null,
    hasDomainSpecificQuestions: false,
  },
  {
    endDate: "2024-04-30T20:10:35.991Z",
    year: 2024,
    isPublished: true,
    partnerRegistrationQuestions: [],
    description: "asdf",
    feedback: "",
    createdAt: 1714507851023,
    ename: "calendar",
    capac: 123,
    elocation: "123",
    imageUrl: "https://www.wikihow.com/images/thumb/d/db/Get-the-URL-for-Pictures-Step-2-Version-6.jpg/v4-460px-Get-the-URL-for-Pictures-Step-2-Version-6.jpg",
    id: "calendar",
    deadline: "2024-04-30T20:10:35.991Z",
    partnerDescription: "asdf",
    isApplicationBased: false,
    startDate: "2024-07-30T20:10:35.991Z",
    pricing: { members: 0 },
    registrationQuestions: [],
    updatedAt: 1714507851023,
    latitude: 23.133333,
    longitude: 21.33333,
    isCompleted: false,
    facebookUrl: "idk doesnt matter",
    registrationStatus: false,
    registrationQuestion: null,
    hasDomainSpecificQuestions: false,
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
    imageUrl: "https://www.wikihow.com/images/thumb/d/db/Get-the-URL-for-Pictures-Step-2-Version-6.jpg/v4-460px-Get-the-URL-for-Pictures-Step-2-Version-6.jpg",
    id: "nonono",
    deadline: "2024-04-30T20:10:35.991Z",
    partnerDescription: "asdf",
    isApplicationBased: false,
    startDate: "2024-09-30T20:10:35.991Z",
    pricing: { members: 0 },
    registrationQuestions: [],
    updatedAt: 1714507851023,
    latitude: 23.133333,
    longitude: 21.33333,
    isCompleted: false,
    facebookUrl: "idk doesnt matter",
    registrationStatus: false,
    registrationQuestion: null,
    hasDomainSpecificQuestions: false,
  },
];

const registeredEvents = {
  size: 6,
  data: [
    {
      studentId: "52062585",
      isPartner: false,
      "eventID;year": "blueprint;2024",
      fname: "Alvin",
      basicInformation: {
        fname: "Alvin",
        lname: "Kam",
        gender: "He/Him/His",
        major: "BUCS",
        year: "4th Year",
        diet: "None",
        heardFrom: "Facebook",
        faculty: "Commerce",
      },
      registrationStatus: "checkedIn",
      dynamicResponses: {
        "1bd27ad9-32f7-4278-ae03-b0af326fa007": "3",
        "c312e39f-9f96-46e8-ab64-56e7bff8e84d": "21",
        "f53d5589-b107-458b-bbfb-be94ac783d55": "UBC",
      },
      scannedQRs: '["7fj2s-win-workshop-game-1"]',
      id: "alvin.kam.33@gmail.com",
      points: 170,
      updatedAt: 1674371855286,
    },
    {
      studentId: "52062585",
      "eventID;year": "calendar;2024",
      basicInformation: {
        fname: "Alvin",
        lname: "Kam",
        major: "BUCS",
        gender: "He/Him/His",
        year: "4th Year",
        diet: "None",
        heardFrom: "Instagram",
        faculty: "Commerce",
      },
      registrationStatus: "registered",
      dynamicResponses: {
        "739f9dc4-e18c-4c28-8d9a-7c989056086d": "21",
        "534d69c1-8085-459a-8a91-a49dbc650ceb": "UBC",
        "baae9339-6bdd-4530-b54c-d5bb24725441": "3",
      },
      id: "alvin.kam.33@gmail.com",
      updatedAt: 1666574281380,
    },
    {
      isPartner: false,
      "eventID;year": "data-and-beyond;2023",
      fname: "Alvin",
      basicInformation: {
        fname: "Alvin",
        lname: "Kam",
        gender: "Other/Prefer not to say",
        major: "asd",
        year: "5+ Year",
        diet: "None",
        heardFrom: "Instagram",
        faculty: "Science",
      },
      registrationStatus: "registered",
      dynamicResponses: {
        "0fe937d2-3e18-4541-8ae7-fcb144151fb8": "23",
        "5a7032ee-02c1-41f0-a6f0-11385afa2cad": "UBC",
        "a3f58578-219c-4e8f-b4be-8af8f6b9e1fb": ' "Data Science in the Retail Industry (Google Cloud)" by Google ',
        "d1a376b2-b434-4e36-9b4c-8efac0db5872": "5",
      },
      id: "alvin.kam.33@gmail.com",
      points: 25,
      updatedAt: 1678295602656,
    },
    {
      studentId: "52062585",
      "eventID;year": "hellohacks;2022",
      basicInformation: {
        fname: "Alvin",
        lname: "Kam",
        major: "BUCS",
        gender: "He/Him/His",
        year: "4th Year",
        diet: "None",
        heardFrom: "LinkedIn",
        faculty: "Commerce",
      },
      registrationStatus: "registered",
      dynamicResponses: {
        "2d1c1c89-ab3c-457b-9a28-58d101387b24": "k",
        "c13043cc-2590-49c7-be49-11c374371eb5": "23",
        "805706ed-6c15-4b98-91ed-440d44c2597e": "UBC",
        "d6a49b25-7099-436a-acc8-748b8b7f96ab": "2",
      },
      id: "alvin.kam.33@gmail.com",
      updatedAt: 1666631052027,
    },
    {
      studentId: "52062585",
      "eventID;year": "memberonly;2022",
      basicInformation: {
        fname: "Alvin",
        lname: "Kam",
        major: "BUCS",
        gender: "He/Him/His",
        year: "4th Year",
        diet: "None",
        heardFrom: "Friends/Word of Mouth",
        faculty: "Commerce",
      },
      registrationStatus: "registered",
      dynamicResponses: {
        "071f03b6-992f-46f2-b3da-3d9cda9d7161": "3",
        "62d55ca5-9b5e-44e0-84e0-52521dab63dd": "UBC",
        "cb2e810a-a85b-4949-9137-5a9b455e6e7c": "21",
      },
      id: "alvin.kam.33@gmail.com",
      updatedAt: 1666574323336,
    },
    {
      studentId: "52062585",
      "eventID;year": "misnight;2022",
      basicInformation: {
        fname: "Alvin",
        lname: "Kam",
        major: "BUCS",
        gender: "He/Him/His",
        year: "4th Year",
        diet: "None",
        heardFrom: "Instagram",
        faculty: "Commerce",
      },
      registrationStatus: "cancelled",
      dynamicResponses: {
        "6e204ff7-788a-4a28-a943-db1e82313d32": "1",
        "e562abe1-0bd0-4af8-95d2-0fd61e948e3f": "UBC",
        "63803309-f49f-44ed-81a0-4c0dd4e37cc2": "5",
      },
      id: "alvin.kam.33@gmail.com",
      updatedAt: 1661765426465,
    },
  ],
};

const user = {
  fname: "dennisma",
  education: "UBC",
  gender: "He/Him/His",
  year: "1st Year",
  admin: false,
  isMember: false,
  faculty: "Commerce",
  studentId: "12312312",
  createdAt: 1688446849036,
  lname: "ma",
  major: "asdf",
  diet: "Gluten Free",
  id: "dennis@asf.com",
  updatedAt: 1688446849036,
  "favedEventsID;year": ["blueprint;2024", "produhacks;2024"],
};

export async function getStaticProps() {
  // let events = await fetchBackend({ endpoint: "/events", method: "GET", authenticatedCall: false });

  events.sort((a: BiztechEvent, b: BiztechEvent) => {
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  events = events.filter((e: BiztechEvent) => {
    return e.isPublished;
  });

  return {
    props: {
      events,
    },
  };
}
