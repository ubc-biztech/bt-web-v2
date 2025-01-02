import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchBackend } from "@/lib/db";
import PageError from "@/components/companion/PageError";
import { Loader2, XCircleIcon } from "lucide-react";
import Events from "@/constants/companion-events";

interface Registration {
    id: string;
    fname: string;
    points?: number;
    [key: string]: any;
}

interface Qr {
    data: Record<string, any>;
    id: string;
    type: string;
}

const Index = () => {
    const router = useRouter();
    const [qrData, setQrData] = useState<Qr | null>(null);
    const [qrPath, setQrPath] = useState<string>();
    const [localUser, setLocalUser] = useState<string>();
    const [userId, setUserId] = useState("");
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingQr, setQrLoading] = useState(true);
    const [pageError, setPageError] = useState("");

    const events = Events.sort((a, b) => {
        return a.activeUntil.getTime() - b.activeUntil.getTime();
    });

    const currentEvent =
        events.find((event) => {
            const today = new Date();
            return event.activeUntil > today;
        }) || events[0];

    const { eventID, year } = currentEvent || {};

    // fetching user data from qr code
    const fetchUserID = async (qrId: string) => {
        try {
            console.log(qrId);
            const response = await fetchBackend({
                endpoint: `/qr/${qrId}/${eventID}/${year}`,
                method: "GET",
                authenticatedCall: false,
            });

            const res = await response;
            if (res) {
                setQrData(res);
                setUserId(res.data.registrationID);
            } else if (qrPath) {
                setPageError("NFC data not found. Try scanning your NFC card again.");
            }
            setQrLoading(false);
        } catch (err) {
            setPageError(
                (err as Error)?.message || "An unexpected error occurred"
            );
        }
    };

    // fetching registrations data
    const fetchRegistrations = async () => {
        try {
            const response = await fetchBackend({
                endpoint: `/registrations?eventID=${eventID}&year=${year}`,
                method: "GET",
                authenticatedCall: false,
            });
            setRegistrations(response.data);
        } catch (err) {
            setPageError(
                (err as Error)?.message || "An unexpected error occurred"
            );
        }
    };

    useEffect(() => {
        const newQrPath = router.asPath.split("/").pop() || "";
        setQrPath(newQrPath);
        fetchRegistrations();
        if (newQrPath && newQrPath !== "[externalUserId]") {
            fetchUserID(newQrPath);
        }
        setLocalUser(localStorage.getItem("companionEmail") || undefined);
    }, [router]);

    useEffect(() => {
        const savedId = qrData?.data.registrationID || "";

        const reg = registrations.find(
            (entry) => entry.id.toLowerCase() === localUser?.toLowerCase()
        );

        if (registrations.length != 0 && !loadingQr) {
            setLoading(false);
        }

        if (!qrData && !loading) { 
            setPageError("NFC data not found. Try scanning your NFC card again.");
        } 
        if (!reg && !loading) {
            setPageError(
                "Your UUID does not match an existing entry in our records. Log in to track your connections."
            );
        } 

        if (savedId && reg) {
            setPageError("");
            setUserId(savedId);
        }
    }, [registrations, localUser, userId]);

    if (loading) {
        return (
            <div className="w-screen h-screen flex items-center justify-center">
                <Loader2 className="animate-spin" size={50} />
            </div>
        );
    }
    
    if (pageError) {
        return (
            <PageError
                icon={<XCircleIcon size={64} color="#F87171" />}
                title="Page Error"
                subtitle={pageError}
                message="Try scanning your NFC card again."
            />
        );
    }

    if (userId == localUser) {
        return (
            <div className="w-screen h-screen flex flex-row items-center justify-center">
                your profile
            </div>
        ); // TODO : redirect to your profile
    } else {
        return (
            <div className="w-screen h-screen flex flex-row items-center justify-center">
                their profile
            </div>
        ); // TODO : redir to their profile
    }
};

export default Index;
