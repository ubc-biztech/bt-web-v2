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
      <main className={`md:pl-[250px]`}>
        <ConfigureAmplifyClientSide />
        <div className="lg:p-16 md:p-8 p-4 min-h-screen">
        {children}
        </div>
      </main>

      <Navbar />
      <Toaster />
    </div>
  );
}
