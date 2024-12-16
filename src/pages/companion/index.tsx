import { useState, useEffect } from "react";
import { fetchBackend } from '@/lib/db';
import CompanionLayout from '@/components/companion/CompanionLayout';
import Events from '@/constants/companion-events';

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

const styles = {
  error: {
    backgroundColor: "transparent",
    background: "white",
    overflow: "hidden",
    minHeight: "100vh",
    display: "flex",
    padding: "10px",
    flexDirection: "column",
    width: "100%",
  } as const,
};

const Companion = () => {
  const [email, setEmail] = useState("");
  const [pageError, setPageError] = useState("");
  const [error, setError] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [event, setEvent] = useState<EventData | null>(null);
  const [userRegistration, setUserRegistration] = useState<Registration | null>(null);
  const [scheduleData, setScheduleData] = useState<Array<{ date: string; title: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const events = Events.sort((a, b) => {
    return a.activeUntil.getTime() - b.activeUntil.getTime();
  });

  const currentEvent = events.find(event => {
    const today = new Date();
    return event.activeUntil > today;
  }) || events[0];

  const { options, eventID, year, ChildComponent } = currentEvent || {};

  const fetchUserData = async () => {
    const reg = registrations.find((entry) => entry.id.toLowerCase() === email.toLowerCase());
    if (reg) {
      setError("");
      setUserRegistration(reg);
      localStorage.setItem("companionEmail", reg.id);
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
      console.log("Error while fetching event info: ", err);
      setPageError(err as string);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchRegistrations();
    fetchEvent();

    const savedEmail = localStorage.getItem("companionEmail");
    if (savedEmail) {
      setEmail(savedEmail);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setError("");
    if (email && registrations.length > 0) {
      fetchUserData();
    }
  }, [email, registrations]);

  useEffect(() => {
    if (userRegistration && options?.getScheduleData) {
      setScheduleData(options.getScheduleData(userRegistration));
    }
  }, [userRegistration, options]);

  if (pageError) {
    return (
      <div style={styles.error}>
        <div>A page error occurred, please refresh the page. If the problem persists, contact a BizTech exec for support.</div>
      </div>
    );
  }

  return (
    <CompanionLayout 
      options={options}
      email={email}
      setEmail={setEmail}
      registrations={registrations}
      userRegistration={userRegistration}
      event={event}
      isLoading={isLoading}
      error={error}
      scheduleData={scheduleData}
      ChildComponent={ChildComponent}
    />
  );
};

export default Companion; 