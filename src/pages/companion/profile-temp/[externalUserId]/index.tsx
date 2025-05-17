import { use, useEffect, useState } from "react";
import Profile from "../../../../components/companion/blueprintProfiles/profileHeader"; // update these once done testing
import ExtraInfo from "../../../../components/companion/blueprintProfiles/extraInfo";
import { useRouter } from "next/router";
import CompanyInfo from "../../../../components/companion/blueprintProfiles/delegateInfo";
import AttendeeInfo from "../../../../components/companion/blueprintProfiles/attendeeInfo";
import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import { motion } from "framer-motion";
import { UserProfile } from "@/types";
import ResponseSection from "@/components/companion/blueprintProfiles/responseSection";
import { ConnectedButton } from "@/components/ui/connected-button";
import { CheckCircle } from "lucide-react";

const UserProfilePage = () => {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const userQuery = router.query.externalUserId as string | undefined;
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
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, userData, router]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.75,
        ease: "easeOut",
      },
    },
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
          <ConnectedButton className="mx-auto mb-4 flex items-center">
            <CheckCircle />
            <span className="text-[12px] translate-y-[1px]">CONNECTED</span>
          </ConnectedButton>
          {userData.description && (
            <ResponseSection
              title={`ABOUT ${userData.fname.toUpperCase()}`}
              text={userData.description}
            />
          )}
          {userData.type == "Partner" ? (
            <motion.div variants={itemVariants}>
              <CompanyInfo userData={userData} />
            </motion.div>
          ) : (
            <motion.div variants={itemVariants}>
              <AttendeeInfo userData={userData} />
            </motion.div>
          )}
          <motion.div variants={itemVariants}>
            <ExtraInfo userData={userData} />
          </motion.div>
        </motion.div>
      </NavBarContainer>
    </div>
  );
};

export default UserProfilePage;

const data1: UserProfile = {
  profileID: "MajorCarsEnjoy",
  fname: "Daniel",
  lname: "Lee",
  pronouns: "He/Him",
  type: "Attendee",
  hobby1: "Basketball",
  hobby2: "Hiking",
  funQuestion1: "Steve Jobs.",
  funQuestion2: "NFC Cards",
  linkedIn: "linkedin.com/in/daniellee",
  profilePictureURL:
    "https://hoopshype.com/wp-content/uploads/sites/92/2024/11/i_7b_e3_c7_lebron-james.png?w=1000&h=600&crop=1",
  additionalLink: "https://github.com/dlee",
  description:
    "I'm passionate about electric vehicles and speak three languages",
  major: "BUCS",
  year: "3rd",
  eventIDYear: "blueprint;2025",
  createdAt: 1736756479658,
  updatedAt: 1736756479658,
};

const data2: UserProfile = {
  profileID: "BreezyRulesYawn",
  fname: "Yi Long",
  lname: "Mah",
  pronouns: "He/Him",
  type: "Partner",
  hobby1: "Basketball",
  funQuestion1: "I am Chinese Elon Musk",
  funQuestion2: "Elon Musk",
  linkedIn: "linkedin.com/in/danielthegoatlee",
  profilePictureURL:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTe8Qr5TK-ehPu0lZsZxhmTM1eGAdMVgApwSzYSKFOeQPGbukpuICsAwLQMKQJeuDpgpLU&usqp=CAU",
  additionalLink: "https://github.com/yilongmah",
  description:
    "I'm passionate about electric vehicles and speak three languages",
  eventIDYear: "blueprint;2025",
  createdAt: 1737169605878,
  updatedAt: 1737169605878,
};

async function getUserProfile(user: string) {
  const data = user == "daniel" ? data1 : data2;
  return data;
}
