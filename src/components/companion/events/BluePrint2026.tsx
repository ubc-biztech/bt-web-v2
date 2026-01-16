import { useRouter } from "next/router";
import Loading from "@/components/Loading";
import { fetchBackend } from "@/lib/db";
import { useUserRegistration } from "@/pages/companion/index";
import { AnimatePresence, motion } from "framer-motion";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { isCheckedIn } from "@/lib/registrationStatus";
import BluePrintLayout from "../blueprint2026/layout/BluePrintLayout";
import BluePrintCard from "../blueprint2026/components/BluePrintCard";
import { BluePrintNav } from "../blueprint2026/components/BluePrintNav";
import { TopNav } from "../navigation/top-nav";
import SummaryText from "../blueprint2026/components/SummaryText";
import QuizResultsPreview from "../blueprint2026/components/QuizResultsPreview";
import ConnectionsPreview from "../blueprint2026/components/ConnectionsPreview";
import QuestsPreview from "../blueprint2026/components/QuestsPreview";

const BluePrint2026 = () => {
  const router = useRouter();

  const [isSideNavOpen, setIsSideNavOpen] = useState(false);

  const { userRegistration } = useUserRegistration();

  console.log("user registration", userRegistration);

  useEffect(() => {
    if (!router.isReady) return;

    console.log(userRegistration, "HERE");
  }, [router.isReady, router.query.sharedTeam, userRegistration]);

  return (
    <BluePrintLayout>
      <AnimatePresence mode="wait">
        {!isCheckedIn(userRegistration?.registrationStatus) ? (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <h1 className="text-2xl font-bold text-center">
              You Have Not Checked In!
            </h1>
            <h2 className="text-[20px] opacity-50 text-center font-light">
              Please check in with a BizTech exec to continue.
            </h2>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <BluePrintNav isPartner={false}/>
            <SummaryText name="Firstname" connectionsMade={20} questsComplete={3}/>
            <QuizResultsPreview/>
            <ConnectionsPreview/>
            <QuestsPreview/>
          </div>
        )}
      </AnimatePresence>
    </BluePrintLayout>
  );
};

export default BluePrint2026;
