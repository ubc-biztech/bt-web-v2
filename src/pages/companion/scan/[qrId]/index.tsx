import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchBackend } from "@/lib/db";
import { Loader2, QrCodeIcon } from "lucide-react";
import PageError from "@/components/companion/PageError";
import Events from "@/constants/companion-events";
import { COMPANION_EMAIL_KEY } from '@/constants/companion';

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
                authenticatedCall: false,
            });

            const data = await response;
            setQrData(data);
            setQrLoading(false);
        } catch (err) {
            setPageError(err as string);
        }
    };

    const fetchUser = async () => {
        try {
            const email = localStorage.getItem(COMPANION_EMAIL_KEY)
            if (email) {
                setUserLoggedIn(true);
            }
        } catch (err: any) {
            setUserLoggedIn(false);
        }
    };

    useEffect(() => {
        if (typeof qrId === "string" && qrId.trim() !== "") {
            fetchQR();
            fetchUser();
        }
    }, [qrId]);

    const handleRedirect = (path: string) => {
        if (userLoggedIn) {
            router.push(path);
        } else {
            router.push(`/companion/login/redirect?=${path}`);
        }
    };

    useEffect(() => {
        if (qrData) {
            const { type, id } = qrData;

            switch (type) {
                case "NFC_ATTENDEE":
                    handleRedirect(`/companion/profile/${id}`);
                    break;
                case "NFC_BOOTH":
                    handleRedirect(`/companion/booth/${id}`);
                    break;
                case "NFC_WORKSHOP":
                    handleRedirect(`/companion/workshop/${id}`);
                    break;
                default:
                    console.error("Unsupported QR Data type:", type);
            }
        }
    }, [qrData, userLoggedIn, router]);

    if (
        !loadingQr &&
        (!qrData ||
            !["NFC_ATTENDEE", "NFC_BOOTH", "NFC_WORKSHOP"].includes(
                qrData.type
            ))
    ) {
        return (
            <PageError
                icon={<QrCodeIcon size={64} color="#F87171" />}
                title="Error"
                subtitle="No such NFC code found"
                message="Try scanning your NFC card again."
            />
        );
    }

    if (pageError) {
        return (
            <div className="w-screen h-screen flex items-center justify-center">
                {pageError}
            </div>
        );
    }

    // loading spinner
    return (
        <div className="w-screen h-screen flex items-center justify-center">
            <Loader2 className="animate-spin" size={50} />
        </div>
    );
};

export default Index;
