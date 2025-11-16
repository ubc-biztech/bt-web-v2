import React, { useEffect, useMemo, useState } from "react";
import { fetchBackend } from "@/lib/db";
import Loading from "@/components/Loading";
import { ArrowRight } from "lucide-react";
import Success from "./flow/Success";
import Comment from "./flow/Comment";
import Render from "./flow/Render";
import { KickstartPages, useTeam } from "../../events/Kickstart2025";
import { useUserRegistration } from "@/pages/companion";
// @Elijah

// will try to check if user is logged in, is registered for kickstart 2025, and is assigned to a team
// Will redirect to login/registration/team pages as necessary

// If there is no team selected, then we show the team selection screen
// While there is a team selected, we will put a popup on the screen
//     This will handle the investment flow, and depending on the stage (such as amount, comment, success), will show different parts
// pressing the x button just sets selected team to null, hiding the popup.

// I have not thought about Partner investment and Admin investment yet as I am not super sure about how their backend/database scheme flows/works. (is it similar to user investment?)

const MOCK_TEAMS = [
  {
    teamID: "team123",
    teamName: "Public Speakers",
    members: ["John Grey", "Rohan Patel", "Jimmy Sam"],
  },
  {
    teamID: "team456",
    teamName: "MMD",
    members: ["Dhrishty Dhawan", "Yumin Chang", "Stephanie Lee"],
  },
  {
    teamID: "team789",
    teamName: "Team Dev",
    members: ["Isaac Liu", "Jay Park", "Kevin Xiao"],
  },
  {
    teamID: "team999",
    teamName: "Team Internal",
    members: ["Ashley Low", "Erping Sun", "Mikayla Liang"],
  },
  {
    teamID: "team676",
    teamName: "Team Elijah",
    members: ["Eli Zhao", "Elijah Zhao", "Elijah Zhou"],
  },
];

const DISABLE_VERIFY = false; // flip to false when backend is ready

enum InvestmentStage {
  AMOUNT = "AMOUNT",
  COMMENT = "COMMENT",
  SUCCESS = "SUCCESS",
}

type TeamListing = {
  teamID: string;
  teamName: string;
  members: string[];
};

const Invest = ({ setPage }: { setPage: (page: KickstartPages) => void }) => {
  const { userRegistration } = useUserRegistration();
  const { team } = useTeam();

  const [allTeams, setAllTeams] = useState<TeamListing[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<TeamListing | null>(null);
  const [investmentStage, setInvestmentStage] = useState<InvestmentStage>(
    InvestmentStage.AMOUNT,
  );
  const [amountInput, setAmountInput] = useState("");
  const [confirmedAmount, setConfirmedAmount] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [flowError, setFlowError] = useState<string | null>(null);
  const [availableFunds, setAvailableFunds] = useState<number>(7500);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    teamName: string;
    amount: number;
    newBalance: number;
  } | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teams = await fetchBackend({
          endpoint: `/team/kickstart/2025`,
          method: "GET",
          authenticatedCall: true,
        });
        setAllTeams(teams ?? []);
      } catch (err) {
        console.error("Error fetching Kickstart teams:", err);
      }
    };

    fetchTeams();
  }, []);

  useEffect(() => {
    if (!team?.id) return;
    if (DISABLE_VERIFY) {
      setAvailableFunds(7500);
      return;
    }

    const fetchFunding = async () => {
      try {
        console.log("test1");

        const res = await fetchBackend({
          endpoint: `/investments/teamStatus/${team.id}`,
          method: "GET",
          authenticatedCall: true,
        });

        setAvailableFunds(res?.funding);
      } catch (error) {
        console.error("Failed to fetch funding status:", error);
      }
    };

    fetchFunding();
  }, [team?.id]);

  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return allTeams;
    return allTeams.filter((team) =>
      team.teamName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [allTeams, searchQuery]);

  const resetFlow = () => {
    setSelectedTeam(null);
    setInvestmentStage(InvestmentStage.AMOUNT);
    setAmountInput("");
    setConfirmedAmount(null);
    setComment("");
    setFlowError(null);
    setSuccessInfo(null);
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

    // TODO remove and test with backend
    if (DISABLE_VERIFY) {
      setSearchQuery("");
      setInvestmentStage(InvestmentStage.SUCCESS);
      setSuccessInfo({
        teamName: selectedTeam.teamName,
        amount: confirmedAmount,
        newBalance: userRegistration?.balance - confirmedAmount,
      });
      return;
    }

    setIsSubmitting(true);
    setFlowError(null);
    try {
      await fetchBackend({
        endpoint: `/investments/invest`,
        method: "POST",
        data: {
          investorId: userRegistration?.id,
          teamId: team?.id,
          amount: confirmedAmount,
          comment: comment.trim(),
        },
      });

      setAvailableFunds((prev) => {
        const updated = Math.max(0, prev - confirmedAmount);
        setSuccessInfo({
          teamName: selectedTeam.teamName,
          amount: confirmedAmount,
          newBalance: userRegistration?.balance - confirmedAmount,
        });
        return updated;
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

  if (!userRegistration || !team) {
    return <Loading />;
  }

  return (
    <InvestWrapper>
      {!selectedTeam && (
        <div className="border border-[#5F3F1A] rounded-lg w-full">
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
                onClick={handleProceedToComment}
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[18rem] overflow-y-auto pr-1">
              {filteredTeams.map((team) => (
                <button
                  key={team.teamID}
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
              {userRegistration?.balance}
              {filteredTeams.length === 0 && (
                <div className="rounded-xl bg-[#2A2A2A] px-4 py-6 text-center text-[#B8B8B8]">
                  No teams found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedTeam && <>{renderInvestmentFlow()}</>}
    </InvestWrapper>
  );
};

const InvestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      <div className="md:w-3/5 text-[18px]">{children}</div>
    </div>
  );
};

export default Invest;
