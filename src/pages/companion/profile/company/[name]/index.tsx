import { useEffect, useState } from 'react';
import Profile from '../../../../components/profile';
import AdditionalLinks from '../../../../components/additionalLinks';
import { AnimatedBorder } from '../../../../../components/ui/animated-border';
import { useRouter } from 'next/router';
import { TopNav } from '../../../../../components/companion/navigation/top-nav';
import { SideNav } from '../../../../../components/companion/navigation/side-nav';
import { BottomNav } from '../../../../../components/companion/navigation/bottom-nav';
import { motion } from 'framer-motion';


interface CompanyProfile {
  PK: string;
  id: string;
  name: string;
  role: string;
  profilePicUrl: string;
  about: string;
  additionalLinks: string[];
}

/*
 THIS IS THE COMPANY PAGE
 
 CURRENTLY IN TESTING MODE BUT SEE 'studentProfile.tsx' for plan on rendering

*/

export default function CompanyPage() {
  const [userData, setUserData] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);

  const router = useRouter();
  const name: string = router.query.name ? router.query.name as string : 'ubcbiztech'; // this might need to be companyid?

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setUserData(await getCompanyProfile(name));
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [name]);

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
    <div className="min-h-screen bg-black text-white p-6 sm:p-4 max-w-4xl mx-auto">
      <TopNav onMenuClick={() => setIsSideNavOpen(true)} />
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
        <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <motion.div variants={itemVariants}>
            <AnimatedBorder className="w-full mb-3 sm:mb-4">
              <div className="rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-light-grey font-redhat mb-1 sm:mb-2">ABOUT</p>
                {userData.about}
              </div>
            </AnimatedBorder>
          </motion.div>
        </div>
        <motion.div variants={itemVariants}>
          <AdditionalLinks userData={userData} />
        </motion.div>
      </motion.div>
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
    "additionalLinks": [`https://${name}.com`, "https://linkedin.com/company/tesla"]
  };
  return data;
}