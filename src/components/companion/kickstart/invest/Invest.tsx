import React, { use, useEffect, useMemo, useState } from "react";
import { fetchBackend } from "@/lib/db";
import Loading from "@/components/Loading";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Success from "./flow/Success";
import Comment from "./flow/Comment";
import Render from "./flow/Render";
import ScanIcon from "@/assets/2025/kickstart/scan.svg";
import { KickstartPages, useTeam } from "../../events/Kickstart2025";
import { useUserRegistration } from "@/pages/companion";
import { motion } from "framer-motion";
import QR from "./flow/QR";
import { RawInvestment } from "./investmentsGrid/InvestmentCard";
import InvestmentsGrid from "./investmentsGrid/InvestmentsGrid";
import { useRouter } from "next/router";
// @Elijah

// will try to check if user is logged in, is registered for kickstart 2025, and is assigned to a team
// Will redirect to login/registration/team pages as necessary

// If there is no team selected, then we show the team selection screen
// While there is a team selected, we will put a popup on the screen
//     This will handle the investment flow, and depending on the stage (such as amount, comment, success), will show different parts
// pressing the x button just sets selected team to null, hiding the popup.

// I have not thought about Partner investment and Admin investment yet as I am not super sure about how their backend/database scheme flows/works. (is it similar to user investment?)

enum InvestmentStage {
  AMOUNT = "AMOUNT",
  COMMENT = "COMMENT",
  SUCCESS = "SUCCESS",
}

type TeamListing = {
  id: string;
  teamName: string;
  members: string[];
};

const Invest = ({
  setPage,
  sharedTeamId,
  setPendingSharedTeam,
}: {
  setPage: (page: KickstartPages) => void;
  sharedTeamId: string | null;
  setPendingSharedTeam: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const { userRegistration } = useUserRegistration();
  const { team } = useTeam();
  const router = useRouter();
  const [allTeams, setAllTeams] = useState<TeamListing[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<TeamListing | null>(null);
  const [investmentStage, setInvestmentStage] = useState<InvestmentStage>(
    InvestmentStage.AMOUNT,
  );
  const [openQR, setOpenQR] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [confirmedAmount, setConfirmedAmount] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [flowError, setFlowError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    teamName: string;
    amount: number;
    newBalance: number;
  } | null>(null);

  const [isInvesting, setIsInvesting] = useState(false);
  const [investments, setInvestments] = useState<RawInvestment[]>([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsRes = await fetchBackend({
          endpoint: `/team/kickstart/2025`,
          method: "GET",
          authenticatedCall: true,
        });
        const teamsData = Array.isArray(teamsRes)
          ? (teamsRes as TeamListing[]).filter(
              (t: TeamListing) => !team || t.id != team.id,
            )
          : [];
        setAllTeams(teamsData);
      } catch (err) {
        console.error("Error fetching Kickstart teams:", err);
      }
    };

    fetchTeams();
  }, []);

  useEffect(() => {
    if (team?.id === sharedTeamId) {
      setPendingSharedTeam(null);
      return;
    }

    if (!sharedTeamId || !allTeams.length) return;

    const teamToSelect = allTeams.find((team) => team.id === sharedTeamId);
    if (!teamToSelect) return;

    setSelectedTeam(teamToSelect);
    setInvestmentStage(InvestmentStage.AMOUNT);
    setAmountInput("");
    setConfirmedAmount(null);
    setComment("");
    setFlowError(null);
    setSuccessInfo(null);
    setPendingSharedTeam(null);
  }, [sharedTeamId, allTeams, setPendingSharedTeam]);

  useEffect(() => {
    if (!team?.id) return;

    const fetchFunding = async () => {
      try {
        const res = await fetchBackend({
          endpoint: `/investments/teamStatus/${team.id}`,
          method: "GET",
          authenticatedCall: true,
        });
      } catch (error) {
        console.error("Failed to fetch funding status:", error);
      }
    };

    fetchFunding();
  }, [team?.id]);

  useEffect(() => {
    if (!userRegistration?.id || userRegistration?.isPartner) return;

    const fetchInvestments = async () => {
      try {
        const data = await fetchBackend({
          endpoint: `/investments/investorStatus/${userRegistration.id}`,
          method: "GET",
          authenticatedCall: true,
        });

        if (data) {
          setInvestments(data.investments || []);
        }
      } catch (error) {
        console.error("Error fetching investments data:", error);
      }
    };

    fetchInvestments();
  }, [userRegistration?.id, userRegistration?.isPartner]);

  const filteredTeams = useMemo(() => {
    const availableTeams = team
      ? allTeams.filter((listing) => listing.id !== team.id)
      : allTeams;

    if (!searchQuery.trim()) return availableTeams;

    return availableTeams.filter((listing) =>
      listing.teamName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [allTeams, searchQuery, team]);

  const resetFlow = () => {
    setSelectedTeam(null);
    setInvestmentStage(InvestmentStage.AMOUNT);
    setAmountInput("");
    setConfirmedAmount(null);
    setComment("");
    setFlowError(null);
    setSuccessInfo(null);
  };

  const refreshWithoutSharedTeam = async () => {
    await router.replace(router.pathname, undefined, { shallow: true });
    window.location.reload();
  };

  const handleBackButton = () => {
    // If QR is open, close it and reset flow (same as X button in QR)
    if (openQR) {
      resetFlow();
      setOpenQR(false);
      return;
    }

    // If selectedTeam is set and we're on success stage, reset and refresh (same as X button in Success)
    if (selectedTeam && investmentStage === InvestmentStage.SUCCESS) {
      resetFlow();
      refreshWithoutSharedTeam();
      return;
    }

    // If selectedTeam is set (any other stage), reset flow (same as X button in Render/Comment)
    if (selectedTeam) {
      resetFlow();
      return;
    }

    // Otherwise, just exit investing mode (current behavior)
    setIsInvesting(false);
  };

  const isAmountValid = () => {
    const parsed = Number(amountInput);
    if (!Number.isFinite(parsed) || parsed <= 0) return false;
    return parsed <= userRegistration?.balance;
  };

  const validateAmount = (): number | null => {
    const parsed = Number(amountInput);
    if (Number.isNaN(parsed) || parsed <= 0) {
      setFlowError("Enter a valid amount greater than zero.");
      return null;
    }
    if (parsed > userRegistration?.balance) {
      setFlowError("You cannot invest more than your available funds.");
      return null;
    }
    setFlowError(null);
    return parsed;
  };

  const handleProceedToComment = () => {
    const parsed = validateAmount();
    if (parsed === null) return;
    setConfirmedAmount(parsed);
    setInvestmentStage(InvestmentStage.COMMENT);
  };

  const handleSubmitInvestment = async () => {
    if (!selectedTeam || confirmedAmount === null || !comment.trim()) return;

    setIsSubmitting(true);
    setFlowError(null);
    try {
      // 1. first investment in investments service
      await fetchBackend({
        endpoint: `/investments/invest`,
        method: "POST",
        data: {
          investorId: userRegistration?.id,
          teamId: selectedTeam.id,
          amount: confirmedAmount,
          comment: comment.trim(),
        },
        authenticatedCall: true,
      });

      // 2. nudge the BTX price for the corresponding project
      try {
        await fetchBackend({
          endpoint: "/btx/admin/investment-impact",
          method: "POST",
          data: {
            teamId: selectedTeam.id,
            amountDelta: confirmedAmount,
          },
          authenticatedCall: true,
        });
      } catch (e) {
        console.error("Failed to apply BTX investment impact:", e);
      }

      const newBalance = (userRegistration?.balance ?? 0) - confirmedAmount;
      setSuccessInfo({
        teamName: selectedTeam.teamName,
        amount: confirmedAmount,
        newBalance,
      });

      setInvestmentStage(InvestmentStage.SUCCESS);
    } catch (error: any) {
      console.error("Failed to create investment:", error);
      setFlowError(
        error?.message || "Unable to submit investment. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
      setSearchQuery("");
    }
  };

  const renderInvestmentFlow = () => {
    if (!selectedTeam) return null;

    if (investmentStage === InvestmentStage.SUCCESS && successInfo) {
      return (
        <Success
          successInfo={successInfo}
          resetFlow={resetFlow}
          setPage={setPage}
        />
      );
    }

    if (investmentStage === InvestmentStage.COMMENT) {
      return (
        <Comment
          selectedTeam={selectedTeam}
          confirmedAmount={confirmedAmount}
          comment={comment}
          setComment={setComment}
          flowError={flowError}
          isSubmitting={isSubmitting}
          handleSubmitInvestment={handleSubmitInvestment}
          resetFlow={resetFlow}
        />
      );
    }

    return (
      <Render
        selectedTeam={selectedTeam}
        amountInput={amountInput}
        setAmountInput={setAmountInput}
        handleProceedToComment={handleProceedToComment}
        availableFunds={userRegistration?.balance}
        flowError={flowError}
        isAmountValid={isAmountValid}
        resetFlow={resetFlow}
      />
    );
  };

  if (!userRegistration || (!team && !userRegistration.isPartner)) {
    return <Loading />;
  }

  const showGrid = !isInvesting && !userRegistration.isPartner;

  return (
    <InvestWrapper isFullWidth={showGrid}>
      <div className="absolute top-0 left-0 mt-4 flex flex-row items-center justify-center w-full">
        <header className="font-instrument text-[32px] flex items-end leading-none">
          Kickstart
        </header>
      </div>
      {showGrid && (
        <InvestmentsGrid
          userRegistration={userRegistration}
          investments={investments}
          onClickInvest={() => setIsInvesting(true)}
        />
      )}
      {!userRegistration.isPartner && isInvesting && (
        <div className="w-full mb-4">
          <button
            type="button"
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            onClick={handleBackButton}
            aria-label="Back to investments"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </button>
        </div>
      )}
      {!selectedTeam &&
        !openQR &&
        (userRegistration.isPartner || isInvesting) && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-[#5F3F1A] rounded-lg w-full"
          >
            <div className="w-full h-full flex flex-col items-left justify-center font-bricolage space-y-4 bg-[#201F1E] p-6 rounded-lg">
              <div>
                <p className="text-[#FFCC8A]">INVEST IN A PROJECT</p>
                <header className="text-[32px] leading-tight tracking-tight">
                  What project would you like to invest in?
                </header>
              </div>

              <div className="flex gap-2 items-center w-full overflow-hidden">
                <input
                  className="flex-grow min-w-0 rounded-lg bg-white/95 text-[#1F1F1F] px-3 py-2 text-base focus:outline-none"
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="button"
                  className="flex-shrink-0 rounded-lg bg-[#DE7D02] hover:bg-[#f29224] text-white px-4 py-2 h-full"
                  onClick={() => setOpenQR(true)}
                >
                  <ScanIcon className="w-max h-max flex items-center justify-center p-0.5 shrink-0" />
                </button>
              </div>

              <div className="space-y-3 max-h-[18rem] overflow-y-auto pr-1">
                {filteredTeams.map((team) => (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => {
                      setSelectedTeam(team);
                      setInvestmentStage(InvestmentStage.AMOUNT);
                      setAmountInput("");
                      setConfirmedAmount(null);
                      setComment("");
                      setFlowError(null);
                      setSuccessInfo(null);
                    }}
                    className="w-full text-left rounded-xl bg-[#2A2A2A] px-4 py-3 transition-all hover:bg-[#3A3A3A] border border-transparent hover:border-[#5F3F1A]/70"
                  >
                    <p className="text-white font-semibold text-[18px]">
                      {team.teamName}
                    </p>
                    <p className="text-[#B8B8B8] md:text-sm text-xs mt-1">
                      {team.members?.join(", ")}
                    </p>
                  </button>
                ))}
                {filteredTeams.length === 0 && searchQuery === "" && (
                  <div className="rounded-xl bg-[#2A2A2A] px-4 py-6 text-center text-[#B8B8B8]">
                    Loading ...
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

      {selectedTeam && (userRegistration.isPartner || isInvesting) && (
        <>{renderInvestmentFlow()}</>
      )}
      {openQR && (userRegistration.isPartner || isInvesting) && (
        <QR
          resetFlow={resetFlow}
          setOpenQR={setOpenQR}
          currentTeam={team?.id ?? ""}
        />
      )}
    </InvestWrapper>
  );
};

const InvestWrapper = ({
  children,
  isFullWidth = false,
}: {
  children: React.ReactNode;
  isFullWidth?: boolean;
}) => {
  return (
    <div
      className={`w-screen h-screen flex flex-col items-center ${
        isFullWidth ? "justify-start pt-10" : "justify-center"
      } relative`}
    >
      <div
        className={`${
          isFullWidth ? "w-full flex flex-col items-center" : "md:w-3/5"
        } px-4 text-[18px]`}
      >
        {children}
      </div>
    </div>
  );
};

export default Invest;
