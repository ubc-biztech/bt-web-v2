"use client";

import { useRouter } from "next/router";
import { useUserRegistration } from "@/pages/companion/index";
import { AnimatePresence } from "framer-motion";
import { useContext, useEffect } from "react";
import { isCheckedIn } from "@/lib/registrationStatus";
import BluePrintLayout from "../blueprint2026/layout/BluePrintLayout";
import { BluePrintNav } from "../blueprint2026/components/BluePrintNav";
import SummaryText from "../blueprint2026/components/SummaryText";
import QuizResultsPreview from "../blueprint2026/components/QuizResultsPreview";
import ConnectionsPreview from "../blueprint2026/components/ConnectionsPreview";
import QuestsPreview from "../blueprint2026/components/QuestsPreview";
import { useConnections } from "@/queries/connections";
import { useQuests } from "@/queries/quests";

const BluePrint2026 = () => {
  const router = useRouter();

  const {
    data: connections,
    isLoading: connectionsLoading,
    isError: connectionsError,
  } = useConnections();

  const {
    data: quests,
    isLoading: questsLoading,
    isError: questsError,
  } = useQuests();

  const { userRegistration } = useUserRegistration();

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
          <div className="flex flex-col gap-4">
            <div className="mb-4">
              <SummaryText
                name="Firstname"
                connectionsMade={20}
                questsComplete={3}
              />
            </div>
            <QuizResultsPreview />

            {!connectionsLoading && (
              <ConnectionsPreview connections={connections} />
            )}

            {!questsLoading && <QuestsPreview quests={quests} />}
          </div>
        )}
      </AnimatePresence>
    </BluePrintLayout>
  );
};

export default BluePrint2026;
