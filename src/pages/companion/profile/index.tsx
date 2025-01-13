import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchBackend } from "@/lib/db";
import { Loader2, XCircleIcon } from "lucide-react";
import Events from "@/constants/companion-events";
import { COMPANION_EMAIL_KEY } from '@/constants/companion';
import PageError from "@/components/companion/PageError";

const CompanionProfile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const events = Events.sort((a, b) => {
    return a.activeUntil.getTime() - b.activeUntil.getTime();
  });

  const currentEvent =
    events.find((event) => {
      const today = new Date();
      return event.activeUntil > today;
    }) || events[0];

  const { eventID, year } = currentEvent || {};

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get email from local storage
        const email = localStorage.getItem(COMPANION_EMAIL_KEY);
        if (!email) {
          router.push('/companion');
          return;
        }

        // Get profileID
        const profileResponse = await fetchBackend({
          endpoint: `/profiles/email/${email}/${eventID}/${year}`,
          method: "GET",
          authenticatedCall: false,
        });

        // Redirect to companion profile page
        if (profileResponse.profileID) {
          router.push(`/companion/profile/${profileResponse.profileID}`);
          return;
        }

        setError("Could not find your profile. Please try scanning your NFC card again.");
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError("An error occurred while fetching your profile. Please try again later.");
        setIsLoading(false);
      }
    };

    if (eventID && year) {
      fetchData();
    }
  }, [eventID, year]);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={50} />
      </div>
    );
  }

  if (error) {
    return (
      <PageError
        icon={<XCircleIcon size={64} color="#F87171" />}
        title="Profile Error"
        subtitle={error}
        message="Try scanning your NFC card again."
      />
    );
  }

  return null;
};

export default CompanionProfile; 