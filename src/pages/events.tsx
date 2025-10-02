import { EventDashboard } from "@/components/EventsDashboard/EventDashboard";
import { FilterTab } from "@/components/EventsDashboard/FilterTab";
import GuestBanner from "@/components/EventsDashboard/GuestBanner";
import { SearchBar } from "@/components/EventsDashboard/SearchBar";
import { fetchUserAttributes } from "@aws-amplify/auth";
import { fetchBackend } from "@/lib/db";
import { BiztechEvent } from "@/types/types";
import { AuthError } from "@aws-amplify/auth";
import { ListIcon } from "lucide-react";
import React, {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PageHeader from "@/components/Common/PageHeader";
import Divider from "@/components/Common/Divider";

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
  const [signedIn, setSignedIn] = useState<boolean>(true);
  const [searchField, setSearchField] = useState("");
  const [filterState, setFilterState] = useState(filterStates.all);
  const isCooldownRef = useRef(false);

  const [allEvents, setAllEvents] = useState<BiztechEvent[]>(events);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(!events?.length);

  const [saved, setSaved] = useState<string[]>([]);
  const [registered, setRegistered] = useState<string[]>([]);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        let fresh = await fetchBackend({
          endpoint: "/events",
          method: "GET",
          authenticatedCall: false,
        });

        fresh.sort(
          (a: BiztechEvent, b: BiztechEvent) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
        );
        fresh = fresh.filter(
          (e: BiztechEvent) => e.isPublished && e.id !== "alumni-night",
        );

        setAllEvents(fresh);
      } catch (e) {
        console.error("Failed to refresh events on client", e);
      } finally {
        setLoadingEvents(false);
      }
    })();
  }, []);

  const displayedEvents = useMemo(() => {
    let filtered: BiztechEvent[] = allEvents;

    if (filterState === filterStates.saved) {
      filtered = filtered.filter((ev) => saved.includes(`${ev.id};${ev.year}`));
    }

    if (searchField.trim()) {
      const q = searchField.toLowerCase();
      filtered = filtered.filter((ev) =>
        (ev.ename || "").toLowerCase().includes(q),
      );
    }

    return filtered;
  }, [allEvents, filterState, searchField, saved]);

  const fetchData = async () => {
    try {
      const attributes = await fetchUserAttributes();
      const email = attributes.email;

      if (!email) {
        throw new Error("Email not found in user attributes.");
      }

      const userData = await fetchBackend({
        endpoint: `/users/${email}`,
        method: "GET",
      });
      const registeredEvents = await fetchBackend({
        endpoint: `/registrations?email=${email}`,
        method: "GET",
      });

      setEmail(email);
      setSaved(userData["favedEventsID;year"] ?? []);
      setRegistered(
        registeredEvents?.data?.map(
          (event: registeredEvent) => event["eventID;year"],
        ) ?? [],
      );
    } catch (e) {
      if (e instanceof AuthError && e.name === "UserUnAuthenticatedException") {
        setSignedIn(false);
      } else {
        console.error("Error in fetchData:", e);
      }
    }
  };

  const handleUiClick = (s: string) => {
    if (isCooldownRef.current) {
      // return
    } else {
      setFilterState((prev) => (prev !== s ? s : filterStates.all));
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
    <main className="bg-bt-blue-600 min-h-screen w-full">
      <div className="w-full">
        {!signedIn && (
          <GuestBanner message="To keep your saved events or view your registered events you need to be signed in." />
        )}
        <div className="flex flex-col">
          <PageHeader
            title="Event Dashboard"
            subtitle="Check out our latest & upcoming events!"
          />
          <Divider />

          <div className="flex flex-row gap-x-3 space-y-3 flex-wrap md:flex-nowrap mb-8">
            <SearchBar handleChange={handleChange} searchField={searchField} />
            <div className="flex flex-row flex-nowrap w-full gap-x-3">
              <FilterTab
                title="All Events"
                filter={filterStates.all}
                filterState={filterState}
                handleUiClick={handleUiClick}
                Icon={ListIcon}
              />
              {/* TODO: awaiting backend API fix */}
              {/* {signedIn && <FilterTab title="Saved" filter={filterStates.saved} filterState={filterState} handleUiClick={handleUiClick} Icon={Bookmark} />} */}
            </div>
          </div>

          {loadingEvents ? (
            <div className="text-[20px] text-white flex-row items-center">
              Loading events...
            </div>
          ) : displayedEvents.length === 0 ? (
            <div className="text-[20px] text-white flex-row items-center">
              No events found...
            </div>
          ) : null}

          <EventDashboard
            events={displayedEvents}
            user={email}
            saved={saved}
            registered={registered}
            setSaved={setSaved}
          />
        </div>
      </div>
    </main>
  );
}

export async function getStaticProps() {
  try {
    let events = await fetchBackend({
      endpoint: "/events",
      method: "GET",
      authenticatedCall: false,
    });

    events.sort((a: BiztechEvent, b: BiztechEvent) => {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    events = events.filter(
      (e: BiztechEvent) => e.isPublished && e.id !== "alumni-night", // temp filter
    );

    return {
      props: { events },
    };
  } catch (error) {
    return { props: { events: [] } };
  }
}
