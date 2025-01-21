import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchBackend } from "@/lib/db";
import { Loader2, QrCodeIcon } from "lucide-react";
import PageError from "@/components/companion/PageError";
import Events from "@/constants/companion-events";
import { BOOTH_EVENT, COMPANION_EMAIL_KEY, COMPANION_PROFILE_ID_KEY, CONNECTION_EVENT, WORKSHOP_EVENT } from "@/constants/companion";
import { getCookie } from 'cookies-next';

interface Qr {
  data: Record<string, any>;
  id: string;
  type: string;
}

const Index = () => {
  const router = useRouter();
  const { qrId } = router.query;

  const [pageError, setPageError] = useState("");
  const [qrData, setQrData] = useState<Qr | null>(null);
  const [loadingQr, setQrLoading] = useState(true);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const events = Events.sort((a, b) => {
    return a.activeUntil.getTime() - b.activeUntil.getTime();
  });

  const currentEvent =
    events.find((event) => {
      const today = new Date();
      return event.activeUntil > today;
    }) || events[0];

  const { eventID, year } = currentEvent || {};

  // fetching QR data
  const fetchQR = async () => {
    try {
      const response = await fetchBackend({
        endpoint: `/qr/${qrId}/${eventID}/${year}`,
        method: "GET",
        authenticatedCall: false
      });

      console.log(response);
      setQrData(response);
      setQrLoading(false);
    } catch (err) {
      setPageError((err as any).message);
    }
  };

  const fetchUser = async () => {
    try {
      const email = getCookie(COMPANION_EMAIL_KEY) as string;
      if (email) {
        setUserEmail(email);
        setUserLoggedIn(true);
      }
    } catch (err: any) {
      setUserLoggedIn(false);
    }
  };

  const recordConnection = async (scannedProfileId: string) => {
    try {
      const profileId = getCookie(COMPANION_PROFILE_ID_KEY) as string;
      if (!profileId) {
        throw new Error("Could not find your profile");
      }

      // Record the connection
      await fetchBackend({
        endpoint: `/interactions`,
        method: "POST",
        authenticatedCall: false,
        data: {
          userID: profileId,
          eventType: "CONNECTION",
          eventParam: scannedProfileId
        }
      });
    } catch (err) {
      console.error("Error recording connection:", err);
      // We don't want to block the redirect if connection recording fails
    }
  };

  useEffect(() => {
    if (typeof qrId === "string" && qrId.trim() !== "") {
      fetchQR();
      fetchUser();
    }
  }, [qrId]);

  const handleRedirect = async (path: string, scannedProfileId?: string) => {
    if (userLoggedIn) {
      // If this is a profile scan, record the connection
      if (scannedProfileId && userEmail) {
        await recordConnection(scannedProfileId);
      }
      router.push(path);
    } else {
      router.push(`/companion/login/redirect?=${path}`);
    }
  };

  useEffect(() => {
    let redirect = "";
    const postInteraction = async (userID: string, type: string, eventParam: string) => {
      let body = {
        userID,
        eventParam
      };
      switch (type) {
        case "NFC_ATTENDEE":
          Object.assign(body, { eventType: CONNECTION_EVENT });
          redirect = `/companion/profile/${eventParam}`;
          break;
        case "NFC_EXEC":
          Object.assign(body, { eventType: CONNECTION_EVENT });
          redirect = `/companion/profile/${eventParam}`;
          break;
        case "NFC_BOOTH":
          Object.assign(body, { eventType: BOOTH_EVENT });
          redirect = `/companion/booth/${eventParam}`;
          break;
        case "NFC_WORKSHOP":
          Object.assign(body, { eventType: WORKSHOP_EVENT });
          redirect = `/companion/workshop/${eventParam}`;
          break;
        default:
          console.error("Unsupported QR Data type:", type);
      }

      try {
        console.log(body);
        const response = await fetchBackend({ endpoint: "/interactions", method: "POST", data: body, authenticatedCall: false });
      } catch (error) {
        if (Number.parseInt((error as any).status) >= 500) {
          console.error("Backend call failed", (error as any).message);
        } else {
          console.log((error as any).message);
        }
      }
    };

    if (qrData) {
      const { type, id } = qrData;
      console.log(qrData);
      const userID = getCookie(COMPANION_PROFILE_ID_KEY) as string;
      postInteraction(userID || "", type, id); // TODO integrate profiles
      handleRedirect(`/companion/profile/${id}`, id);
    }
  }, [qrData, userLoggedIn, userEmail]);

  if (!loadingQr && (!qrData || !["NFC_ATTENDEE", "NFC_BOOTH", "NFC_WORKSHOP"].includes(qrData.type))) {
    return (
      <PageError
        icon={<QrCodeIcon size={64} color='#F87171' />}
        title='Error'
        subtitle='No such NFC code found'
        message='Try scanning your NFC card again.'
      />
    );
  }

  if (pageError) {
    return <div className='w-screen h-screen flex items-center justify-center'>{pageError}</div>;
  }

  // loading spinner
  return (
    <div className='w-screen h-screen flex items-center justify-center'>
      <Loader2 className='animate-spin' size={50} />
    </div>
  );
};

export default Index;
