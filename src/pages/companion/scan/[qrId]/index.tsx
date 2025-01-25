import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchBackend } from "@/lib/db";
import { QrCodeIcon } from "lucide-react";
import PageError from "@/components/companion/PageError";
import Events from "@/constants/companion-events";
import { BOOTH_EVENT, COMPANION_EMAIL_KEY, COMPANION_PROFILE_ID_KEY, CONNECTION_EVENT, WORKSHOP_EVENT } from "@/constants/companion";
import Loading from "@/components/Loading";

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

      setQrData(response);
      setQrLoading(false);
    } catch (err) {
      setPageError((err as any).message);
    }
  };

  const postInteraction = async (userID: string, type: string, eventParam: string) => {
    let redirect = "";
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
      case "NFC_COMPANY":
        Object.assign(body, { eventType: BOOTH_EVENT });
        redirect = `/companion/profile/company/${eventParam}`;
        break;
      case "NFC_BOOTH":
        Object.assign(body, { eventType: BOOTH_EVENT });
        redirect = `/companion/`;
        break;
      case "NFC_WORKSHOP":
        Object.assign(body, { eventType: WORKSHOP_EVENT });
        redirect = `/companion/`;
        break;
      default:
        console.error("Unsupported QR Data type:", type);
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

  useEffect(() => {
    if (typeof qrId === "string" && qrId.trim() !== "") {
      fetchQR();
    }
  }, [qrId]);

  useEffect(() => {
    if (!qrData) {
      return;
    }

    const { type, id } = qrData;
    const userID = localStorage.getItem(COMPANION_EMAIL_KEY);

    if (!userID) {
      router.push(`/companion?redirect=/companion/scan/${qrId}`);
      return;
    }

    postInteraction(userID || "", type, id); // TODO integrate profiles
  }, [qrData]);

  if (!loadingQr && (!qrData || !["NFC_ATTENDEE", "NFC_BOOTH", "NFC_WORKSHOP", "NFC_COMPANY"].includes(qrData.type))) {
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

  return <Loading />;
};

export default Index;
