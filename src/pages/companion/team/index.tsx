import React, { useEffect, useState } from "react";
import { GlowButton } from "@/components/companion/kickstart/ui/GlowButton";
import Logo from "@/assets/2025/kickstart/biztech_logo.svg";
import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import Link from "next/link";
import { fetchAuthSession } from "@aws-amplify/auth";
import { fetchBackend } from "@/lib/db";
import { useRouter } from "next/router";
import { Registration } from "@/pages/companion/index";

// @Ali

const TeamIndex = () => {
  const router = useRouter();
  const [reg, setReg] = useState<Registration | null>(null);
  const fetchRegistration = async () => {
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
      router.push("/login?redirect=/companion/team");
    }
  };

  useEffect(() => {
    fetchRegistration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLeaveTeam = async () => {
    if (!reg) {
      alert("Registration data not loaded");
      return;
    }

    // Parse eventID and year from the "eventID;year" field
    const eventYearKey = reg["eventID;year"] as string;
    const [eventID, year] = eventYearKey.split(";");

    try {
      const response = await fetchBackend({
        endpoint: "/team/leave",
        method: "POST",
        authenticatedCall: true,
        data: {
          eventID: "kickstart",
          year: 2025,
          memberID: reg.id,
        },
      });

      if (response.message === "success") {
        alert("Successfully left the team");
        // Refresh registration data
        await fetchRegistration();
      }
    } catch (err) {
      console.error("Error leaving team:", err);
      alert("Failed to leave team. Please try again.");
    }
  };

  console.log("reg", reg);
  return (
    <NavBarContainer
      isPartner={reg?.isPartner}
      userName={reg ? `${reg?.fname} ${reg?.lname}` : "Loading..."}
    >
      <div className="w-full h-full flex flex-col items-center justify-center font-bricolage space-y-4 bg-[#111111] mt-24">
        <Logo width={150} height={150} />
        <header className="text-[32px]">
          Welcome to Kickstart, <span className="font-bold">{reg?.fname}</span>
        </header>
        <GlowButton href="/companion/team/create" height="h-10" width="w-56">
          Create a team
        </GlowButton>
        <span>
          {"or "}
          <Link
            className="text-[#DE7D02] underline"
            href="/companion/team/join"
          >
            join an existing team
          </Link>
          {" instead"}
        </span>

        {reg?.teamID && (
          <button
            onClick={handleLeaveTeam}
            className="mt-8 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Leave Team
          </button>
        )}
      </div>
    </NavBarContainer>
  );
};

export default TeamIndex;
