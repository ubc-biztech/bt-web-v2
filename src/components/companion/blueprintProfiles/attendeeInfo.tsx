import { FC } from "react";
import { AnimatedBorder } from "../../ui/animated-border";
import { UserProfile } from "@/types";

const AttendeeInfo: FC<{ userData: UserProfile }> = ({ userData }) => {
  return (
    <AnimatedBorder className="w-full mb-3 ">
      <div className="rounded-lg p-3 bg-[#030B13] sm:p-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Major Card */}
          {userData?.major && (
            <div>
              <p className="text-xs sm:text-sm text-neutral-200 font-redhat mb-1 sm:mb-2">
                MAJOR
              </p>
              <p className="text-xs sm:text-sm font-satoshi">
                {userData.major}
              </p>
            </div>
          )}

          {/* Year Card */}
          {userData?.year && (
            <div>
              <p className="text-xs sm:text-sm text-neutral-200 font-redhat mb-1 sm:mb-2">
                YEAR
              </p>
              <p className="text-xs sm:text-sm font-satoshi">{userData.year}</p>
            </div>
          )}

          {/* Hobby Card */}
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

export default AttendeeInfo;
