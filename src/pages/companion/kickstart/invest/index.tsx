import React, { useEffect, useState } from "react";
import { GlowButton } from "@/components/companion/kickstart/ui/GlowButton";
import ScanLogo from "@/assets/2025/kickstart/scan.svg";
import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import { fetchAuthSession } from "@aws-amplify/auth";
import { fetchBackend } from "@/lib/db";
import { useRouter } from "next/router";
import { Registration } from "@/pages/companion/index";
import Loading from "@/components/Loading";

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

const index = () => {
    const router = useRouter();
    const [reg, setReg] = useState<Registration | null>(tempRegistrationData);
    const [isReady, setIsReady] = useState(true);
    const [allTeams, setAllTeams] = useState<any[]>(MOCK_TEAMS);
    const [searchTeams, setSearchTeams] = useState<any[]>(MOCK_TEAMS);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!router.isReady) return;
        if (DISABLE_VERIFY || !router.isReady) return;


        const verifyAccess = async () => {
            try {

                // make sure user is signed in
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
            
                // checks if user is registered for kickstart 2025
                const registration = res.data[0];
                if (!registration) {
                    router.replace("/event/kickstart/2025/register");
                    return;
                }
                setReg(registration);

                // checks if user is on a team
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
                setSearchTeams(teams);

                setIsReady(true);
            } catch (err) {
                console.error("Error gating invest page:", err);
                router.replace(`/login?redirect=${encodeURIComponent("/companion/kickstart/invest")}`);
            }
        };

        verifyAccess();
    }, [router]);


    useEffect(() => {
        if (searchQuery.trim() === "") {
            setSearchTeams(allTeams);
            return;
        }
        const filteredTeams = allTeams.filter((team) =>
            team.teamName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchTeams(filteredTeams);
    }, [searchQuery, allTeams]);

    if (!isReady || !reg) {
        return <Loading />;
    }

    return (
        <NavBarContainer
            isPartner={reg?.isPartner}
            userName={`${reg?.fname} ${reg?.lname}`}
            // TODO: maybe change nav bar in the future
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

                    <div className="flex items-center gap-3 w-full">
                        <input
                            className="flex-1 rounded-md bg-white text-[#1F1F1F] placeholder:text-[#8A8A8A] px-4 py-3 text-base focus:outline-none"
                            placeholder="Filter by name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Filter projects by name"
                        />
                        <button
                            type="button"
                            className="bg-[#DE7D02] hover:bg-[#f29224] transition-colors rounded-md w-12 h-12 flex items-center justify-center p-1.5"
                            aria-label="Scan QR code"
                        >
                            <ScanLogo className="w-6 h-6 shrink-0" />
                        </button>
                    </div>

                    <div className="space-y-3 max-h-[18rem] overflow-y-auto pr-1">
                        {searchTeams.map((team) => (
                            <button
                                key={team.teamID}
                                type="button"
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
                        {searchTeams.length === 0 && (
                            <div className="rounded-xl bg-[#2A2A2A] px-4 py-6 text-center text-[#B8B8B8]">
                                No teams found.
                            </div>
                        )}
                    </div>

                </div>
            </div>
            
        </NavBarContainer>
    )
}

export default index;
