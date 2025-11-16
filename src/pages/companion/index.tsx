import React from "react";
import { fetchAuthSession, fetchUserAttributes } from "@aws-amplify/auth";

// COMMENTED OUT - Original companion functionality
import { useState, useEffect, useContext, createContext } from "react";
import { fetchBackend } from "@/lib/db";
import { useRouter } from "next/router";
import CompanionHome from "@/components/companion/CompanionHome";
import Events from "@/constants/companion-events";
import type { Event } from "@/constants/companion-events";
import Loading from "@/components/Loading";
import { COMPANION_EMAIL_KEY } from "@/constants/companion";

export interface Registration {
  id: string;
  fname: string;
  points?: number;
  isPartner?: boolean;
  teamID?: string;
  [key: string]: any;
}

interface EventData {
  id: string;
  year: number;
  isCompleted?: boolean;
  feedback?: string;
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
  // COMMENTED OUT - Original companion logic
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pageError, setPageError] = useState("");
  const [error, setError] = useState("");
  const [event, setEvent] = useState<EventData | null>(null);
  const [userRegistration, setUserRegistration] = useState<Registration | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  const events = Events.sort((a, b) => {
    return b.activeUntil.getTime() - a.activeUntil.getTime();
  });

  const currentEvent: Event | undefined =
    events.find((event) => {
      const today = new Date();
      return event.activeUntil > today;
    }) || events[0];

  const { eventID, year } = currentEvent || {};

  const fetchUserData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [registrationResponse, eventData] = await Promise.all([
        fetchBackend({
          endpoint: `/registrations?eventID=${eventID}&year=${year}&email=${email}`,
          method: "GET",
          authenticatedCall: false,
        }),
        fetchBackend({
          endpoint: `/events/${eventID}/${year}`,
          method: "GET",
          authenticatedCall: false,
        }),
      ]);

      const reg = registrationResponse.data[0];
      console.log("Fetched registration:", reg);
      if (!reg) {
        console.log("No registration found for email:", email);
        setPageError("No registration found for email.");
        setError("This email does not match an existing entry in our records.");
        setIsLoading(false);
        return;
      }

      setUserRegistration(reg);
      setEvent(eventData);
      localStorage.setItem(COMPANION_EMAIL_KEY, reg.id);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("An error occurred while fetching your data.");
      setPageError("Error: Registration not found.");
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
        setIsLoading(false);
      } catch (err) {
        console.log("Auth check failed:", err);
        router.push("/login?redirect=/companion");
        return;
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (email && !userRegistration && !error) {
      fetchUserData();
    }
    if (error) {
      setIsLoading(false);
    }
  }, [email, router, userRegistration]);

  // if (isLoading) return <Loading />;

  if (pageError) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div>
          A page error occurred, please refresh the page. If the problem
          persists, contact a BizTech exec for support.
        </div>
      </div>
    );
  }

  return (
    <UserRegistrationContext.Provider value={{ userRegistration }}>
      <CompanionHome ChildComponent={currentEvent.ChildComponent} />
    </UserRegistrationContext.Provider>
  );

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
