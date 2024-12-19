import { useEffect, useState } from 'react';
import Profile from './components/profile';
import ExtraInfo from './components/extraInfo';
import CompanyInfo from './components/companyInfo';

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
 THIS IS THE DELEGATE PAGE
 
 CURRENTLY IN TESTING MODE BUT SEE 'studentProfile.tsx' for plan on rendering

*/


export default function DelegatePage() {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Replace with your actual API endpoint
        setUserData(await getUserProfile());
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) return <div>Loading...</div>;
if (!userData) return <div>Error loading profile</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 sm:p-4 max-w-4xl mx-auto">
      <Profile userData={userData} />
      <CompanyInfo userData={userData} />
      <ExtraInfo userData={userData} />
    </div>
  );
}

async function getUserProfile() {
    const data: UserProfile = {
        name: "Yi Long Musk",
        role: "Delegate",
        company: "Tesla",
        hobby: "Basketball",
        linkedIn: "linkedin.com/in/daniellee",
        profilePicUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTe8Qr5TK-ehPu0lZsZxhmTM1eGAdMVgApwSzYSKFOeQPGbukpuICsAwLQMKQJeuDpgpLU&usqp=CAU",
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