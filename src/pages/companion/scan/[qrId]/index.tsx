import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchBackend } from "@/lib/db";
import { fetchAuthSession } from "@aws-amplify/auth";
import { Loader2, QrCodeIcon } from "lucide-react";
import PageError from "@/components/companion/PageError";

interface Qr {
    data: Record<string, any>;
    id: string;
    type: string;
}

const index = () => {
    const router = useRouter();
    const { qrId } = router.query;

    const eventID = "blueprint";
    const year = "2025";

    const [pageError, setPageError] = useState("");
    const [qrData, setQrData] = useState<Qr | null>(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);

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
        } catch (err) {
            setPageError(err as string);
        }
    };

    const fetchUser = async () => {
        try {
            const { tokens } = await fetchAuthSession();
            if (tokens) {
                setUserLoggedIn(true);
            }
        } catch (err: any) {
            setUserLoggedIn(false);
        }
    };

    useEffect(() => {
        if (qrId) {
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
        !qrData ||
        !["NFC_ATTENDEE", "NFC_BOOTH", "NFC_WORKSHOP"].includes(qrData.type)
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

    return (
        <div className="w-screen h-screen flex items-center justify-center">
            <Loader2 className="animate-spin" size={50} />
        </div>
    );
};

export default index;
