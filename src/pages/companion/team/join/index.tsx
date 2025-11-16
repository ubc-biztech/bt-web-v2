import React, { useEffect, useState, useCallback } from "react";
import Logo from "@/assets/2025/kickstart/biztech_logo.svg";
import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import { fetchAuthSession } from "@aws-amplify/auth";
import { fetchBackend } from "@/lib/db";
import { useRouter } from "next/router";
import { Registration } from "@/pages/companion/index";
import Link from "next/link";

interface JoinTeamResponse {
  eventID: string;
  year: number;
  memberID: string;
  teamID: string;
}

const JoinTeam = () => {
  const router = useRouter();
  const [reg, setReg] = useState<Registration | null>(null);
  const [joinResponse, setJoinResponse] = useState<JoinTeamResponse | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

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
      router.push("/login?redirect=/companion/team/join");
    }
  }, [router]);

  useEffect(() => {
    fetchRegistration();
  }, [fetchRegistration]);

  const handleJoinSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const teamCode = formData.get("team-code") as string;

    if (!teamCode || teamCode.trim() === "") {
      alert("Please enter a team code");
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
        memberID: reg.id,
        teamID: teamCode.trim(),
      };

      const res = await fetchBackend({
        endpoint: "/team/join",
        method: "POST",
        data: payload,
      });

      if (res.response) {
        setJoinResponse({
          eventID: res.response.eventID,
          year: res.response.year,
          memberID: res.response.memberID,
          teamID: res.response.teamID,
        });
        setError(null);
      }
    } catch (err: any) {
      setError(
        err.message?.message ||
          err.message ||
          "Failed to join team. Please check the team code and try again.",
      );
      setJoinResponse(null);
    }
  };

  const handleTryAgain = () => {
    setError(null);
    setJoinResponse(null);
  };

  if (joinResponse) {
    return (
      <NavBarContainer
        isPartner={reg?.isPartner}
        userName={`${reg?.fname} ${reg?.lname}`}
      >
        <div className="w-full h-full flex flex-col items-center justify-center font-bricolage bg-[#111111] mt-24 md:mt-32 px-4">
          <div className="flex flex-col items-center w-full max-w-[700px]">
            <div className="mb-8">
              <Logo width={130} height={130} />
            </div>

            <h1 className="text-base md:text-lg text-white text-center font-normal mb-6">
              Successfully joined team!
            </h1>

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
        userName={`${reg?.fname} ${reg?.lname}`}
      >
        <div className="w-full h-full flex flex-col items-center justify-center font-bricolage bg-[#111111] mt-24 md:mt-32 px-4">
          <div className="flex flex-col items-center w-full max-w-[700px]">
            <Logo width={130} height={130} />
            <h1 className="mt-6 text-2xl md:text-[32px] text-white text-center font-normal mb-4">
              Failed to join team
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
      userName={`${reg?.fname} ${reg?.lname}`}
    >
      <div className="w-full h-full flex flex-col items-center justify-center font-bricolage bg-[#111111] mt-24 md:mt-32 px-4">
        <div className="flex flex-col items-center w-full max-w-[700px]">
          <Logo width={130} height={130} />
          <h1 className="mt-6 text-2xl md:text-[32px] text-white text-center font-normal">
            Enter your team&#39;s code
          </h1>
          <form
            onSubmit={handleJoinSubmit}
            className="mt-4 w-full flex items-center justify-center"
          >
            <label htmlFor="team-code" className="sr-only">
              Team code
            </label>
            <div className="w-full max-w-[680px] flex items-center">
              <input
                id="team-code"
                name="team-code"
                type="text"
                placeholder="Enter team code"
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
              href="/companion/team/create"
              className="text-[#DE7D02] underline"
            >
              create a team instead
            </Link>
          </p>
        </div>
      </div>
    </NavBarContainer>
  );
};

export default JoinTeam;
