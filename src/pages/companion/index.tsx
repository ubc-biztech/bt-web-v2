import React from "react";
import { fetchUserAttributes } from "@aws-amplify/auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { getLatestRegisteredEvent } from "@/lib/companionHelpers";


/* 
  This page is the entry point for the companion. It checks if the user is logged in and redirects to the latest registered event with a companion.
  If the user is not logged in, it redirects to the login page.
  If the user is logged in but has no registered events with companions, it shows a message to browse events.
  If the user is logged in and has registered events with companions, it redirects to the latest registered event with a companion.
*/

const Companion = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [noEventsMessage, setNoEventsMessage] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const session = await fetchUserAttributes();
        const savedEmail = session?.email;
        if (!savedEmail) {
          throw new Error("No email found in session");
        }

        // Try to redirect to user's latest registered event with companion
        const latestEvent = await getLatestRegisteredEvent(savedEmail);
        if (latestEvent) {
          router.push(
            `/companion/${latestEvent.eventId}/${latestEvent.year}`,
          );
          return;
        }

        // If no registered events with companions, show message
        setNoEventsMessage(true);
        setIsLoading(false);
      } catch (err) {
        console.log("Auth check failed:", err);
        router.push("/login?redirect=/companion");
        return;
      }
    };

    initializeData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#111111] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Redirecting to companion...</p>
        </div>
      </div>
    );
  }

  if (noEventsMessage) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#111111] text-white">
        <div className="text-center max-w-2xl px-4">
          <h1 className="text-3xl font-bold mb-6">No Events Found</h1>
          <p className="text-lg mb-8">
            You don&apos;t have any registered events with companions yet.
          </p>
          <Link
            href="/events"
            className="inline-block bg-bt-green-300 hover:bg-bt-green-400 text-black font-bold py-3 px-6 rounded"
          >
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  // Should never reach here as we either redirect or show a message
  return null;
};

export default Companion;
