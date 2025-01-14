import { use, useEffect, useState } from "react";
import Profile from '../../../../components/companion/blueprintProfiles/profileHeader' // update these once done testing
import ExtraInfo from "../../../../components/companion/blueprintProfiles/extraInfo";
import { useRouter } from "next/router";
import CompanyInfo from "../../../../components/companion/blueprintProfiles/delegateInfo";
import AttendeeInfo from "../../../../components/companion/blueprintProfiles/attendeeInfo";
import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import { motion } from 'framer-motion';
import { UserProfile } from "@/types";

const UserProfilePage = () => {
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const [user, setUser] = useState<string | null>(null);

    useEffect(() => {
        if (!router.isReady) return;
        const userQuery = router.query.externalUserId as string | undefined;
        console.log(userQuery)
        if (userQuery) {
            setUser(userQuery);
        }
        const fetchUserData = async () => {
            try {
                // const response = await fetch('/api/user-profile');
                // const data = await response.json();
                // setUserData(data);
                if (userQuery) {
                    setUserData(await getUserProfile(userQuery));
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [user, userData, router]);

    let isDelegate = userData?.role == "Delegate"

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

    if (isLoading || !router.isReady || !user) return <div>Loading...</div>;
    if (!userData) return <div>Error loading profile</div>;

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-[#040C12] to-[#030608] text-white p-4 sm:p-4 max-w-4xl mx-auto pb-[100px]">
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
                {isDelegate ?
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
        </div >
    );
};

export default UserProfilePage;

const data1: UserProfile = {
    name: "Daniel Lee",
    role: "Attendee",
    major: "BUCS",
    year: "3rd",
    hobby: "Basketball",
    linkedIn: `linkedin.com/in/daniellee`,
    profilePicUrl: "https://hoopshype.com/wp-content/uploads/sites/92/2024/11/i_7b_e3_c7_lebron-james.png?w=1000&h=600&crop=1",
    funFacts: [
        "Has visited 23 countries",
        "Can speak 3 languages",
        "Former competitive swimmer",

    ],
    interests: [
        "UX/UI Design",
        "Photography",
        "Sustainable Design",
        "Hiking"
    ],
    additionalLink: "https://github.com/dlee",

};

const data2: UserProfile = {
    name: "Yi Long Musk",
    role: "Delegate",
    company: "Tesla",
    hobby: "Basketball",
    linkedIn: "linkedin.com/in/siredwardgregoriothethird",
    profilePicUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTe8Qr5TK-ehPu0lZsZxhmTM1eGAdMVgApwSzYSKFOeQPGbukpuICsAwLQMKQJeuDpgpLU&usqp=CAU",
    companyLogoUrl: "data:image/png;base64,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",
    funFacts: [
        "Has visited 23 countries around the world even though I've never flown first class. Has visited 23 countries around the world even though I've never flown first class.",
        "Can speak 3 languages",
        "Former competitive swimmer",
    ],
    interests: [
        "UX/UI Design",
        "Photography",
        "Sustainable Design",
    ],
    additionalLink: "https://github.com/dlee",
};

async function getUserProfile(user: string) {
    const data = user=="daniel"? data1 : data2;
    return data;
}