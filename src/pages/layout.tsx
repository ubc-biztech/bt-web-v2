import ConfigureAmplifyClientSide from "@/components/ConfigureAmplify";
import Navbar from "@/components/NavBar/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { Urbanist } from "next/font/google";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
});

export default function Layout({ children }: any) {
  return (
    <div className={urbanist.className}>
      <div className={`md:pl-[250px]`}>
        <ConfigureAmplifyClientSide />
        <div className="md:pt-8 pt-24 lg:p-16 md:p-12 p-8 w-full min-h-screen place-content-center">
          {children}
        </div>
      </div>

      <Navbar />
      <Toaster />
    </div>
  );
}
