import { useEffect, useState } from 'react';
import Profile from '../../../../../components/companion/blueprintProfiles/profileHeader';
import AdditionalLinks from '../../../../../components/companion/blueprintProfiles/additionalLinks';
import { AnimatedBorder } from '../../../../../components/ui/animated-border';
import { useRouter } from 'next/router';
import NavBarContainer from '@/components/companion/navigation/NavBarContainer';
import { motion } from 'framer-motion';


interface CompanyProfile {
  PK: string;
  id: string;
  name: string;
  role: string;
  profilePicUrl: string;
  about: string;
  additionalLink: string;
}

export default function CompanyPage() {
  const [userData, setUserData] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [companyId, setCompanyId] = useState<string | undefined>(undefined);


  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    setCompanyId(router.query.companyId as string);

    const fetchUserData = async () => {
      try {
        setUserData(await getCompanyProfile(companyId ? companyId : 'ubcbiztech'));
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [companyId, router]);

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

  if (!router.isReady || !companyId || isLoading) {
    return <div>Loading...</div>;
  }

  if (!userData) return <div>Error loading profile</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 sm:p-4 max-w-4xl mx-auto pb-[100px]">
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
              <AnimatedBorder className="w-full mb-3 sm:mb-4">
                <div className="rounded-lg p-3 sm:p-4 font-redhat">
                  <p className="text-xs sm:text-sm text-light-grey font-redhat mb-1 sm:mb-2">ABOUT</p>
                  <p className='font-satoshi'>{userData.about}</p>
                </div>
              </AnimatedBorder>
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
    "PK": "tesla#1234",
    "id": "1234",
    "name": "Tesla",
    "role": "Company",
    "profilePicUrl": "https://static.vecteezy.com/system/resources/previews/020/336/735/non_2x/tesla-logo-tesla-icon-transparent-png-free-vector.jpg",
    "about": "Tesla is an American multinational automotive and clean energy company. Headquartered in Austin, Texas, it designs, manufactures and sells battery electric vehicle, stationary battery energy storage devices from home to grid-scale, solar panels and solar shingles, and related products and services. ",
    "additionalLink": "https://linkedin.com/company/tesla"
  };
  return data;
}