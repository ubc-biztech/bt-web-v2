import ConfigureAmplifyClientSide from "@/components/ConfigureAmplify";
import Navbar from "@/components/NavBar/Navbar";
import { isMobile } from "@/util/isMobile";
import { useEffect, useState } from "react";

export default function Layout({ children }: any) {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  useEffect(() => {
    const userAgent = navigator.userAgent;
    setIsMobileDevice(isMobile(userAgent));
  }, []);
  return (
    <>
      <main className={`${!isMobileDevice ? "ml-[250px]" : "mt-[52px]"}`}>
        <ConfigureAmplifyClientSide />
        {children}
      </main>
      <Navbar />
    </>
  );
}
