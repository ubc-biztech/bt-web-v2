import { useState, useEffect } from "react";
import { fetchBackend } from '@/lib/db';
import { useRouter } from "next/router";
import CompanionHome from "@/components/companion/CompanionHome";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import Events from '@/constants/companion-events';
import type { Event } from '@/constants/companion-events';
import Loading from "@/components/Loading";

interface Registration {
  id: string;
  fname: string;
  points?: number;
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

  const events = Events.sort((a, b) => {
    return a.activeUntil.getTime() - b.activeUntil.getTime();
  });

  const currentEvent: Event | undefined = events.find(event => {
    const today = new Date();
    return event.activeUntil > today;
  }) || events[0];

  const { eventID, year } = currentEvent || {};

  const fetchUserData = async () => {
    const reg = registrations.find((entry) => entry.id.toLowerCase() === email.toLowerCase());
    if (reg) {
      setError("");
      setUserRegistration(reg);
      localStorage.setItem("companionEmail", reg.id);

      if (decodedRedirect !== "") {
        router.push(decodedRedirect);
      }
    } else {
      setError("This email does not match an existing entry in our records.");
      setIsLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const response = await fetchBackend({
        endpoint: `/registrations?eventID=${eventID}&year=${year}`,
        method: "GET",
        authenticatedCall: false
      });
      setRegistrations(response.data);
    } catch (err) {
      setPageError(err as string);
    }
  };

  const fetchEvent = async () => {
    try {
      const response = await fetchBackend({
        endpoint: `/events/${eventID}/${year}`,
        method: "GET",
        authenticatedCall: false
      });
      setEvent(response);
    } catch (err) {
      setPageError(err as string);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      
      if (search.startsWith('?=')) {
        setDecodedRedirect(decodeURIComponent(search.slice(2)));
      }
    }
  }, [router]);

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      const savedEmail = localStorage.getItem("companionEmail");
      if (savedEmail) {
        setEmail(savedEmail);
      }
      await Promise.all([fetchRegistrations(), fetchEvent()]);
      setIsLoading(false);
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (email && registrations.length > 0) {
      fetchUserData();
    }
  }, [email, registrations]);

  if (isLoading) return <Loading />;

  if (pageError) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div>A page error occurred, please refresh the page. If the problem persists, contact a BizTech exec for support.</div>
      </div>
    );
  }

  // Mock data for the CompanionHome component
  const mockBadges = [
    { name: "KEYNOTER", description: "Attend the keynote speech" },
    { name: "COMPLETIONIST", description: "Attend all BluePrint events" },
    { name: "LINKEDIN WARRIOR", description: "Network with 5+ delegates" }
  ];

  const mockConnections = [
    { id: "1", name: "Hikaru Un", role: "BUCS, YEAR 4", avatarInitials: "HU", avatarColor: "green-500" },
    { id: "2", name: "Elon Musk", role: "FOUNDER / CEO, TESLA", avatarInitials: "EM", avatarColor: "red-500" }
  ];

  if (!email || !userRegistration) {
    return (
      <div className="min-h-screen w-screen bg-gradient-to-b from-[#040C12] to-[#030608]">
        <Card className="flex justify-center overflow-hidden border-none bg-transparent">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="fixed z-10"
          >
            <div className="flex flex-col items-center justify-center min-h-screen w-full">
              <Image 
                src={currentEvent.options.BiztechLogo} 
                alt={`${currentEvent.options.title} Logo`}
                width={1000}
                height={400}
                quality={100}
                className="w-1/2 sm:w-3/5 mb-5"
                priority
              />
              <h1 className="text-2xl font-bold mb-2 text-white font-satoshi">Welcome!</h1>
              <p className="text-center mb-4 text-white p1 font-satoshi">
                Please enter the email you used to register for {currentEvent.options.title}
              </p>
              <Input
                className="mb-4 w-64 font-satoshi text-white"
                onChange={(e) => setInput(e.target.value)}
                value={input}
                placeholder="Email"
                type="email"
              />
              <Button
                onClick={() => setEmail(input)}
                className="mb-4 font-satoshi"
              >
                Confirm
              </Button>
              {error && (
                <p className="text-red-500 text-center w-4/5 font-satoshi">{error}</p>
              )}
            </div>
          </motion.div>
        </Card>
      </div>
    );
  }

  return (
    <CompanionHome
      userName={userRegistration.fname}
      connectionCount={20}
      badgeCount={3}
      badges={mockBadges}
      recentConnections={mockConnections}
    />
  );
};

export default Companion; 