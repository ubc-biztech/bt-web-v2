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
    const [isSideNavOpen, setIsSideNavOpen] = useState(false);
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
    linkedIn: "linkedin.com/in/daniellee",
    profilePicUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTe8Qr5TK-ehPu0lZsZxhmTM1eGAdMVgApwSzYSKFOeQPGbukpuICsAwLQMKQJeuDpgpLU&usqp=CAU",
    companyLogoUrl: "https://static.vecteezy.com/system/resources/previews/020/336/735/non_2x/tesla-logo-tesla-icon-transparent-png-free-vector.jpg",
    funFacts: [
        "Has visited 23 countries around the world even though I've never flown first class.",
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
    return data2;
}