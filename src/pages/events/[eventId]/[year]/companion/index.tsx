import React from "react";
import { fetchUserAttributes } from "@aws-amplify/auth";
import { useState, useEffect } from "react";
import { fetchBackend } from "@/lib/db";
import { useRouter } from "next/router";
import Link from "next/link";
import CompanionHome from "@/components/companion/CompanionHome";
import type { Event } from "@/constants/companion-events";
import { COMPANION_EMAIL_KEY } from "@/constants/companion";
import { getCompanionByEventIdYear } from "@/lib/companionHelpers";
import {
  UserRegistrationContext,
  type Registration,
} from "@/pages/companion";

interface EventData {
  id: string;
  year: number;
  isCompleted?: boolean;
  feedback?: string;
  [key: string]: any;
}

const DynamicCompanion = () => {
  const router = useRouter();
  const { eventId, year } = router.query;
  const [email, setEmail] = useState("");
  const [pageError, setPageError] = useState("");
  const [error, setError] = useState("");
  const [event, setEvent] = useState<EventData | null>(null);
  const [userRegistration, setUserRegistration] = useState<Registration | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [companion, setCompanion] = useState<Event | null>(null);

  const [
    showKickstartRegistrationMessage,
    setShowKickstartRegistrationMessage,
  ] = useState(false);

  // Validate URL parameters
  useEffect(() => {
    if (!router.isReady) return;

    if (!eventId || !year) {
      setPageError("Invalid event URL");
      setIsLoading(false);
      return;
    }

    // Check if companion exists for this event
    const companionConfig = getCompanionByEventIdYear(
      eventId as string,
      parseInt(year as string),
    );

    if (!companionConfig) {
      setPageError("No companion available for this event");
      setIsLoading(false);
      return;
    }

    setCompanion(companionConfig);
  }, [router.isReady, eventId, year]);

  const fetchUserData = async () => {
    console.log("[DynamicCompanion] Fetching user data for:", { eventId, year, email });
    setIsLoading(true);
    setError("");

    try {
      const [regResMain, eventDataMain] = await Promise.all([
        fetchBackend({
          endpoint: `/registrations?eventID=${eventId}&year=${year}&email=${email}`,
          method: "GET",
        }),
        fetchBackend({
          endpoint: `/events/${eventId}/${year}`,
          method: "GET",
          authenticatedCall: false,
        }),
      ]);
      console.log("[DynamicCompanion] Main event fetch results:", { regResMain, eventDataMain });

      let regResShowcase = { data: [] };
      let eventDataShowcase = null;

      if (eventId === "kickstart") {
        [regResShowcase, eventDataShowcase] = await Promise.all([
          fetchBackend({
            endpoint: `/registrations?eventID=${eventId}-showcase&year=${year}&email=${email}`,
            method: "GET",
          }),
          fetchBackend({
            endpoint: `/events/${eventId}-showcase/${year}`,
            method: "GET",
            authenticatedCall: false,
          }),
        ]);
      }

      const regRes = regResMain.data[0]
        ? regResMain.data[0]
        : regResShowcase.data[0];
      const eventData = regResMain.data[0] ? eventDataMain : eventDataShowcase;

      console.log("reg data", regRes);
      console.log("event data", eventData);

      if (!regRes) {
        if (eventId === "kickstart") {
          setShowKickstartRegistrationMessage(true);
          setIsLoading(false);
          return;
        }
        console.log("No registration found for email:", email);
        setPageError("You must register for this event first");
        setError(
          "You don't have a valid registration for this event. Please register to access the companion.",
        );
        setIsLoading(false);
        return;
      }

      setUserRegistration(regRes);
      setEvent(eventData);
      localStorage.setItem(COMPANION_EMAIL_KEY, regRes.id);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("An error occurred while fetching your data.");
      setPageError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        const session = await fetchUserAttributes();
        const savedEmail = session?.email;
        if (!savedEmail) {
          throw new Error("No email found in session");
        }
        setEmail(savedEmail);
      } catch (err) {
        console.log("Auth check failed:", err);
        router.push(
          `/login?redirect=/events/${eventId}/${year}/companion`,
        );
        return;
      }
    };

    if (router.isReady && companion) {
      initializeData();
    }
  }, [router.isReady, companion, eventId, year]);

  useEffect(() => {
    if (email && !userRegistration && !error && companion) {
      fetchUserData();
    }
    if (error) {
      setIsLoading(false);
    }
  }, [email, router, userRegistration, companion]);

  if (isLoading) {
    const backgroundColor = companion?.options?.colors?.background || "#111111";
    return (
      <div
        className="w-screen h-screen flex items-center justify-center text-white"
        style={{ background: backgroundColor }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading companion...</p>
        </div>
      </div>
    );
  }

  const backgroundColor = companion?.options?.colors?.background || "#111111";

  if (showKickstartRegistrationMessage) {
    return (
      <div
        className="w-screen h-screen flex items-center justify-center text-white"
        style={{ background: backgroundColor }}
      >
        <div className="text-center max-w-2xl px-4">
          <h1 className="text-3xl font-bold mb-6">Registration Not Found</h1>
          <p className="text-lg mb-8">
            If you want to check your status go to{" "}
            <Link
              href="/event/kickstart/2025/register"
              className="text-bt-green-300 hover:underline"
            >
              Kickstart Registration
            </Link>
            . If you want to register for Showcase go to{" "}
            <Link
              href="/event/kickstart-showcase/2025/register"
              className="text-bt-green-300 hover:underline"
            >
              Showcase Registration
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div
        className="w-screen h-screen flex items-center justify-center text-white"
        style={{ background: backgroundColor }}
      >
        <div className="text-center max-w-2xl px-4">
          <h1 className="text-3xl font-bold mb-6">{pageError}</h1>
          {error && <p className="text-lg mb-8">{error}</p>}
          {pageError === "You must register for this event first" && (
            <div className="space-y-4">
              <Link
                href={`/event/${eventId}/${year}/register`}
                className="inline-block bg-bt-green-300 hover:bg-bt-green-400 text-black font-bold py-3 px-6 rounded"
              >
                Register for this Event
              </Link>
              <br />
              <Link
                href="/events"
                className="inline-block text-bt-green-300 hover:underline mt-4"
              >
                View All Events
              </Link>
            </div>
          )}
          {pageError === "No companion available for this event" && (
            <div className="space-y-4">
              <p className="text-lg mb-4">
                This event doesn't have a companion app.
              </p>
              <Link
                href="/events"
                className="inline-block bg-bt-green-300 hover:bg-bt-green-400 text-black font-bold py-3 px-6 rounded"
              >
                View All Events
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!companion) {
    return (
      <div
        className="w-screen h-screen flex items-center justify-center text-white"
        style={{ background: "#111111" }}
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">Event Not Found</h1>
          <Link
            href="/events"
            className="inline-block bg-bt-green-300 hover:bg-bt-green-400 text-black font-bold py-3 px-6 rounded"
          >
            View All Events
          </Link>
        </div>
      </div>
    );
  }

  // Don't render companion until userRegistration is loaded
  if (!userRegistration) {
    return (
      <div
        className="w-screen h-screen flex items-center justify-center text-white"
        style={{ background: backgroundColor }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: backgroundColor }}>
      <UserRegistrationContext.Provider value={{ userRegistration }}>
        <CompanionHome ChildComponent={companion.ChildComponent} />
      </UserRegistrationContext.Provider>
    </div>
  );
};

export default DynamicCompanion;
