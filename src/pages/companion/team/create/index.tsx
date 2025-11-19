import React, { useEffect, useState, useCallback } from "react";
import Logo from "@/assets/2025/kickstart/biztech_logo.svg";
import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import { fetchAuthSession } from "@aws-amplify/auth";
import { fetchBackend } from "@/lib/db";
import { useRouter } from "next/router";
import Link from "next/link";
import { Registration } from "@/pages/companion/index";
import { Copy, Check } from "lucide-react";

interface TeamData {
  teamID: string;
  eventID: string;
  year: number;
  teamName: string;
  members: string[];
}

const CreateTeam = () => {
  const router = useRouter();
  const [reg, setReg] = useState<Registration | null>(null);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fetchRegistration = useCallback(async () => {
    try {
      const session = await fetchAuthSession();
      const email = session?.tokens?.idToken?.payload?.email as string;
      const eventID = "kickstart";
      const year = "2025";

      const res = await fetchBackend({
        endpoint: `/registrations?eventID=${eventID}&year=${year}&email=${email}`,
        method: "GET",
        authenticatedCall: false,
      });

      const reg = res.data[0];
      if (!reg) {
        throw new Error("No valid registration found");
      }
      setReg(reg);
    } catch (err) {
      router.push("/login?redirect=/companion/team/create");
    }
  }, [router]);

  useEffect(() => {
    fetchRegistration();
  }, [fetchRegistration]);

  const handleTeamSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const teamName = formData.get("team-name") as string;

    if (!teamName || teamName.trim() === "") {
      alert("Please enter a team name");
      return;
    }

    if (!reg) {
      alert(
        "Registration data not loaded. Please wait a moment and try again.",
      );
      return;
    }

    const eventYearKey = reg["eventID;year"] as string;
    const [eventID, yearStr] = eventYearKey.split(";");
    const year = parseInt(yearStr);

    try {
      const payload = {
        eventID,
        year,
        team_name: teamName.trim(),
        memberIDs: [reg.id],
      };

      const res = await fetchBackend({
        endpoint: "/team/make",
        method: "POST",
        data: payload,
      });

      if (res.response) {
        setTeamData({
          teamID: res.response.id,
          eventID: res.response["eventID;year"].split(";")[0],
          year: parseInt(res.response["eventID;year"].split(";")[1]),
          teamName: res.response.teamName,
          members: res.response.memberIDs,
        });
        setError(null);
      }
    } catch (err: any) {
      setError(
        err.message?.message ||
          err.message ||
          "Failed to create team. Please try again.",
      );
      setTeamData(null);
    }
  };

  const copyToClipboard = async () => {
    if (!teamData) return;
    try {
      await navigator.clipboard.writeText(teamData.teamID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Failed to copy to clipboard
    }
  };

  const handleTryAgain = () => {
    setError(null);
    setTeamData(null);
  };

  // Success state
  if (teamData) {
    return (
      <NavBarContainer
        isPartner={reg?.isPartner}
        userName={`${reg?.fname} ${reg?.lname || ""}`}
      >
        <div className="w-full h-full flex flex-col items-center justify-center font-bricolage bg-[#111111] mt-24 md:mt-32 px-4">
          <div className="flex flex-col items-center w-full max-w-[700px]">
            <div className="mb-8">
              <Logo width={130} height={130} />
            </div>

            <h1 className="text-base md:text-lg text-white text-center font-normal mb-6">
              Team created successfully. Your code is:
            </h1>

            <div className="flex items-center gap-3 mb-8">
              <span className="text-5xl md:text-6xl font-bold text-white">
                {teamData.teamID}
              </span>
              <button
                onClick={copyToClipboard}
                className="p-2 rounded-md hover:bg-white/10 transition-colors"
                aria-label="Copy team code"
              >
                {copied ? (
                  <Check className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 md:w-6 md:h-6 text-white" />
                )}
              </button>
            </div>

            <button
              onClick={() => router.push("/companion")}
              className="px-8 py-3 bg-[#1D1D1D] text-white font-bricolage border border-white rounded-lg shadow-[inset_0_0_5px_rgba(255,255,255,0.5),inset_0_0_30px_rgba(255,255,255,0.25)] hover:bg-[#1f1f1f] hover:shadow-[inset_0_0_7px_rgba(255,255,255,0.7),inset_0_0_45px_rgba(255,255,255,0.4)] transition-all duration-300"
            >
              Continue to dashboard
            </button>
          </div>
        </div>
      </NavBarContainer>
    );
  }

  if (error) {
    return (
      <NavBarContainer
        isPartner={reg?.isPartner}
        userName={`${reg?.fname} ${reg?.lname || ""}`}
      >
        <div className="w-full h-full flex flex-col items-center justify-center font-bricolage bg-[#111111] mt-24 md:mt-32 px-4">
          <div className="flex flex-col items-center w-full max-w-[700px]">
            <Logo width={130} height={130} />
            <h1 className="mt-6 text-2xl md:text-[32px] text-white text-center font-normal mb-4">
              Failed to create team
            </h1>
            <p className="text-white/80 text-center mb-8">{error}</p>
            <button
              onClick={handleTryAgain}
              className="px-8 py-3 bg-[#DE7D02] hover:bg-[#f29224] text-white font-semibold rounded-lg transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </NavBarContainer>
    );
  }

  return (
    <NavBarContainer
      isPartner={reg?.isPartner}
      userName={`${reg?.fname} ${reg?.lname || ""}`}
    >
      <div className="w-full h-full flex flex-col items-center justify-center font-bricolage bg-[#111111] mt-24 md:mt-32 px-4">
        <div className="flex flex-col items-center w-full max-w-[700px]">
          <Logo width={130} height={130} />
          <h1 className="mt-6 text-2xl md:text-[32px] text-white text-center font-normal">
            Whats your team name?
          </h1>
          <form
            onSubmit={handleTeamSubmit}
            className="mt-4 w-full flex items-center justify-center"
          >
            <label htmlFor="team-name" className="sr-only">
              Team name
            </label>
            <div className="w-full max-w-[680px] flex items-center">
              <input
                id="team-name"
                name="team-name"
                type="text"
                placeholder="Enter team name"
                className="flex-1 h-11 md:h-12 rounded-md bg-[#EAEAEA] text-[#111111] placeholder:text-[#6B6B6B] px-4 outline-none focus:ring-2 focus:ring-[#DE7D02]/60"
              />
              <button
                type="submit"
                className="ml-2 h-11 md:h-12 w-12 md:w-12 rounded-md bg-[#DE7D02] text-white text-xl flex items-center justify-center"
                aria-label="Continue"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="M13 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </form>
          <p className="mt-4 text-sm md:text-base text-white/80">
            or{" "}
            <Link
              href="/companion/team/join"
              className="text-[#DE7D02] underline"
            >
              join an existing team
            </Link>{" "}
            instead
          </p>
        </div>
      </div>
    </NavBarContainer>
  );
};

export default CreateTeam;
