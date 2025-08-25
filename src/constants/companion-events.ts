import { ComponentType } from "react";
import Blueprint2025 from "@/components/companion/events/Blueprint2025";
import BlueprintLogo from "@/assets/2025/blueprint/logo.png";
import ProductX2025 from "@/components/companion/events/ProductX2025";
import ProductXLogo from "@/assets/2025/productx/logo.png";

export interface Event {
  activeUntil: Date;
  eventID: string;
  year: number;
  ChildComponent: ComponentType<any>;
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
];

export default Events;
