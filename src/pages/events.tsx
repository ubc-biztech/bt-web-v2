import { EventDashboard } from "@/components/EventsDashboard/EventDashboard";
import { FilterTab } from "@/components/EventsDashboard/FilterTab";
import GuestBanner from "@/components/EventsDashboard/GuestBanner";
import { SearchBar } from "@/components/EventsDashboard/SearchBar";
import { fetchBackend } from "@/lib/db";
import { BiztechEvent } from "@/types/types";
import { AuthError, getCurrentUser } from "@aws-amplify/auth";
import { ListIcon, Bookmark } from "lucide-react";
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
  saved: "saved"
};

export default function Page({ events }: EventProps) {
  const [signedIn, setSignedIn] = useState<boolean>(true);
  const [searchField, setSearchField] = useState("");
  const [filterState, setFilterState] = useState(filterStates.all);
  const isCooldownRef = useRef(false);
  // these useStates will be empty arrays by default, but currently have mocks before i verify backend integration works
  const [saved, setSaved] = useState<string[]>([]);
  const [registered, setRegistered] = useState<string[]>([]);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const uiStateFilter = () => {
    let filteredEvents: BiztechEvent[] = events;
    if (filterState === filterStates.saved) {
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
        registeredEvents
          ? registeredEvents.data.map((event: registeredEvent) => {
              return event["eventID;year"];
            })
          : []
      );
    } catch (e) {
      if (e instanceof AuthError && e.name === "UserUnAuthenticatedException") {
        setSignedIn(false);
      } else {
        console.error(e);
      }
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
    <main className='bg-primary-color min-h-screen w-full'>
      <div className='w-full'>
        {!signedIn && <GuestBanner message='To keep your saved events or view your registered events you need to be signed in.' />}
        <div className='mx-auto pt-9 md:px-20 px-5 flex flex-col'>
          <span>
            <h2 className='text-white text-xl lg:text-[40px]'>Event Dashboard</h2>
            <div className='flex items-center justify-between h-[40px]'>
              <p className='text-baby-blue font-poppins'>View and register for our events!</p>
            </div>
          </span>
          <div className='bg-navbar-tab-hover-bg h-[1px] my-4' />
          <div className='flex flex-row gap-x-3 space-y-3 flex-wrap md:flex-nowrap mb-8'>
            <SearchBar handleChange={handleChange} searchField={searchField} />
            <div className='flex flex-row flex-nowrap w-full gap-x-3'>
              <FilterTab
                title='All Events'
                filter={filterStates.all}
                filterState={filterState}
                handleUiClick={handleUiClick}
                Icon={ListIcon}
              />
              {/* TODO: awaiting backend API fix */}
              {/* {signedIn && <FilterTab title="Saved" filter={filterStates.saved} filterState={filterState} handleUiClick={handleUiClick} Icon={Bookmark} />} */}
            </div>
          </div>

          {displayedEvents.length === 0 ? <div className='text-[20px] text-white flex-row items-center'>No events found...</div> : <></>}
          <EventDashboard events={displayedEvents} user={email} saved={saved} registered={registered} setSaved={setSaved} />
        </div>
      </div>
    </main>
  );
}

export async function getStaticProps() {
  try {
    let events = await fetchBackend({ endpoint: "/events", method: "GET", authenticatedCall: false });

    events.sort((a: BiztechEvent, b: BiztechEvent) => {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    events = events.filter((e: BiztechEvent) => {
      return e.isPublished;
    });

    return {
      props: {
        events
      }
    };
  } catch (error) {
    return {
      props: {
        events: []
      }
    };
  }
}
