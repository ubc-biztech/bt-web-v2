import ConfigureAmplifyClientSide from "@/components/ConfigureAmplify";
import Navbar from "@/components/NavBar/Navbar";
import { Toaster } from "@/components/ui/toaster";
import {
  Urbanist,
  Bricolage_Grotesque,
  Instrument_Serif,
} from "next/font/google";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: "400",
});

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
});

export default function Layout({ children }: any) {
  return (
    <div
      lang="en"
      className={`${bricolage.className} ${instrument.className} ${urbanist.className}`}
    >
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
