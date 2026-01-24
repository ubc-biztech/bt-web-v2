import { CompanionButton } from "../../ui/companion-button";
import { AnimatedBorder } from "../../ui/animated-border";
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

import { FC, useEffect } from "react";
import { UserProfile } from "@/types";

const CompanyInfo: FC<{ userData: UserProfile }> = ({ userData }) => {
  const visitPageLink = `/companion/profile/company/${userData.profilePictureURL}`;
  return (
    <AnimatedBorder className="w-full mb-3 ">
      <div className="rounded-lg p-3 bg-[#030B13] sm:p-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Company Card */}
          {userData?.company && (
            <div>
              <p className="text-xs sm:text-sm text-neutral-200 font-redhat mb-1 sm:mb-2">
                COMPANY
              </p>
              <p className="text-xs sm:text-sm font-satoshi">
                {userData.company}
              </p>
            </div>
          )}

          {/* Role Card */}
          {userData?.role && (
            <div>
              <p className="text-xs sm:text-sm text-neutral-200 font-redhat mb-1 sm:mb-2">
                ROLE
              </p>
              <p className="text-xs sm:text-sm font-satoshi">{userData.role}</p>
            </div>
          )}

          {/* PRONOUNS Card */}
          {userData?.pronouns && (
            <div className="col-span-2">
              <p className="text-xs sm:text-sm text-neutral-200 font-redhat mb-1 sm:mb-2">
                PRONOUNS
              </p>
              <p className="text-xs sm:text-sm font-satoshi">
                {userData.pronouns}
              </p>
            </div>
          )}
        </div>
      </div>
    </AnimatedBorder>
  );
};

export default CompanyInfo;
