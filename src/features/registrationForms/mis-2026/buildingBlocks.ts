import ArchitectMascot from "@/assets/2026/mis-night/architect_mascot.svg";
import DesignerMascot from "@/assets/2026/mis-night/designer_mascot.svg";
import LogicianMascot from "@/assets/2026/mis-night/logicion_mascot.svg";
import StrategistMascot from "@/assets/2026/mis-night/strategist_mascot.svg";
import VisionaryMascot from "@/assets/2026/mis-night/visionary_mascot.svg";
import { MIS_CAREER_INTERESTS, type MISCareerInterest } from "./Definition";

export type BuildingBlock = {
  image: typeof VisionaryMascot;
  header: MISCareerInterest;
  description: string;
  potentialRoles: readonly string[];
  traits: readonly [string, string, string];
};

export const BUILDING_BLOCKS: Record<MISCareerInterest, BuildingBlock> = {
  "The Visionary": {
    image: VisionaryMascot,
    header: "The Visionary",
    description:
      "You are the big-picture dreamer who spots opportunities before anyone else does. In tech, you lead product discovery and turn abstract concepts into products and businesses people actually want.",
    potentialRoles: [
      "Product management",
      "Product operations",
      "Venture capital",
      "Tech entrepreneurship",
    ],
    traits: ["Innovative", "Curious", "Fearless"],
  },
  "The Designer": {
    image: DesignerMascot,
    header: "The Designer",
    description:
      "You are the empathetic creative who cares deeply about how people feel. In your work, you craft intuitive, human-centered experiences and visual journeys so digital products are effortless to use.",
    potentialRoles: [
      "UX/UI & Product design",
      "Motion design",
      "User experience research",
      "Brand strategy",
    ],
    traits: ["Empathetic", "Creative", "Intuitive"],
  },
  "The Architect": {
    image: ArchitectMascot,
    header: "The Architect",
    description:
      "You are the practical builder who loves figuring out how things work. This can look like engineering, securing, and scaling the structural software and systems that keep platforms running reliably.",
    potentialRoles: [
      "Software engineering",
      "Cloud infrastructure",
      "Cybersecurity",
      "DevOps",
    ],
    traits: ["Detail-Oriented", "Practical", "Systematic"],
  },
  "The Logician": {
    image: LogicianMascot,
    header: "The Logician",
    description:
      "You are the curious puzzle-solver who looks for patterns in everything. In tech, you translate complex data and machine learning models into smart, predictive insights that drive intelligent decisions.",
    potentialRoles: [
      "AI/ML engineering",
      "MIS faculty & academic researchers",
      "Tech sales & account management",
      "Data analytics",
    ],
    traits: ["Analytical", "Precise", "Inquisitive"],
  },
  "The Strategist": {
    image: StrategistMascot,
    header: "The Strategist",
    description:
      "You are the charismatic connector who knows how to make things happen in the real world. You drive go-to-market strategies, consulting solutions, and business growth to turn great technology into widespread adoption.",
    potentialRoles: [
      "Tech consulting",
      "Growth & product marketing",
      "Tech sales & account management",
      "Solutions engineering",
    ],
    traits: ["Dynamic", "Driven", "Adaptive"],
  },
};

export const BUILDING_BLOCK_LIST = MIS_CAREER_INTERESTS.map(
  (interest) => BUILDING_BLOCKS[interest],
);
