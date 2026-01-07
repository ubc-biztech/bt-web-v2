import React, { useEffect, useState } from "react";
import { GlowButton } from "@/components/companion/kickstart/ui/GlowButton";
import Logo from "@/assets/2025/kickstart/biztech_logo.svg";
import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import Link from "next/link";
import { fetchAuthSession } from "@aws-amplify/auth";
import { fetchBackend } from "@/lib/db";
import { useRouter } from "next/router";
import { Registration } from "@/pages/companion/index";
import { isCheckedIn } from "@/lib/registrationStatus";

// @Ali

const Index = () => {
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
      router.push("/companion");
    }
  };

  useEffect(() => {
    fetchRegistration();
  }, []);

  return (
    <NavBarContainer
      isPartner={reg?.isPartner}
      userName={`${reg?.fname} ${reg?.lname || ""}`}
    >
      <div className="w-full h-full flex flex-col items-center justify-center font-bricolage space-y-4 bg-[#111111] mt-24 relative">
        {reg && !isCheckedIn(reg.registrationStatus) ? (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <h1 className="text-2xl font-bold text-center">
              You Have Not Checked In!
            </h1>
            <h2 className="text-[20px] opacity-50 text-center font-light">
              Please check in with a BizTech exec to continue.
            </h2>
          </div>
        ) : (
          <>
            <Logo width={150} height={150} />
            <header className="text-[32px] text-center">
              Welcome to Kickstart,{" "}
              <span className="font-bold">{reg?.fname}</span>
            </header>
            <GlowButton
              href="/companion/team/create"
              height="h-10"
              width="w-56"
            >
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
          </>
        )}
      </div>
    </NavBarContainer>
  );
};

export default Index;
