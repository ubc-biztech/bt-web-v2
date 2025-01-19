import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import { useEffect, useState } from "react";
import Filter from "@/components/companion/Filter";
import { BadgeRow } from "@/components/companion/badges/badge-row";
import SnackSeekerIcon from "@/assets/2025/blueprint/badgeIcons/snack_seeker.png";
import FirstImpressionistIcon from "@/assets/2025/blueprint/badgeIcons/first_impressionist.png";
import StartupExplorerIcon from "@/assets/2025/blueprint/badgeIcons/startup_explorer.png";
import { StaticImageData } from "next/image";
import { fetchBackend } from "@/lib/db";
import { CompanionItemRow } from "@/components/ui/companion-item-row";
import { COMPANION_PROFILE_ID_KEY } from "@/constants/companion";
import { FilterDropdown } from "@/components/companion/CompaniesList";
import { SortOption } from "@/components/companion/CompaniesList";
import Loading from "@/components/Loading";

export interface Badge {
  questID: string;
  "eventID;year": string;
  threshold: number;
  progress: number;
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

const hiddenBadges = ["QUEST_BT_BOOTH_H", "QUEST_CONNECT_TEN_H", "QUEST_CONNECT_EXEC_H"];

const Badges = () => {
  const [filter, setFilter] = useState(0);
  const filterOptions = ["All", "Collected", "Incomplete", "Hidden"];
  const [badges, setBadges] = useState([]);
  const [completedBadges, setCompletedBadges] = useState(0);
  const [completedHiddenBadges, setCompletedHiddenBadges] = useState(0);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("Name");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setIsLoading(true);
        const profileId = localStorage.getItem(COMPANION_PROFILE_ID_KEY);
        if (!profileId) {
          setError("Please log in to view your connections");
          setIsLoading(false);
          return;
        }

        const data = await fetchBackend({
          endpoint: `/interactions/quests/${profileId}`,
          method: "GET",
          authenticatedCall: false,
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
        const completedHiddenCount = dataWithCompleteStatus.filter(
          (badge: Badge) =>
            badge.isComplete && hiddenBadges.includes(badge.questID)
        ).length;
        setCompletedBadges(completedCount);
        setCompletedHiddenBadges(completedHiddenCount);
      } catch (error) {
        console.error("Error fetching badges:", error);
        setError("Error fetching your badges");
      } finally  {
        setIsLoading(false);
      }
    };

    fetchBadges();
  }, []);

  const sortedBadges = badges
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
    .sort((a: Badge, b: Badge) => {
      if (sortBy === "Progress") {
        return a.progress - b.progress;
      } else if (sortBy === "Name") {
        return a.badgeName.localeCompare(b.badgeName);
      }
      return 0;
    });

  return (
    <NavBarContainer>
      {isLoading ? <div className="mt-[-90px]"><Loading /></div>: (
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
          <FilterDropdown
            options={["Name", "Progress"]}
            setSortBy={setSortBy}
            sortBy={sortBy}
          />
          <Filter
            filterOptions={filterOptions}
            setSelectedFilterOption={setFilter}
            selectedFilterOption={filter}
          />
        </div>
        {error ? (
          <div className="text-red-500 text-center mt-4">{error}</div>
        ) : (
          <>
            {sortedBadges &&
              sortedBadges.map((badge: Badge, index: number) => (
                <BadgeRow
                  key={index}
                  badge={badge}
                  isHidden={hiddenBadges.includes(badge.questID)}
                  badgeIcon={badgeIcons[badge.questID]}
                />
              ))}
            {(filterOptions[filter] === "All" || filterOptions[filter] === "Incomplete") && (
              <CompanionItemRow className="!before:bg-none border-dashed border-[rgba(206,234,255,0.4)]">
                <div className="flex justify-center flex-col text-center">
                  <p className="font-medium text-white">
                    {`+${hiddenBadges.length - completedHiddenBadges} more hidden ${hiddenBadges.length - completedHiddenBadges === 1 ? "badge" : "badges"} to collect`}
                  </p>
                  <p className="text-[#808080] text-[12px] font-redhat">
                    Details will be revealed at the end of the event
                  </p>
                </div>
              </CompanionItemRow>
            )}
          </>
        )}
      </div>
      )}
    </NavBarContainer>
  );
};

export default Badges;
