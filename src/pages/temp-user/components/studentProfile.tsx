import { use, useEffect, useState } from "react";
import Profile from './components/profile' // update these once done testing
import ExtraInfo from "./components/extraInfo";


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


/*
 THIS IS THE COMPONENT FOR A STUDENT USER PROFILE

 MY PLAN FOR THE UI IS TO HAVE OUR INDEX.TSX PAGE RENDER BASED ON THE USER RETURNED BY THE API CALL

 EX FLOW. 
 - USER TAPS NFC CARD WHICH LOADS THIS LINK WITH ENDPOINT OF A USERID
 - MAKE API CALL FOR INFO ON USER 
 - IF STUDENT PROFILE, RENDER THIS COMPONENT, ELSE RENDER DELEGATE PROFILE
*/

const UserProfilePage = () => {
    // This would be replaced with your API call
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Example API call
        const fetchUserData = async () => {
            try {
                // Replace with actual API call
                // const response = await fetch('/api/user-profile');
                // const data = await response.json();
                // setUserData(data);
                setUserData(await getUserProfile());
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (isLoading) return <div>Loading...</div>;
    if (!userData) return <div>Error loading profile</div>;

    return (
        <div className="min-h-screen bg-black text-white p-6 sm:p-4 max-w-4xl mx-auto">
            {/* Header ** IS THIS NEEDED?? **/}
            <header className="flex justify-between items-center mb-4 sm:mb-6">
                <h1 className="text-lg sm:text-xl font-bold font-sans text-white">BluePrint</h1>
                <button className="text-xl sm:text-2xl text-white">☰</button>
            </header>

            <Profile userData={userData} />

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="border border-white rounded-lg p-3 sm:p-4">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {/* Major Card */}
                        <div>
                            <p className="text-xs sm:text-sm text-light-grey font-mono mb-1 sm:mb-2">MAJOR</p>
                            <p className="text-xs sm:text-sm font-sans">{userData?.major}</p>
                        </div>

                        {/* Year Card */}
                        <div>
                            <p className="text-xs sm:text-sm text-light-grey font-mono mb-1 sm:mb-2">YEAR</p>
                            <p className="text-xs sm:text-sm font-sans">{userData?.year}</p>
                        </div>

                        {/* Hobby Card */}
                        <div className="col-span-2">
                            <p className="text-xs sm:text-sm text-light-grey font-mono mb-1 sm:mb-2">FAVOURITE HOBBY</p>
                            <p className="text-xs sm:text-sm font-sans">{userData?.hobby}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <ExtraInfo userData={userData} />
        </div>
    );
};

export default UserProfilePage;

async function getUserProfile() {
    // Mock data for development
    const data: UserProfile = {
        name: "Daniel Lee",
        role: "Attendee",
        major: "BUCS",
        year: "3rd",
        hobby: "Basketball",
        linkedIn: "linkedin.com/in/daniellee",
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
    return data;
}