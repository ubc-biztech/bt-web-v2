import { ComponentType } from "react";
import Blueprint2025 from "@/components/companion/events/Blueprint2025";
import BlueprintLogo from "@/assets/2025/blueprint/logo.png";
import ProductX2025 from "@/components/companion/events/ProductX2025";
import ProductXLogo from "@/assets/2025/productx/logo.png";
import Kickstart2025 from "@/components/companion/events/Kickstart2025";
import KickstartLogo from "@/assets/2025/kickstart/logo.png";
import BluePrint2026 from "@/components/companion/events/BluePrint2026";
import BluePrintProfile2026 from "@/components/companion/blueprint2026/pages/BluePrintProfile2026";
import BluePrintPartnerDatabase2026 from "@/components/companion/blueprint2026/pages/BluePrintPartnerDatabase2026";
import BluePrintQuests2026 from "@/components/companion/blueprint2026/pages/BluePrintQuests2026";
import BluePrintCompanies2026 from "@/components/companion/blueprint2026/pages/BluePrintCompanies2026";
import BluePrintMBTI2026 from "@/components/companion/blueprint2026/pages/BluePrintMBTI2026";
import BluePrintDiscover2026 from "@/components/companion/blueprint2026/pages/BluePrintDiscover2026";

export type DynamicPageProps = {
  event: Event;
  params: Record<string, string>;
  eventId: string;
  year: string;
};

type EventPages = Record<string, React.ComponentType<DynamicPageProps & any>>;

export interface Event {
  activeUntil: Date;
  eventID: string;
  year: number;
  ChildComponent: ComponentType<any>;
  pages?: EventPages;
  options: {
    disableWelcomeHeader?: boolean;
    BiztechLogo: string;
    Logo: string;
    BackgroundImage?: string;
    title: string;
    date: string;
    location: string;
    colors: {
      primary: string;
      background: string;
    };
    landing?: string;
    getScheduleData: (regData: any) => Array<{ date: string; title: string }>;
    welcomeData: string[];
    headers: Array<{ text: string; id?: string; route?: string }>;
  };
}

const Events: Event[] = [
  {
    activeUntil: new Date("2025-01-31"),
    eventID: "blueprint",
    year: 2025,
    ChildComponent: Blueprint2025,
    options: {
      disableWelcomeHeader: true,
      BiztechLogo: BlueprintLogo.src,
      Logo: BlueprintLogo.src,
      title: "BluePrint 2025",
      date: "January 25, 2025",
      location: "Robson Square, Vancouver",
      colors: {
        primary: "linear-gradient(180deg, white, white)",
        background: "linear-gradient(180deg, #040C12, #030608)",
      },
      getScheduleData: (regData) => [],
      welcomeData: [],
      headers: [
        { text: "Schedule", id: "schedule" },
        { text: "Points", id: "points" },
        { text: "Showcase", id: "showcase" },
      ],
    },
  },
  {
    activeUntil: new Date("2025-03-22"),
    eventID: "productx",
    year: 2025,
    ChildComponent: ProductX2025,
    options: {
      disableWelcomeHeader: true,
      BiztechLogo: ProductXLogo.src,
      Logo: ProductXLogo.src,
      title: "ProductX 2025",
      date: "March 22, 2025",
      location: "Henry Angus, UBC",
      colors: {
        primary: "linear-gradient(180deg, white, white)",
        background: "linear-gradient(180deg, #040C12, #030608)",
      },
      getScheduleData: (regData) => [],
      welcomeData: [],
      headers: [
        { text: "Schedule", id: "schedule" },
        { text: "Points", id: "points" },
        { text: "Showcase", id: "showcase" },
      ],
    },
  },
  {
    activeUntil: new Date("2025-11-27"),
    eventID: "kickstart",
    year: 2025,
    ChildComponent: Kickstart2025,
    options: {
      disableWelcomeHeader: true,
      BiztechLogo: KickstartLogo.src,
      Logo: KickstartLogo.src,
      title: "Kickstart 2025",
      date: "November 19, 2025",
      location: "idk, UBC",
      colors: {
        primary: "#111111",
        background: "#111111",
      },
      getScheduleData: (regData) => [],
      welcomeData: [],
      headers: [],
    },
  },
  {
    activeUntil: new Date("2026-01-25"),
    eventID: "blueprint",
    year: 2026,
    ChildComponent: BluePrint2026,
    pages: {
      "profile/[profileId]": BluePrintProfile2026,
      "partner-database": BluePrintPartnerDatabase2026,
      quests: BluePrintQuests2026,
      companies: BluePrintCompanies2026,
      MBTI: BluePrintMBTI2026,
      discover: BluePrintDiscover2026,
    },
    options: {
      disableWelcomeHeader: true,
      BiztechLogo: BlueprintLogo.src,
      Logo: BlueprintLogo.src,
      title: "BluePrint 2026",
      date: "January 24, 2026",
      location: "UBC Robson Square",
      colors: {
        primary: "#EBEBEB",
        background: "#070707",
      },
      getScheduleData: (regData) => [],
      welcomeData: [],
      headers: [],
    },
  },
];

export default Events;
