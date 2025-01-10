import { use, useEffect, useState } from "react";
import Profile from '../../../../components/companion/blueprintProfiles/profile' // update these once done testing
import ExtraInfo from "../../../../components/companion/blueprintProfiles/extraInfo";
import { useRouter } from "next/router";
import CompanyInfo from "../../../../components/companion/blueprintProfiles/companyInfo";
import AttendeeInfo from "../../../../components/companion/blueprintProfiles/attendeeInfo";
import { TopNav } from '../../../../components/companion/navigation/top-nav';
import { SideNav } from '../../../../components/companion/navigation/side-nav';
import { BottomNav } from '../../../../components/companion/navigation/bottom-nav';
import { motion } from 'framer-motion';



interface UserProfile {
    name: string;
    role: string;
    hobby: string;
    linkedIn: string;
    funFacts: string[];
    interests: string[];
    additionalLinks: string[];
    profilePicUrl: string;
    companyLogoUrl?: string;
    company?: string;
    major?: string;
    year?: string;
}

// THEN GO THROUGH AND TEST IT WITH MUTLIPLE INTERESTS AND DIFFERENT LENGTHS FOR EACH TO CHECK BOUNDARIES
// FIX RESPONSIVENESS FOR S8+, 

// NOTES FOR PR:
// - S8+ mobile screens needed to reformat the desing because it was too squished
// - right now, the linkedin page links are expecting with the https://www included, but we can also do some simple regex to 
//   refactor them
// - did not include the bullet points on the fun facts and interests because it made the spacing weird when the word lengths became longer
// - figma design font was smaller, but I think it may not be readable on all screens so I increased the size. It may look a little more squished as a result
// - edited animated border to have the children match the sizing of the border - can revert if it breaks anything else

/*
 THIS IS THE COMPONENT FOR A STUDENT USER PROFILE

 MY PLAN FOR THE UI IS TO HAVE OUR INDEX.TSX PAGE RENDER BASED ON THE USER RETURNED BY THE API CALL

 EX FLOW. 
 - USER TAPS NFC CARD WHICH LOADS THIS LINK WITH ENDPOINT OF A USERID ** still need to implement the grabbing from url
 - MAKE API CALL FOR INFO ON USER 
 - IF STUDENT PROFILE, RENDER THIS COMPONENT, ELSE RENDER DELEGATE PROFILE

 *Note* - on a delegate profile, if the 'visit-page' button is clicked for the company, route to company profile 
 - turn both company and user into this component and conditionally render based on role
 - could make a company page route? or make this one conditionally render even more - i think i like own route better though
*/

const UserProfilePage = () => {
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSideNavOpen, setIsSideNavOpen] = useState(false);
    const router = useRouter();
    const user: string = router.query.user ? router.query.user as string : 'ubcbiztech';

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // const response = await fetch('/api/user-profile');
                // const data = await response.json();
                // setUserData(data);
                setUserData(await getUserProfile(user));
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [user, userData]);

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

    if (isLoading) return <div>Loading...</div>;
    if (!userData) return <div>Error loading profile</div>;

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-[#040C12] to-[#030608] text-white p-4 sm:p-4 max-w-4xl mx-auto mb-[100px]">
            <div className="sticky top-0 left-0 right-0 z-50 px-2 pt-2 bg-gradient-to-b from-[#040C12] to-transparent pb-4">
                <TopNav onMenuClick={() => setIsSideNavOpen(true)} />
            </div>
            <SideNav isOpen={isSideNavOpen} onClose={() => setIsSideNavOpen(false)} />
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

            <BottomNav />
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
    additionalLinks: [
        "https://dlee.com",
        "https://github.com/dlee",
        "https://behance.net/dlee"
    ],
};

const data2: UserProfile = {
    name: "Yi Long Musk",
    role: "Delegate",
    company: "Tesla",
    hobby: "Basketball",
    linkedIn: "linkedin.com/in/daniellee",
    profilePicUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTe8Qr5TK-ehPu0lZsZxhmTM1eGAdMVgApwSzYSKFOeQPGbukpuICsAwLQMKQJeuDpgpLU&usqp=CAU",
    funFacts: [
        "Has visited 23 countries around the world even though I've never flown first class.",
        "Can speak 3 languages",
        "Former competitive swimmer",
    ],
    interests: [
        "UX/UI Design",
        "Photography",
        "Sustainable Design",
        "Generative Automation"
    ],
    additionalLinks: [
        "https://dlee.com",
        "https://github.com/dlee",
        "https://behance.net/dlee"
    ],
};

async function getUserProfile(user: string) {
    return data2;
}