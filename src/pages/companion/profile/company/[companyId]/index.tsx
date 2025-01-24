import { useEffect, useState } from 'react';
import Profile from '../../../../../components/companion/blueprintProfiles/profileHeader';
import AdditionalLinks from '../../../../../components/companion/blueprintProfiles/additionalLinks';
import { AnimatedBorder } from '../../../../../components/ui/animated-border';
import { useRouter } from 'next/router';
import NavBarContainer from '@/components/companion/navigation/NavBarContainer';
import { motion } from 'framer-motion';
import ResponseSection from '@/components/companion/blueprintProfiles/responseSection';
import { fetchBackend } from '@/lib/db';
import { Loader2 } from 'lucide-react';

interface CompanyProfile {
  id: string;
  profileID: string;
  name: string;
  type: string;
  profilePictureURL: string;
  description: string;
  additionalLink?: string | string[];
  "eventID;year": string;
  createdAt: number;
  updatedAt: number;
  delegateProfileIDs: string[];
  links: string[];
}

export default function CompanyPage() {
  const [userData, setUserData] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | undefined>(undefined);
  const [pageError, setPageError] = useState("");


  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const profileId = router.query.companyId as string;
    
    const fetchUserData = async () => {
        try {
            const response = await fetchBackend({
                endpoint: `/profiles/${profileId}`,
                method: "GET",
                authenticatedCall: false,
            });

            const backendProfile = response as CompanyProfile;
            
            // Transform backend profile to match our frontend interface
            const transformedProfile: CompanyProfile = {
                id: backendProfile.id,
                profileID: backendProfile.profileID,
                name: backendProfile.name,
                type: backendProfile.type as "Partner" | "Attendee",
                profilePictureURL: backendProfile.profilePictureURL,
                description: backendProfile.description,
                additionalLink: backendProfile.links, 
                "eventID;year": backendProfile["eventID;year"],
                createdAt: backendProfile.createdAt,
                updatedAt: backendProfile.updatedAt,
                delegateProfileIDs: backendProfile.delegateProfileIDs,
                links: backendProfile.links,
            };

            console.log(transformedProfile.profilePictureURL)

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

  if (!router.isReady || isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
          <Loader2 className="animate-spin" size={50} />
      </div>
  );
  }

  if (!userData) return <div>Error loading profile</div>;

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
          <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <motion.div variants={itemVariants}>
              <ResponseSection title={`ABOUT ${userData.name.toUpperCase()}`} text={userData.description} />
            </motion.div>
          </div>
          <motion.div variants={itemVariants}>
            <AdditionalLinks userData={userData} />
          </motion.div>
        </motion.div>
      </NavBarContainer>
    </div>
  );
}

async function getCompanyProfile(name: string) {
  const data: CompanyProfile =
  {
    "id": "google",
    "eventID;year": "blueprint;2025",
    "createdAt": 1737530750669,
    "delegateProfileIDs": [
     "CurvyAreasHammer"
    ],
    "description": "A leading technology company specializing in search, cloud computing, and AI.",
    "links": [
     "https://google.com",
     "https://careers.google.com"
    ],
    "name": "Google",
    "profileID": "google",
    "profilePictureURL": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png",
    "type": "Company",
    "updatedAt": 1737531310269
   };
  return data;
}