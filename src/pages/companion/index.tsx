import React from "react";
import { fetchUserAttributes } from "@aws-amplify/auth";
import { useState, useEffect, useContext, createContext } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { getLatestRegisteredEvent } from "@/lib/companionHelpers";

export interface Registration {
  id: string;
  fname: string;
  points?: number;
  isPartner?: boolean;
  teamID?: string;
  [key: string]: any;
}

interface UserRegistrationContextType {
  userRegistration: Registration | null;
}

export const UserRegistrationContext =
  createContext<UserRegistrationContextType | null>(null);

export const useUserRegistration = () => {
  const context = useContext(UserRegistrationContext);
  if (!context) {
    throw new Error(
      "useUserRegistration must be used within a UserRegistrationProvider",
    );
  }
  return context;
};

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
            `/events/${latestEvent.eventId}/${latestEvent.year}/companion`,
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

  // WORK IN PROGRESS PAGE - Similar design to registration success page
  // return (
  //   <div className="bg-bt-blue-600 text-white min-h-screen p-8">
  //     <div className="max-w-4xl mx-auto">
  //       <h1 className="text-white text-4xl font-bold mb-4">Work in Progress</h1>

  //       <div className="rounded-lg p-6 mb-8">
  //         <p className="mb-2 text-white">
  //           The companion app is currently under development! For those checking
  //           their application status, you will be informed via email for the
  //           duration of HelloHacks. We sincerely apologize for any confusion
  //           this may have caused.
  //         </p>
  //         <p className="mb-4 text-white">
  //           We&apos;re working hard to bring you an amazing experience.
  //           You&apos;ll be notified via email when it&apos;s ready to use.
  //         </p>
  //         <p className="font-semibold text-white">
  //           Thank you for your patience as we build something great for you!
  //         </p>
  //       </div>

  //       <div className="text-white rounded-lg">
  //         <h2 className="text-white text-3xl font-bold mb-4">
  //           What&apos;s coming?
  //         </h2>
  //         <div className="space-y-2 text-white">
  //           <p>• Interactive event companion features</p>
  //           <p>• Real-time event updates and notifications</p>
  //           <p>• Enhanced networking and connection tools</p>
  //           <p>• Personalized event experience</p>
  //         </div>
  //       </div>
  //     </div>

  //     <div className="fixed bottom-4 right-4 flex flex-col items-end sm:flex-row sm:items-center">
  //       <div className="bg-bt-blue-100 text-black p-3 sm:p-4 rounded-lg shadow-lg mb-2 sm:mb-0 sm:mr-4 max-w-[80vw] sm:max-w-none">
  //         <p className="font-semibold text-sm sm:text-base">
  //           Stay tuned for updates!
  //         </p>
  //       </div>
  //     </div>

  //     {/* ProductX branding at bottom */}
  //     <div className="absolute bottom-0 w-screen h-[45vh] z-10">
  //       <Image
  //         src={ProdxBizBot}
  //         alt="ProdxBizBot"
  //         className="object-contain object-bottom"
  //         fill
  //         priority
  //       />
  //     </div>
  //   </div>
  //   );
};

export default Companion;
