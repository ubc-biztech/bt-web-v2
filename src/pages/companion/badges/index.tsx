import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import { useState } from "react";
import Filter from "@/components/companion/Filter";
import { BadgeRow } from "@/components/companion/badges/badge-row";
import SnackSeekerIcon from "@/assets/2025/blueprint/badgeIcons/snack_seeker.png";
import FirstImpressionistIcon from "@/assets/2025/blueprint/badgeIcons/first_impressionist.png";
import StartupExplorerIcon from "@/assets/2025/blueprint/badgeIcons/startup_explorer.png";
import { StaticImageData } from "next/image";

export interface Badge {
  questID: string;
  "eventID;year": string;
  threshold: Number;
  progress: Number;
  badgeName: string;
  description: string;
}

const mockBadges = [
  {
    questID: "QUEST_CONNECT_ONE",
    "eventID;year": "blueprint;2025",
    threshold: 1,
    progress: 0,
    badgeName: "First Impressionist",
    description: "Make your first impression",
  },
  {
    questID: "QUEST_CONNECT_FOUR",
    "eventID;year": "blueprint;2025",
    threshold: 4,
    progress: 2,
    badgeName: "Networking Pro",
    description: "Make 4 Connections",
  },
  {
    questID: "QUEST_SNACK",
    "eventID;year": "blueprint;2025",
    threshold: 1,
    progress: 1,
    badgeName: "Snack Seeker",
    description: "Grab a bite to eat at the buffet line.",
  },
  {
    questID: "QUEST_BT_BOOTH_H",
    "eventID;year": "blueprint;2025",
    threshold: 1,
    progress: 1,
    badgeName: "Director's Circle",
    description: "Connect with a Biztech Exec.",
  },
];

const badgeIcons: { [key: string]: StaticImageData } = {
  QUEST_CONNECT_ONE: SnackSeekerIcon,
  QUEST_CONNECT_FOUR: FirstImpressionistIcon,
  QUEST_SNACK: StartupExplorerIcon,
};

const hiddenBadges = ["QUEST_BT_BOOTH_H"];

const Badges = () => {
  const [filter, setFilter] = useState(0);
  const filterOptions = ["All", "Collected", "Incomplete", "Hidden"];

  return (
    <NavBarContainer>
      <div>
        <div className="flex flex-row items-center justify-between">
          <p className="text-[22px] font-satoshi text-white">
            Badge Collection
          </p>
          <p className="text-[12px] text-[rgba(255,255,255,0.8)] font-redhat translate-y-[3px]">
            3/10 COLLECTED
          </p>
        </div>
        <div className="h-[1px] my-3 bg-[#1D262F]"></div>
        <div className="flex flex-row items-center justify-between">
          <p className="text-[12px] text-[rgba(255,255,255,0.8)] font-redhat translate-y-[3px]">
            SORT
          </p>
          <Filter
            filterOptions={filterOptions}
            setSelectedFilterOption={setFilter}
            selectedFilterOption={filter}
          />
        </div>
        {mockBadges &&
          mockBadges
            .filter((badge: Badge) => {
              const isHidden = hiddenBadges.includes(badge.questID);
              const isComplete = badge.progress >= badge.threshold;
              if (filterOptions[filter] === "Hidden") {
                return isHidden && isComplete;
              } else if (filterOptions[filter] === "Collected") {
                return isComplete;
              } else if (filterOptions[filter] === "Incomplete") {
                return !isComplete && !isHidden;
              } else {
                return (!isHidden && !isComplete) || isComplete;
              }
            })
            .map((badge: Badge, index: number) => (
              <BadgeRow
                key={index}
                badge={badge}
                isHidden={hiddenBadges.includes(badge.questID)}
                isComplete={badge.progress >= badge.threshold}
                badgeIcon={badgeIcons[badge.questID]}
              />
            ))}
      </div>
    </NavBarContainer>
  );
};

export default Badges;
