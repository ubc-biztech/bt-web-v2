import ConfigureAmplifyClientSide from "@/components/ConfigureAmplify";
import Navbar from "@/components/NavBar/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { Urbanist } from "next/font/google";
import { useRouter } from "next/router";
import MembershipPrompt from "@/components/MembershipPrompt";
import OnboardingChecker from "@/components/OnboardingChecker";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
});

const membershipPromptRoutes = new Set([
  "/",
  "/events",
  "/profile",
  "/connections",
]);

export default function Layout({ children }: any) {
  const router = useRouter();
  const showMembershipPrompt = membershipPromptRoutes.has(router.pathname);

  return (
    <div lang="en" className={`${urbanist.className}`}>
      <div className={`md:pl-[250px]`}>
        <ConfigureAmplifyClientSide />
        <OnboardingChecker />
        <div className="md:pt-8 pt-24 lg:p-16 md:p-12 p-8 w-full min-h-screen place-content-center">
          {showMembershipPrompt && <MembershipPrompt />}
          {children}
        </div>
      </div>

      <Navbar />
      <Toaster />
    </div>
  );
}
