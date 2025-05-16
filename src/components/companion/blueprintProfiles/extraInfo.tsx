import { FC } from "react";
import AdditionalLinks from "./additionalLinks";
import { CompanionButton } from "../../ui/companion-button";
import { AnimatedBorder } from "../../ui/animated-border";
import { UserProfile } from "@/types";
import ResponseSection from "./responseSection";
import LinkedinIcon from "../../../../public/assets/icons/linkedIn_bp_user.svg";
import Image from "next/image";

const ExtraInfo: FC<{ userData: UserProfile }> = ({ userData }) => {
  const handleVisitPage = () => {
    if (typeof window !== "undefined") {
      // Normalize the LinkedIn URL
      let linkedInUrl = userData.linkedIn?.trim() || "";

      // Ensure the URL starts with "https://"
      if (!/^https?:\/\//i.test(linkedInUrl)) {
        linkedInUrl = "https://" + linkedInUrl;
      }

      // Redirect to the normalized URL
      window.location.href = linkedInUrl;
    }
  };

  return (
    <>
      {/* LinkedIn Section */}
      {userData.linkedIn && (
        <AnimatedBorder className="w-ful mb-3 sm:mb-4">
          <div className="bg-[#030B13] rounded-lg p-1 sm:p-4 flex justify-between items-center">
            <div className="w-full flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
              <Image
                src={LinkedinIcon}
                alt="Linkedin Icon"
                width={40}
                height={40}
              />
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm text-light-grey font-redhat">
                  LINKEDIN
                </span>
                <span className="text-xs sm:text-sm font-satoshi truncate max-w-[135px] xs:max-w-[180px] sm:max-w-none">
                  {userData.linkedIn}
                </span>
              </div>
            </div>
            <div className="px-4 py-2">
              <CompanionButton onClick={handleVisitPage}>
                <span className="text-[12px] translate-y-[1px] hidden mxs:inline">
                  VISIT PAGE
                </span>
                <span className="text-lg translate-y-[-3px]">↗</span>
              </CompanionButton>
            </div>
          </div>
        </AnimatedBorder>
      )}

      {/* Interests */}
      {userData.hobby1 && (
        <ResponseSection
          title="HOBBIES & INTERESTS"
          list={[
            userData.hobby1,
            ...(userData.hobby2 ? [userData.hobby2] : []),
          ]}
        />
      )}

      {/* {userData.funQuestion1 && (
                <ResponseSection title="IF I WAS STRANDED ON AN ISLAND, THE TECH FIGURE I WOULD WANT TO BE STRANDED WITH WOULD BE..." text={userData.funQuestion1} />
            )} */}

      {userData.funQuestion2 && (
        <ResponseSection
          title="IF I COULD PRESENT ONE EARTHLY INVENTION TO AN ALIEN, I WOULD PRESENT..."
          text={userData.funQuestion2}
        />
      )}

      {/* Only render additional links if they're given */}
      {userData.additionalLink && <AdditionalLinks userData={userData} />}
    </>
  );
};

export default ExtraInfo;
