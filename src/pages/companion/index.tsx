import { useState, useEffect } from "react";
import { fetchBackend } from "@/lib/db";
import { useRouter } from "next/router";
import CompanionHome from "@/components/companion/CompanionHome";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import Events from "@/constants/companion-events";
import type { Event } from "@/constants/companion-events";
import Loading from "@/components/Loading";
import { COMPANION_EMAIL_KEY, COMPANION_PROFILE_ID_KEY } from "@/constants/companion";
import { Badge } from "./badges";
import { Loader2 } from "lucide-react";

interface Registration {
  id: string;
  fname: string;
  points?: number;
  isPartner?: boolean;
  [key: string]: any;
}

interface EventData {
  id: string;
  year: number;
  isCompleted?: boolean;
  feedback?: string;
  [key: string]: any;
}

const Companion = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pageError, setPageError] = useState("");
  const [error, setError] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [event, setEvent] = useState<EventData | null>(null);
  const [userRegistration, setUserRegistration] = useState<Registration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [decodedRedirect, setDecodedRedirect] = useState("");
  const [input, setInput] = useState("");
  const [connections, setConnections] = useState([]);
  const [badges, setBadges] = useState(null);
  const [completedBadges, setCompletedBadges] = useState(0);

  const events = Events.sort((a, b) => {
    return a.activeUntil.getTime() - b.activeUntil.getTime();
  });

  const currentEvent: Event | undefined =
    events.find((event) => {
      const today = new Date();
      return event.activeUntil > today;
    }) || events[0];

  const { eventID, year } = currentEvent || {};

  // Animation variants
  const fadeInUpVariant = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.8,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  };

  const backgroundOrbVariants = {
    blue: {
      animate: {
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
        y: [0, -20, 0]
      },
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    purple: {
      animate: {
        scale: [1.2, 1, 1.2],
        opacity: [0.4, 0.6, 0.4],
        y: [0, 20, 0]
      },
      transition: {
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const shineAnimation = {
    animate: {
      x: ["-100%", "100%"]
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear",
      repeatDelay: 0.5
    },
    whileHover: {
      x: "0%" // Stops the animation on hover
    }
  };

  const logoGlowAnimation = {
    animate: {
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
    },
    transition: {
      duration: 15,
      repeat: Infinity,
      ease: "linear"
    }
  };

  // Styles
  const styles = {
    container: "min-h-screen w-screen bg-gradient-to-b from-[#040C12] to-[#030608] relative overflow-hidden",
    card: "flex justify-center items-center min-h-screen overflow-hidden border-none bg-transparent relative z-10",
    blueOrb: "absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl",
    purpleOrb: "absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl",
    contentWrapper: "w-full max-w-2xl px-4",
    logoWrapper: "w-full flex justify-center relative",
    logoGlow: "absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-lg blur-xl",
    logo: "w-1/2 sm:w-3/5 mb-5 relative",
    title: "text-2xl font-bold mb-2 text-white font-satoshi",
    description: "text-center mb-4 text-white p1 font-satoshi",
    input:
      "mb-4 w-64 font-satoshi text-white backdrop-blur-sm bg-white/5 border-white/10 transition-all duration-300 focus:bg-white/10 focus:border-white/20",
    button:
      "mb-4 font-satoshi relative overflow-hidden bg-[#1E88E5] hover:bg-[#1976D2] text-white px-8 py-2 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(30,136,229,0.3)] hover:shadow-[0_0_20px_rgba(30,136,229,0.5)]",
    buttonShine:
      "absolute inset-0 transform bg-gradient-to-r from-[#1E88E5] hover:from-[#1976D2] via-white/20 hover:to-[#1976D2] to-[#1E88E5]",
    error: "text-red-500 text-center w-4/5 font-satoshi"
  };

  const fetchUserData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [registrationResponse, profileResponse, eventData] = await Promise.all([
        fetchBackend({
          endpoint: `/registrations?eventID=${eventID}&year=${year}&email=${email}`,
          method: "GET",
          authenticatedCall: false
        }),
        fetchBackend({
          endpoint: `/profiles/email/${email}/${eventID}/${year}`,
          method: "GET",
          authenticatedCall: false
        }),
        fetchBackend({
          endpoint: `/events/${eventID}/${year}`,
          method: "GET",
          authenticatedCall: false
        })
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

      if (profileResponse.profileID) {
        localStorage.setItem(COMPANION_PROFILE_ID_KEY, profileResponse.profileID);
        
        if (decodedRedirect !== "") {
          router.push(decodedRedirect);
          return;
        }

        // Fetch connections and badges concurrently if not a partner
        if (!reg.isPartner) {
          await Promise.all([fetchConnections(), fetchBadges()]);
        } else {
          await fetchConnections();
        }
      }

      if (decodedRedirect !== "") {
        router.push(decodedRedirect);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("An error occurred while fetching your data.");
    }

    setIsLoading(false);
  };

  const fetchRegistrations = async () => {
    try {
      const response = await fetchBackend({
        endpoint: `/registrations?eventID=${eventID}&year=${year}&email=${email}`,
        method: "GET",
        authenticatedCall: false
      });
      setRegistrations(response.data);
    } catch (err) {
      setPageError(err as string);
    }
  };

  const fetchConnections = async () => {
    try {
      const profileId = localStorage.getItem(COMPANION_EMAIL_KEY);
      if (!profileId) {
        setPageError("Please log in to view your connections");
        return;
      }

      const data = await fetchBackend({
        endpoint: `/interactions/journal/${profileId}`,
        method: "GET",
        authenticatedCall: false
      });
      setConnections(data.data);
    } catch (err) {
      setPageError(err as string);
      console.error("Error fetching connections:", error);
    }
  };

  const fetchBadges = async () => {
    try {
      const profileId = localStorage.getItem(COMPANION_EMAIL_KEY);
      if (!profileId) {
        setPageError("Please log in to view your badges");
        return;
      }

      const data = await fetchBackend({
        endpoint: `/interactions/quests/${profileId}`,
        method: "GET",
        authenticatedCall: false
      });
      const dataWithCompleteStatus = data.data.map((badge: Omit<Badge, "isComplete">) => ({
        ...badge,
        isComplete: badge.progress >= badge.threshold
      }));
      setBadges(dataWithCompleteStatus);
      const completedCount = dataWithCompleteStatus.filter((badge: Badge) => badge.isComplete).length;
      setCompletedBadges(completedCount);
    } catch (err) {
      setPageError(err as string);
      console.error("Error fetching badges:", error);
    }
  };

  useEffect(() => {
    const { query } = router;
    const redirectParam = query["redirect"] ? decodeURIComponent(query["redirect"] as string) : "";
    setDecodedRedirect(redirectParam);
  }, [router.isReady]);

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
      <div className='w-screen h-screen flex items-center justify-center'>
        <div>A page error occurred, please refresh the page. If the problem persists, contact a BizTech exec for support.</div>
      </div>
    );
  }

  if (!email || !userRegistration) {
    return (
      <div className={styles.container}>
        <motion.div className={styles.blueOrb} {...backgroundOrbVariants.blue} />
        <motion.div className={styles.purpleOrb} {...backgroundOrbVariants.purple} />
        <Card className={styles.card}>
          <motion.div {...fadeInUpVariant} className={styles.contentWrapper}>
            <div className='flex flex-col items-center justify-center'>
              <motion.div {...fadeInUpVariant} transition={{ ...fadeInUpVariant.transition, delay: 0.2 }} className={styles.logoWrapper}>
                <motion.div className={styles.logoGlow} {...logoGlowAnimation} />
                <Image
                  src={currentEvent.options.BiztechLogo}
                  alt={`${currentEvent.options.title} Logo`}
                  width={1000}
                  height={400}
                  quality={100}
                  className={styles.logo}
                  priority
                />
              </motion.div>
              <motion.div {...fadeInUpVariant} transition={{ ...fadeInUpVariant.transition, delay: 0.4 }}>
                <h1 className={styles.title}>Welcome!</h1>
              </motion.div>
              <motion.p {...fadeInUpVariant} transition={{ ...fadeInUpVariant.transition, delay: 0.6 }} className={styles.description}>
                Please enter the email you used to register for {currentEvent.options.title}
              </motion.p>
              <motion.div {...fadeInUpVariant} transition={{ ...fadeInUpVariant.transition, delay: 0.8 }}>
                <Input className={styles.input} onChange={(e) => setInput(e.target.value)} value={input} placeholder='Email' type='email' />
              </motion.div>
              <motion.div
                {...fadeInUpVariant}
                transition={{ ...fadeInUpVariant.transition, delay: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button onClick={() => setEmail(input)} className={styles.button}>
                  <motion.span className={styles.buttonShine} {...shineAnimation} />
                  <span className='relative z-10'>Confirm</span>
                </Button>
              </motion.div>
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className={styles.error}>
                  {error}
                </motion.p>
              )}
            </div>
          </motion.div>
        </Card>
      </div>
    );
  }

  return (
    <CompanionHome
      isPartner={userRegistration.isPartner}
      userName={userRegistration?.fname ?? userRegistration?.basicInformation?.fname ?? ""}
      connectionCount={connections?.length}
      badgeCount={completedBadges}
      badges={badges}
      connections={connections}
    />
  );
};

export default Companion;
