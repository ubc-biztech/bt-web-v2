import { CompanionItemRow } from "@/components/ui/companion-item-row";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/pages/companion/badges";
import React from "react";
import Image, { StaticImageData } from "next/image";

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
    </CompanionItemRow>
  );
};
