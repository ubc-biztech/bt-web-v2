import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchBackend } from "@/lib/db";
import Blueprint2025 from "@/components/companion/events/Blueprint2025";

interface Registration {
    id: string;
    fname: string;
    points?: number;
    [key: string]: any;
}

const index = () => {
    const eventID = "blueprint";
    const year = "2025";

    const router = useRouter();
    const { externalUserId } = router.query;

    const [userId, setUserId] = useState("");
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");
    const [error, setError] = useState("");

    // fetching user data
    const fetchRegistrations = async () => {
        try {
            const response = await fetchBackend({
                endpoint: `/registrations?eventID=${eventID}&year=${year}`,
                method: "GET",
                authenticatedCall: false,
            });
            console.log("Registrations: ", response);
            setRegistrations(response.data);
        } catch (err) {
            setPageError(err as string);
        }
    };

    useEffect(() => {
        fetchRegistrations();
    }, []);

    useEffect(() => {
        const savedId = localStorage.getItem("externalUserId") || "";
        const reg = registrations.find(
            (entry) =>
                entry.externalUserId.toLowerCase() === savedId.toLowerCase()
        );
        if (registrations.length != 0) {
            setLoading(false);
        }
        if (!reg) {
            setError(
                "Your UUID does not match an existing entry in our records. Log in to track your connections."
            );
            console.log(
                "Your UUID does not match an existing entry in our records. Log in to track your connections."
            );
        } else {
            setUserId(savedId);
            console.log("User email: ", userId);
        }
    }, [registrations]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (userId == externalUserId) {
        return <div>your profile</div>; // redirect to your profile
    } else {
        return <div>their profile</div>; // redir to their profile
    }
};

export default index;
