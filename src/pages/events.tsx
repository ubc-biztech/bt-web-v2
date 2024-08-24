import { EventDashboard } from "@/components/EventsDashboard/EventDashboard";
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
  all: "all",
  saved: "saved",
};

export default function Page({ events }: EventProps) {
  const [searchField, setSearchField] = useState("");
  const [filterState, setFilterState] = useState("all");
  const isCooldownRef = useRef(false);
  // these useStates will be empty arrays by default, but currently have mocks before i verify backend integration works
  const [saved, setSaved] = useState<string[]>([]);
  const [registered, setRegistered] = useState<string[]>([]);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    console.log(events);
    fetchData();
  }, []);

  const uiStateFilter = () => {
    let filteredEvents: BiztechEvent[] = events;
    if (filterState === filterStates.saved && email) {
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
        setFilterState(filterStates.all);
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
    <main className="bg-primary-color h-screen w-full overflow-auto">
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
              filterState === filterStates.all ? "!bg-events-baby-blue" : ""
            }`}
            onClick={() => handleUiClick(filterStates.all)}
          >
            <ListIcon height={20} width={20} className={`${filterState === filterStates.all ? "text-events-user-card-bg fill-current" : ""}`} />{" "}
            <p className={`${filterState === filterStates.all ? "text-events-user-card-bg" : ""} text-nowrap`}>All Events</p>
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
              filterState === filterStates.all ? "!bg-events-baby-blue" : ""
            }`}
            onClick={() => handleUiClick(filterStates.all)}
          >
            <ListIcon height={20} width={20} className={`${filterState === filterStates.all ? "text-events-user-card-bg fill-current" : ""}`} />
            <p className={`${filterState === filterStates.all ? "text-events-user-card-bg" : ""} text-nowrap`}>All Events</p>
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

        <EventDashboard events={displayedEvents} user={email} saved={saved} registered={registered} setSaved={setSaved} />
      </div>
    </main>
  );
}

export async function getStaticProps() {
  let events = await fetchBackend({ endpoint: "/events", method: "GET", authenticatedCall: false });

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
