import React from "react";
import Image from "next/image";
import BigProdX from "@/assets/2025/productx/biglogo.png";
import ProdxBizBot from "@/assets/2025/productx/prodxbizbot.png";

// COMMENTED OUT - Original companion functionality
import { useState, useEffect, useContext, createContext } from "react";
import { fetchBackend } from "@/lib/db";
import { useRouter } from "next/router";
import CompanionHome from "@/components/companion/CompanionHome";
import { motion } from "framer-motion";
import Events from "@/constants/companion-events";
import type { Event } from "@/constants/companion-events";
import Loading from "@/components/Loading";
import {
  COMPANION_EMAIL_KEY,
  COMPANION_PROFILE_ID_KEY,
} from "@/constants/companion";
import { Badge } from "./badges";
import { Loader2 } from "lucide-react";

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
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [event, setEvent] = useState<EventData | null>(null);
  const [userRegistration, setUserRegistration] = useState<Registration | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [decodedRedirect, setDecodedRedirect] = useState("");
  const [input, setInput] = useState("");
  const [connections, setConnections] = useState([]);
  const [badges, setBadges] = useState(null);
  const [completedBadges, setCompletedBadges] = useState(0);

  const events = Events.sort((a, b) => {
    return b.activeUntil.getTime() - a.activeUntil.getTime();
  });

  const currentEvent: Event | undefined =
    events.find((event) => {
      const today = new Date();
      return event.activeUntil > today;
    }) || events[0];

  const { eventID, year } = currentEvent || {};

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const transition = {
    duration: 0.6,
    ease: [0.6, -0.05, 0.01, 0.99],
  };

  // Styles
  const styles = {
    container:
      "min-h-screen w-screen bg-[#020319] relative overflow-hidden flex items-center justify-center",
    card: "flex justify-center items-center min-h-screen overflow-hidden border-none bg-transparent relative z-10",
    blueOrb:
      "absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl",
    purpleOrb:
      "absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl",
    contentWrapper: "w-full max-w-2xl px-4",
    logoWrapper: "w-full flex justify-center relative",
    logoGlow:
      "absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-lg blur-xl",
    logo: "w-1/2 sm:w-3/5 mb-5 relative",
    title: "text-2xl font-bold mb-2 text-white font-satoshi",
    description: "text-center mb-4 text-white p1 font-satoshi",
    input:
      "mb-4 w-64 font-satoshi text-white backdrop-blur-sm bg-white/5 border-white/10 transition-all duration-300 focus:bg-white/10 focus:border-white/20",
    button:
      "mb-4 font-satoshi relative overflow-hidden bg-[#1E88E5] hover:bg-[#1976D2] text-white px-8 py-2 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(30,136,229,0.3)] hover:shadow-[0_0_20px_rgba(30,136,229,0.5)]",
    buttonShine:
      "absolute inset-0 transform bg-gradient-to-r from-[#1E88E5] hover:from-[#1976D2] via-white/20 hover:to-[#1976D2] to-[#1E88E5]",
    error: "text-red-500 text-center w-4/5 font-satoshi",
  };

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
      if (!reg) {
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
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const initializeData = async () => {
      const savedEmail = localStorage.getItem(COMPANION_EMAIL_KEY);
      if (savedEmail) {
        setEmail(savedEmail);
      }
      setIsLoading(false);
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (email && !userRegistration) {
      fetchUserData();
    }
  }, [email, router.isReady]);

  if (isLoading) return <Loading />;

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

  if (!email || !userRegistration) {
    return (
      <div className={styles.container}>
        {!isLoading && (
          <>
            <motion.div
              key="email"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={transition}
              className="flex flex-col items-center w-full max-w-sm z-20"
            >
              <Image
                src={BigProdX}
                alt="ProductX Logo"
                width={315}
                height={100}
                className="mb-4"
              />
              <p className="text-center font-ibm text-white text-sm mb-4">
                Enter your email or access code to get started.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setEmail(input);
                }}
                className="w-full"
              >
                <input
                  type="email"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Start Typing Here..."
                  className="w-full p-3 font-ibm bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#898BC3]"
                />
              </form>
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-red-500 text-center mt-4"
                >
                  {error}
                </motion.p>
              )}
            </motion.div>
            <motion.div
              key="bizbot"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 w-screen h-[45vh] z-10"
            >
              <Image
                src={ProdxBizBot}
                alt="ProdxBizBot"
                className="object-contain object-bottom"
                fill
                priority
              />
            </motion.div>
          </>
        )}
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
