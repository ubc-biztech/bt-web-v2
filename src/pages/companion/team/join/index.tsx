import React, { useEffect, useState, useCallback } from "react";
import Logo from "@/assets/2025/kickstart/biztech_logo.svg";
import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import { fetchAuthSession } from "@aws-amplify/auth";
import { fetchBackend } from "@/lib/db";
import { useRouter } from "next/router";
import { Registration } from "@/pages/companion/index";
import Link from "next/link";

const JoinTeam = () => {
  const router = useRouter();
  const [reg, setReg] = useState<Registration | null>(null);
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
      console.error("Error fetching registration:", err);
      router.push("/login?redirect=/companion/team/join");
    }
  }, [router]);

  useEffect(() => {
    fetchRegistration();
  }, [fetchRegistration]);

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
          <form className="mt-4 w-full flex items-center justify-center">
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
                type="button"
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
