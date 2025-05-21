import { CompanionItemRow } from "@/components/ui/companion-item-row";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/pages/companion/badges";
import React from "react";
import Image, { StaticImageData } from "next/image";
import BadgeCompletedIcon from "@/assets/2025/blueprint/badgeCompleted.png";

interface BadgeRowProps {
  badge: Badge;
  isHidden: Boolean;
  badgeIcon: StaticImageData;
}

export const BadgeRow: React.FC<BadgeRowProps> = ({
  badge,
  isHidden,
  badgeIcon,
}) => {
  return (
    <CompanionItemRow>
      <div className="flex items-center space-x-3">
        <Avatar
          className={`flex w-8 h-8 items-center justify-center border-2 border-white`}
        >
          <Image src={badgeIcon} alt="" className="rounded-full" />
        </Avatar>
        <div>
          <p className="text-[22px] font-medium text-white">
            {badge.badgeName}
          </p>
          <p className="text-[#808080] text-[12px] font-redhat">
            {badge.description}
          </p>
        </div>
      </div>
      {badge.isComplete ? (
        <Avatar className={`flex w-6 h-6 items-center justify-center`}>
          <Image src={BadgeCompletedIcon} alt="" className="rounded-full" />
        </Avatar>
      ) : (
        <span className="text-base text-white/70">{`${badge.progress}/${badge.threshold}`}</span>
      )}
    </CompanionItemRow>
  );
};
