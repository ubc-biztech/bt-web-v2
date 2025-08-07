import ConfigureAmplifyClientSide from "@/components/ConfigureAmplify";
import Navbar from "@/components/NavBar/Navbar";
import { isMobile } from "@/util/isMobile";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Urbanist } from "next/font/google";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
});

export default function Layout({ children }: any) {
  return (
    <div className={urbanist.className}>
      <main className={`md:pl-[250px] pt-16 md:pt-0`}>
        <ConfigureAmplifyClientSide />
        {children}
      </main>

      <Navbar />
      <Toaster />
    </div>
  );
}
