import React, { useEffect, useMemo, useState } from "react";
import ScanLogo from "@/assets/2025/kickstart/scan.svg";
import CreditCard from "@/assets/2025/kickstart/credit_card.svg";
import MessageLogo from "@/assets/2025/kickstart/message.svg";
import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import Progress0_2 from "@/assets/2025/kickstart/progress0_2.svg";
import Progress1_2 from "@/assets/2025/kickstart/progress1_2.svg";
import Progress2_2 from "@/assets/2025/kickstart/progress2_2.svg";             
import { fetchAuthSession } from "@aws-amplify/auth";
import { fetchBackend } from "@/lib/db";
import { useRouter } from "next/router";
import { Registration } from "@/pages/companion/index";
import Loading from "@/components/Loading";
import { ArrowRight, MessageCircle, X, DollarSign, CheckCircle2 } from "lucide-react";
import { set } from "lodash";

const tempRegistrationData: Registration = {
    id: "temp-id",
    fname: "Temp",
    lname: "User",
    email: "temp@example.com",
    teamID: "temp-team",
    isPartner: false,
};

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

const DISABLE_VERIFY = true; // flip to false when backend is ready

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

const InvestPage = () => {
    const router = useRouter();
    const [reg, setReg] = useState<Registration | null>(tempRegistrationData);
    const [isReady, setIsReady] = useState(true);
    const [allTeams, setAllTeams] = useState<TeamListing[]>(MOCK_TEAMS);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTeam, setSelectedTeam] = useState<TeamListing | null>(null);
    const [investmentStage, setInvestmentStage] = useState<InvestmentStage>(InvestmentStage.AMOUNT);
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
        if (!router.isReady) return;
        if (DISABLE_VERIFY) return;

        const verifyAccess = async () => {
            try {
                const session = await fetchAuthSession();
                const email = session?.tokens?.idToken?.payload?.email as string | undefined;
                if (!email) {
                    throw new Error("No email found in session");
                }
                const eventID = "kickstart";
                const year = "2025";

                const res = await fetchBackend({
                    endpoint: `/registrations?eventID=${eventID}&year=${year}&email=${email}`,
                    method: "GET",
                    authenticatedCall: false,
                });

                const registration = res.data[0];
                if (!registration) {
                    router.replace("/event/kickstart/2025/register");
                    return;
                }
                setReg(registration);

                const teamResponse = await fetchBackend({
                    endpoint: `/team/getTeamFromUserID`,
                    method: "POST",
                    data: {
                        userID: registration.id || email,
                    },
                    authenticatedCall: false,
                });

                if (!teamResponse?.team) {
                    router.replace("/companion/team");
                    return;
                }

                const teamsRes = await fetchBackend({
                    endpoint: `/team/kickstart/2025`,
                    method: "GET",
                    authenticatedCall: false,
                });
                const teams = teamsRes.data || [];
                setAllTeams(teams);

                setIsReady(true);
            } catch (err) {
                console.error("Error gating invest page:", err);
                router.replace(`/login?redirect=${encodeURIComponent("/companion/kickstart/invest")}`);
            }
        };

        verifyAccess();
    }, [router]);

    useEffect(() => {
        if (!reg?.teamID) return;
        if (DISABLE_VERIFY) {
            setAvailableFunds(7500);
            return;
        }

        const fetchFunding = async () => {
            try {
                const res = await fetchBackend({
                    endpoint: `/investments/teamStatus/${reg.teamID}`,
                    method: "GET",
                    authenticatedCall: false,
                });
                setAvailableFunds(res?.funding ?? 0);
            } catch (error) {
                console.error("Failed to fetch funding status:", error);
            }
        };

        fetchFunding();
    }, [reg?.teamID]);

    const filteredTeams = useMemo(() => {
        if (!searchQuery.trim()) return allTeams;
        return allTeams.filter((team) =>
            team.teamName.toLowerCase().includes(searchQuery.toLowerCase())
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

    const validateAmount = (): number | null => {
        const parsed = Number(amountInput);
        if (Number.isNaN(parsed) || parsed <= 0) {
            setFlowError("Enter a valid amount greater than zero.");
            return null;
        }
        if (parsed > availableFunds) {
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
        if (DISABLE_VERIFY) { 
            setInvestmentStage(InvestmentStage.SUCCESS);
            setSuccessInfo({
                    teamName: selectedTeam.teamName,
                    amount: confirmedAmount,
                    newBalance: -67,
            });  
            return;
        }
        setIsSubmitting(true);
        setFlowError(null);
        try {
            await fetchBackend({
                endpoint: `/invest`,
                method: "POST",
                data: {
                    investorId: reg?.id,
                    teamId: selectedTeam.teamID,
                    amount: confirmedAmount,
                    comment: comment.trim(),
                },
                authenticatedCall: false,
            });

            setAvailableFunds((prev) => {
                const updated = Math.max(0, prev - confirmedAmount);
                setSuccessInfo({
                    teamName: selectedTeam.teamName,
                    amount: confirmedAmount,
                    newBalance: updated,
                });
                return updated;
            });
            setInvestmentStage(InvestmentStage.SUCCESS);
        } catch (error: any) {
            console.error("Failed to create investment:", error);
            setFlowError(error?.message || "Unable to submit investment. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderInvestmentFlow = () => {
        if (!selectedTeam) return null;

        if (investmentStage === InvestmentStage.SUCCESS && successInfo) {
            return (
                <div className="space-y-1">

                <div className="space-y-5 bg-[#1A1918] p-5 rounded-lg">
                    <button
                        type="button"
                        className="absolute top-4 right-4 text-white/70 hover:text-white"
                        onClick={resetFlow}
                        aria-label="Close investment flow"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    <div>
                        <p className="text-[#FFCC8A] text-xs">INVEST IN A PROJECT</p>
                        <h2 className="text-white text-xl font-semibold mt-1 leading-tight">
                            Congratulations! You've invested <span className="text-[#FFB35C]">
                                 ${successInfo.amount.toLocaleString()}
                             </span>{" "}
                             into <span className="text-[#FFB35C]">{successInfo.teamName}</span>.
                        </h2>
                    </div>


                    <div className="flex items-center gap-3 text-sm text-[#B8B8B8]">
                        Your new balance is ${successInfo.newBalance.toLocaleString()}.
                    </div>

                    
                </div>

                <div className="flex flex-col gap-3 bg-[#1A1918]  p-5 rounded-lg ">
                    <div className="flex items-center justify-between text-sm text-[#B8B8B8]">
                        <div className="flex items-center">
                            <Progress2_2 className="w-10 h-10 text-[#FFB35C] shrink-0 justify-center" />
                            Thanks for submitting!
                        </div>
 
                        <button
                            type="button"
                            className="w-30 rounded-lg bg-[#DE7D02] hover:bg-[#f29224] px-4 py-3 font-semibold text-white transition-colors"
                            onClick={() => router.push("/companion")}
                        >
                            Return to Dashboard
                        </button>

                    </div>
                    
                </div>  
            </div>
            );
        }

        if (investmentStage === InvestmentStage.COMMENT) {
            return (
            <div className="space-y-1">

                <div className="space-y-5 bg-[#1A1918] p-5 rounded-lg">
                    <button
                        type="button"
                        className="absolute top-4 right-4 text-white/70 hover:text-white"
                        onClick={resetFlow}
                        aria-label="Close investment flow"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    <div>
                        <p className="text-[#FFCC8A] text-xs">INVEST IN A PROJECT</p>
                        <h2 className="text-white text-xl font-semibold mt-1 leading-tight">
                            Invest in <span className="text-[#DE7D02]">{selectedTeam.teamName}</span>
                        </h2>
                    </div>

                    <div className="pl-4 rounded-2xl">
                        <div className="flex items-center gap-2 text-white font-semibold ">
                            <CreditCard className="text-[#FFFFFF] bg-[#FFCC8A] transition-colors rounded-md w-max h-max flex items-center justify-center p-1 shrink-0" />
                            Amount: <span className="text-[#DE7D02]">${confirmedAmount?.toLocaleString()}</span> 
                        </div>
                    </div>

                    <div className="rounded-2xl bg-[#2C2B2A] p-4 space-y-3">
                        <div className="flex items-center gap-2 text-white font-semibold ">
                            <MessageLogo className="text-[#FFFFFF] bg-[#DE7D02] transition-colors rounded-md w-max h-max flex items-center justify-center p-1 shrink-0" />
                            Comments
                        </div>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Leave a message or feedback"
                            className="w-full rounded-lg bg-white/95 text-[#1F1F1F] px-3 py-2 min-h-[110px] resize-none focus:outline-none"
                        />
                    </div>

                    {flowError && <p className="text-sm text-red-400">{flowError}</p>}
                    
                </div>

                <div className="flex flex-col gap-3 bg-[#1A1918]  p-5 rounded-lg ">
                    <div className="flex items-center gap-3 text-sm text-[#B8B8B8]">
                        <Progress1_2 className="w-10 h-10 text-[#FFB35C] shrink-0 justify-center" />
                        We'll deduct from your spending account. This will not decrease your own funding.
                        {/* <div
                                className="rounded-lg bg-[#DE7D02] hover:bg-[#f29224] text-white px-4 w-25 h-10 opacity-30 flex items-center"
                            >
                            <p>invest</p>
                        </div> */}
                        <button
                            type="button"
                            className="rounded-lg bg-[#DE7D02] hover:bg-[#f29224] px-4 py-3 font-semibold text-white transition-colors disabled:opacity-50"
                            disabled={!comment.trim() || isSubmitting}
                            onClick={handleSubmitInvestment}
                        >
                            {isSubmitting ? "Submitting..." : "Invest"}
                        </button>

                    </div>
                    
                </div>  
            </div>
        );

        }

        return (
            <div className="space-y-1">

                <div className="space-y-5 bg-[#1A1918] p-5 rounded-lg">
                    <button
                        type="button"
                        className="absolute top-4 right-4 text-white/70 hover:text-white"
                        onClick={resetFlow}
                        aria-label="Close investment flow"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    <div>
                        <p className="text-[#FFCC8A] text-xs">INVEST IN A PROJECT</p>
                        <h2 className="text-white text-xl font-semibold mt-1 leading-tight">
                            Invest in <span className="text-[#DE7D02]">{selectedTeam.teamName}</span>
                        </h2>
                    </div>

                    <div className="rounded-2xl bg-[#2C2B2A] p-4 space-y-3">
                        <div className="flex items-center gap-2 text-white font-semibold ">
                            <CreditCard className="text-[#FFFFFF] bg-[#DE7D02] transition-colors rounded-md w-max h-max flex items-center justify-center p-1 shrink-0" />
                            How much would you like to invest?
                        </div>
                        <div className="flex gap-2">
                            <input
                                className="flex-1 rounded-lg bg-white/95 text-[#1F1F1F] px-3 py-2 text-base focus:outline-none"
                                placeholder="Amount ($)"
                                type="number"
                                value={amountInput}
                                onChange={(e) => setAmountInput(e.target.value)}
                            />
                            <button
                                type="button"
                                className="rounded-lg bg-[#DE7D02] hover:bg-[#f29224] text-white px-4"
                                onClick={handleProceedToComment}
                            >
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-[#B8B8B8]">
                            Available funds: ${availableFunds.toLocaleString()}
                        </p>
                    </div>
                    <div className="pl-4 rounded-2xl">
                        <div className="flex items-center gap-2 text-white font-semibold ">
                            <MessageLogo className="text-[#FFFFFF] bg-[#DE7D02] transition-colors rounded-md w-max h-max flex items-center justify-center p-1 shrink-0" />
                            Comments
                        </div>
                    </div>

                    {flowError && <p className="text-sm text-red-400">{flowError}</p>}
                    
                </div>

                <div className="flex flex-col gap-3 bg-[#1A1918]  p-5 rounded-lg ">
                    <div className="flex items-center gap-3 text-sm text-[#B8B8B8]">
                        <Progress0_2 className="w-10 h-10 text-[#FFB35C] shrink-0 justify-center" />
                        We'll deduct from your spending account. This will not decrease your own funding.
                        <div
                            className="rounded-lg bg-[#DE7D02] hover:bg-[#f29224] text-white px-4 py-3 opacity-30 flex items-center"
                            >
                            <p>invest</p>
                        </div>

                    </div>
                    
                </div>  
            </div>
        );

    };

    if (!isReady || !reg) {
        return <Loading />;
    }


    // If there is no team selected, then we show the team selection screen
    // While there is a team selected, we will put a popup on the screen
    //     This will handle the investment flow, and depending on the stage (such as amount, comment, success), will show different parts
    // pressing the x button just sets selected team to null, hiding the popup.


    return (
        <NavBarContainer
            isPartner={reg?.isPartner}
            userName={`${reg?.fname} ${reg?.lname}`}
            hide={false}
        >
            <div className="border border-[#5F3F1A] mt-24 p-0.5 rounded-lg w-full md:w-3/5 mx-auto">
                <div className='w-full h-full flex flex-col items-left justify-center font-bricolage space-y-4 bg-[#201F1E] p-6 rounded-lg'>
                    <div>
                        <p className="text-[#FFCC8A]">INVEST IN A PROJECT</p>
                        <header className='text-[32px] leading-tight tracking-tight'>
                            What project would you like to invest in?
                        </header>
                    </div>

                   <div className="flex gap-2 items-center w-full overflow-hidden">
                        <input
                            className="flex-grow min-w-0 rounded-lg bg-white/95 text-[#1F1F1F] px-3 py-2 text-base focus:outline-none"
                            placeholder="Amount ($)"
                            type="number"
                            value={amountInput}
                            onChange={(e) => setAmountInput(e.target.value)}
                        />
                        <button
                            type="button"
                            className="flex-shrink-0 rounded-lg bg-[#DE7D02] hover:bg-[#f29224] text-white px-4 h-full"
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
                        {filteredTeams.length === 0 && (
                            <div className="rounded-xl bg-[#2A2A2A] px-4 py-6 text-center text-[#B8B8B8]">
                                No teams found.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedTeam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 px-4">
                    <div className="relative w-full max-w-xl border border-[#5F3F1A] rounded-lg p-1 shadow-2xl">
                        {renderInvestmentFlow()}
                    </div>
                </div>
            )}
        </NavBarContainer>
    );
};

export default InvestPage;
