import ConfigureAmplifyClientSide from "@/components/ConfigureAmplify";
import Navbar from "@/components/NavBar/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { Urbanist } from "next/font/google";
import { useRouter } from "next/router";
import MembershipPrompt from "@/components/MembershipPrompt";
import OnboardingChecker from "@/components/OnboardingChecker";
import { isHelloHacksEventId } from "@/features/registrationForms/hello-hacks-2026/constants";

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
  const isFeedbackRoute = router.pathname.includes("/feedback");
  const isHelloHacksSuccessRoute =
    router.pathname === "/event/[eventId]/[year]/register/success" &&
    isHelloHacksEventId(
      Array.isArray(router.query.eventId)
        ? router.query.eventId[0]
        : router.query.eventId,
    );

  return (
    <div lang="en" className={`${urbanist.className}`}>
      <div className={`md:pl-[250px]`}>
        <ConfigureAmplifyClientSide />
        <OnboardingChecker />
        <div
          className={`${
            isHelloHacksSuccessRoute
              ? "pt-16 md:pt-0"
              : isFeedbackRoute
              ? "pt-16 px-0 pb-8 md:pt-8 md:px-12 md:pb-12 lg:p-16"
              : "md:pt-8 pt-24 lg:p-16 md:p-12 p-8"
          } w-full min-h-screen place-content-center`}
        >
          {showMembershipPrompt && <MembershipPrompt />}
          {children}
        </div>
      </div>

      <Navbar />
      <Toaster />
    </div>
  );
}
