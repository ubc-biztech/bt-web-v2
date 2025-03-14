import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchBackend } from "@/lib/db";
import PageError from "@/components/companion/PageError";
import { CheckCircle, Loader2, XCircleIcon } from "lucide-react";
import Events from "@/constants/companion-events";
import { COMPANION_EMAIL_KEY, COMPANION_PROFILE_ID_KEY } from '@/constants/companion';
import { BackendProfile, UserProfile } from "@/types";
import Profile from '@/components/companion/blueprintProfiles/profileHeader';
import ExtraInfo from "@/components/companion/blueprintProfiles/extraInfo";
import AttendeeInfo from "@/components/companion/blueprintProfiles/attendeeInfo";
import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import { motion } from 'framer-motion';
import ResponseSection from "@/components/companion/blueprintProfiles/responseSection";
import CompanyInfo from "@/components/companion/blueprintProfiles/delegateInfo";
import { ConnectedButton } from "@/components/ui/connected-button";

const Index = () => {
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const [pageError, setPageError] = useState("");
    const [currUser, setCurrUser] = useState("");

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
        if (!router.isReady) return;
        const profileId = router.query.externalUserId as string;

        const fetchUserData = async () => {
            try {
                const response = await fetchBackend({
                    endpoint: `/profiles/${profileId}`,
                    method: "GET",
                    authenticatedCall: false,
                });

                const currUserID = localStorage.getItem(COMPANION_PROFILE_ID_KEY);

                setCurrUser(currUserID ?? "");

                const backendProfile = response as BackendProfile;

                // Transform backend profile to match our frontend interface
                const transformedProfile: UserProfile = {
                    profileID: backendProfile.profileID,
                    fname: backendProfile.fname,
                    lname: backendProfile.lname,
                    pronouns: backendProfile.pronouns,
                    type: backendProfile.type as "Partner" | "Attendee",
                    hobby1: backendProfile.hobby1,
                    hobby2: backendProfile.hobby2,
                    funQuestion1: backendProfile.funQuestion1,
                    funQuestion2: backendProfile.funQuestion2,
                    linkedIn: backendProfile.linkedIn,
                    profilePictureURL: backendProfile.profilePictureURL,
                    additionalLink: backendProfile.additionalLink,
                    description: backendProfile.description,
                    major: backendProfile.major,
                    year: backendProfile.year,
                    eventIDYear: backendProfile.eventIDYear,
                    role: backendProfile.role,
                    createdAt: backendProfile.createdAt,
                    updatedAt: backendProfile.updatedAt,
                    company: backendProfile.company,
                    companyProfileID: backendProfile.companyProfileID,
                    companyProfilePictureURL: backendProfile.companyProfilePictureURL,
                };

                setUserData(transformedProfile);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setPageError(
                    (error as Error)?.message || "An unexpected error occurred"
                );
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [router.isReady, router.query.externalUserId]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.75,
                ease: "easeOut"
            }
        }
    };

    if (isLoading) {
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

    if (!userData) {
        return (
            <PageError
                icon={<XCircleIcon size={64} color="#F87171" />}
                title="Profile Not Found"
                subtitle="Could not find the requested profile"
                message="Try scanning your NFC card again."
            />
        );
    }

    return (
        <div className="relative min-h-screen w-full bg-gradient-to-b from-[#040C12] to-[#030608] text-white p-4 sm:p-4 mx-auto pb-[100px]">
            <NavBarContainer>
                <motion.div
                    className="flex-1"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants}>
                        <Profile userData={userData} />
                    </motion.div>
                    {userData.profileID !== currUser && (
                        <motion.div variants={itemVariants}>
                            <ConnectedButton className="mx-auto mb-4 flex items-center">
                                <CheckCircle />
                                <span className="text-[12px] translate-y-[1px]">CONNECTED</span>
                            </ConnectedButton>
                        </motion.div>
                    )}
                    <motion.div variants={itemVariants}>
                        {userData.description && (
                            <ResponseSection title={`ABOUT ${userData.fname.toUpperCase()}`} text={userData.description} />
                        )}
                    </motion.div>
                    {userData.type == "Partner" ?
                        <motion.div variants={itemVariants}>
                            <CompanyInfo userData={userData} />
                        </motion.div>
                        :
                        <motion.div variants={itemVariants}>
                            <AttendeeInfo userData={userData} />
                        </motion.div>
                    }
                    <motion.div variants={itemVariants}>
                        <ExtraInfo userData={userData} />
                    </motion.div>
                </motion.div>
            </NavBarContainer>
        </div>
    );
};

export default Index;
