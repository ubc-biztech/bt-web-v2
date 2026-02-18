import EventCard from "@/components/EventCard/eventCard";
import MobileEventCard from "@/components/EventCard/mobileEventCard";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import { isMobile } from "@/util/isMobile";
import MobilePopup from "@/components/EventCard/popup/mobileEditPopUp";
import { BiztechEvent } from "@/types/types";
import { Button } from "@/components/ui/button";
import { fetchBackend } from "@/lib/db";
import Divider from "@/components/Common/Divider";
import { LayoutGrid, Rows3, ChevronLeft, ChevronRight } from "lucide-react";

const EVENTS_PER_PAGE = 10;

type Props = {
  events: BiztechEvent[] | null;
};

export type ModalHandlers = {
  handleEventDelete: () => void;
  handleEditEvent: () => void;
  handleViewAsMember: (eventID: string, eventYear: number) => void;
  handleViewRegistrations: (eventID: string, eventYear: number) => void;
};

export default function AdminEventView({ events }: Props) {
  const router = useRouter();
  const [isLoading, setLoading] = useState(!events);
  const [data, setData] = useState<BiztechEvent[] | null>(null);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [event, setEvent] = useState<BiztechEvent | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const eventsData = data ?? events;

  // Pagination logic
  const paginatedData = useMemo(() => {
    if (!eventsData) return [];
    const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
    return eventsData.slice(startIndex, startIndex + EVENTS_PER_PAGE);
  }, [eventsData, currentPage]);

  const totalPages = useMemo(() => {
    if (!eventsData) return 0;
    return Math.ceil(eventsData.length / EVENTS_PER_PAGE);
  }, [eventsData]);

  const handleEventDelete = () => {
    setIsDelete(true);
  };

  const handleEditEvent = () => {
    console.log("Edit button clicked");
  };

  const handleViewAsMember = (eventID: string, eventYear: number) => {
    router.push(`/event/${eventID}/${eventYear}/register`);
  };

  const handleViewRegistrations = (eventID: string, eventYear: number) => {
    router.push(`/admin/event/${eventID}/${eventYear}`);
  };

  // Update event click to navigate to registration table view
  const eventClick = (event: BiztechEvent, isOptionsClick: boolean = false) => {
    if (isOptionsClick) {
      // Only set popup state if clicking options button
      setEvent(event);
      setIsClicked(!isClicked);
    } else {
      // Navigate to registration table view when clicking card
      router.push(`/admin/event/${event.id}/${event.year}`);
    }
  };

  // Mobile event click handler
  const mobileEventClick = (event: BiztechEvent) => {
    setEvent(event);
    setIsClicked(true);
  };

  useEffect(() => {
    const userAgent = navigator.userAgent;
    setIsMobileDevice(isMobile(userAgent));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const fresh = await fetchBackend({
          endpoint: "/events",
          method: "GET",
          authenticatedCall: false,
        });

        fresh.sort(
          (a: BiztechEvent, b: BiztechEvent) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
        );

        setData(fresh);
      } catch (e) {
        console.error("Failed to refresh admin events", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main
      className="bg-bt-blue-600 min-h-screen"
      onClick={() => {
        if (isClicked) {
          setIsClicked(false);
        }
      }}
      onKeyDown={() => {}}
      role="presentation"
      tabIndex={-1}
    >
      <div className="mx-auto pt-8 flex flex-col">
        {/* Header Code and displaying view icons depending on device */}
        <span>
          {!isMobileDevice ? (
            <h2 className="text-white">Admin Event Portal</h2>
          ) : (
            <>
              <h3 className="text-white">Admin Event Portal</h3>
              <Divider />
            </>
          )}
          <div className="flex items-center justify-between">
            <p className="text-bt-blue-100">Manage published Biztech events.</p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className={`bg-transparent ${viewMode === "grid" ? "text-bt-green-300" : "text-white"}`}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid />
              </Button>
              <Button
                variant="ghost"
                className={`bg-transparent ${viewMode === "list" ? "text-bt-green-300" : "text-white"}`}
                onClick={() => setViewMode("list")}
              >
                <Rows3 />
              </Button>
            </div>
          </div>
        </span>
        {/*divider*/}
        <Divider className="mb-8" />
        {/* conditionally mapping the events gathered from the database to the screen  */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-white">Loading...</p>
          </div>
        ) : !isMobileDevice ? (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid md:grid-cols-2 gap-6"
                  : "flex flex-col gap-4"
              }
            >
              {paginatedData.map((event) => (
                <div
                  key={`${event.id}-${event.year}`}
                  className={viewMode === "list" ? "w-full" : ""}
                >
                  <EventCard
                    event={event}
                    eventClick={eventClick}
                    modalHandlers={{
                      handleViewRegistrations: handleViewRegistrations,
                      handleEventDelete: handleEventDelete,
                      handleEditEvent: () =>
                        router.push(
                          `/admin/event/${event.id}/${event.year}/edit`,
                        ),
                      handleViewAsMember: handleViewAsMember,
                    }}
                    viewMode={viewMode}
                  />
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="ghost"
                  className="text-white bg-bt-blue-400 disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <span className="text-white">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="ghost"
                  className="text-white bg-bt-blue-400 disabled:opacity-50"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="block md:grid md:grid-cols-2 md:gap-6">
              {paginatedData.map((event) => (
                <MobileEventCard
                  key={`${event.id}-${event.year}`}
                  event={event}
                  eventClick={mobileEventClick}
                  modalHandlers={{
                    handleViewRegistrations: handleViewRegistrations,
                    handleEventDelete: handleEventDelete,
                    handleEditEvent: () =>
                      router.push(
                        `/admin/event/${event.id}/${event.year}/edit`,
                      ),
                    handleViewAsMember: handleViewAsMember,
                  }}
                  viewMode={viewMode}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="ghost"
                  className="text-white bg-bt-blue-400 disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-white text-sm">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  className="text-white bg-bt-blue-400 disabled:opacity-50"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
        {/* 'edit event' pop up */}
        {/* MobilePopup contains the delete popup which is used for both desktop and mobile * see file for more info * */}
        <div
          className={
            isClicked && (isMobileDevice || isDelete)
              ? "fixed inset-0 flex items-center justify-center z-50 bg-bt-blue-700/50 bg-opacity-50 backdrop-blur-md"
              : ""
          }
        >
          <MobilePopup
            isClicked={isClicked}
            isMobile={isMobileDevice}
            isDelete={isDelete}
            event={event!}
            setIsDelete={setIsDelete}
            modalHandlers={{
              handleViewRegistrations: handleViewRegistrations,
              handleEventDelete: handleEventDelete,
              handleEditEvent: handleEditEvent,
              handleViewAsMember: handleViewAsMember,
            }}
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

    return {
      props: {
        events,
      },
    };
  } catch (error) {
    return {
      props: {
        events: [],
      },
    };
  }
}
