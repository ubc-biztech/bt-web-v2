import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import { useEffect, useState } from "react";
import Filter from "@/components/companion/Filter";
import { BadgeRow } from "@/components/companion/badges/badge-row";
import SnackSeekerIcon from "@/assets/2025/blueprint/badgeIcons/snack_seeker.png";
import FirstImpressionistIcon from "@/assets/2025/blueprint/badgeIcons/first_impressionist.png";
import StartupExplorerIcon from "@/assets/2025/blueprint/badgeIcons/startup_explorer.png";
import { StaticImageData } from "next/image";
import { fetchBackend } from "@/lib/db";

export interface Badge {
  questID: string;
  "eventID;year": string;
  threshold: Number;
  progress: Number;
  badgeName: string;
  description: string;
  userID: string;
  isComplete: Boolean;
}

const badgeIcons: { [key: string]: StaticImageData } = {
  QUEST_CONNECT_ONE: SnackSeekerIcon,
  QUEST_CONNECT_FOUR: FirstImpressionistIcon,
  QUEST_SNACK: StartupExplorerIcon,
};

const hiddenBadges = ["QUEST_BT_BOOTH_H"];

const Badges = () => {
  const [filter, setFilter] = useState(0);
  const filterOptions = ["All", "Collected", "Incomplete", "Hidden"];
  const [badges, setBadges] = useState([]);
  const [completedBadges, setCompletedBadges] = useState(0);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const data = await fetchBackend({
          // TO DO: currently hardcoded. Need GET call to Profile table to get obsfucatedID
          endpoint: `/interactions/quests/TestDudeOne`,
          method: "GET",
          authenticatedCall: true,
        });
        const dataWithCompleteStatus = data.data.map(
            (badge: Omit<Badge, "isComplete">) => ({
              ...badge,
              isComplete: badge.progress >= badge.threshold,
            })
          );
        setBadges(dataWithCompleteStatus);
        const completedCount = dataWithCompleteStatus.filter(
            (badge: Badge) => badge.isComplete
          ).length;
          setCompletedBadges(completedCount)
      } catch (error) {
        console.error("Error fetching badges:", error);
      }
    };

    fetchBadges();
  }, []);

  return (
    <NavBarContainer>
      <div>
        <div className="flex flex-row items-center justify-between">
          <p className="text-[22px] font-satoshi text-white">
            Badge Collection
          </p>
          <p className="text-[12px] text-[rgba(255,255,255,0.8)] font-redhat translate-y-[3px]">
            {completedBadges}/{badges.length} COLLECTED
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
        {badges &&
          badges
            .filter((badge: Badge) => {
              const isHidden = hiddenBadges.includes(badge.questID);
              if (filterOptions[filter] === "Hidden") {
                return isHidden && badge.isComplete;
              } else if (filterOptions[filter] === "Collected") {
                return badge.isComplete;
              } else if (filterOptions[filter] === "Incomplete") {
                return !badge.isComplete && !isHidden;
              } else {
                return (!isHidden && !badge.isComplete) || badge.isComplete;
              }
            })
            .map((badge: Badge, index: number) => (
              <BadgeRow
                key={index}
                badge={badge}
                isHidden={hiddenBadges.includes(badge.questID)}
                badgeIcon={badgeIcons[badge.questID]}
              />
            ))}
      </div>
    </NavBarContainer>
  );
};

export default Badges;
