import { FC } from "react";
import { AnimatedBorder } from "../../ui/animated-border";
import ChainLinkIcon from "../../../../public/assets/icons/chain_link.svg";
import Image from "next/image";

interface UserProfile {
  additionalLink?: string | string[];
}

interface AdditionalLinksProps {
  userData: UserProfile;
}

const AdditionalLinks: FC<AdditionalLinksProps> = ({ userData }) => {
  const links = userData.additionalLink
    ? Array.isArray(userData.additionalLink)
      ? userData.additionalLink
      : [userData.additionalLink]
    : [];

  return (
    <AnimatedBorder className="w-full mb-3 sm:mb-4">
      <div className="rounded-lg p-3 sm:p-4">
        <span className="text-xs sm:text-sm text-neutral-200 font-redhat mb-1 sm:mb-2">
          ADDITIONAL LINKS
        </span>
        <div className="flex justify-between items-center">
          {links.length > 0 ? (
            <ul className="list-none p-0 m-0">
              {links.map((link) => (
                <li key={link} className="mb-2">
                  <a
                    href={link.startsWith("http") ? link : `https://${link}`}
                    className="text-xs sm:text-sm font-satoshi underline break-words break-all hover:text-purple-400 transition-colors max-w-none sm:max-w-none flex"
                  >
                    <Image
                      src={ChainLinkIcon}
                      alt="Linkedin Icon"
                      width={16}
                      height={16}
                      className="mr-2"
                    />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </AnimatedBorder>
  );
};

export default AdditionalLinks;
