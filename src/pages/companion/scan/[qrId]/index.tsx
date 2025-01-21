import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchBackend } from "@/lib/db";
import { Loader2, QrCodeIcon } from "lucide-react";
import PageError from "@/components/companion/PageError";
import Events from "@/constants/companion-events";
import { BOOTH_EVENT, COMPANION_EMAIL_KEY, COMPANION_PROFILE_ID_KEY, CONNECTION_EVENT, WORKSHOP_EVENT } from "@/constants/companion";

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

  useEffect(() => {
    if (typeof qrId === "string" && qrId.trim() !== "") {
      fetchQR();
    }
  }, [qrId]);

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
          // TODO: company pages
          // redirect = `/companion/booth/${eventParam}`;
          redirect = `/companion/`;
          break;
        case "NFC_WORKSHOP":
          Object.assign(body, { eventType: WORKSHOP_EVENT });
          // TODO: workshop pages
          // redirect = `/companion/workshop/${eventParam}`;
          redirect = `/companion/`;
          break;
        default:
          console.error("Unsupported QR Data type:", type);
      }

      if (!userID) {
        await router.push(`/companion/login/redirect?=/companion/scan/${qrId}`);
        return;
      }

      try {
        await fetchBackend({ endpoint: "/interactions", method: "POST", data: body, authenticatedCall: false });
      } catch (error) {
        if (Number.parseInt((error as any).status) >= 500) {
          console.error("Backend call failed", (error as any).message);
        } else {
          console.log((error as any).message);
        }
      }

      router.push(redirect);
    };

    if (qrData) {
      const { type, id } = qrData;
      const userID = localStorage.getItem(COMPANION_EMAIL_KEY);
      postInteraction(userID || "", type, id); // TODO integrate profiles
    }
  }, [qrData]);

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
