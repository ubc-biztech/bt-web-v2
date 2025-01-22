import { FC } from 'react';
import { AnimatedBorder } from '../../ui/animated-border';
import ChainLinkIcon from "../../../../public/assets/icons/chain_link.svg";
import Image from 'next/image'

interface UserProfile {
    additionalLink?: string;
}

interface AdditionalLinksProps {
    userData: UserProfile;
}

const AdditionalLinks: FC<AdditionalLinksProps> = ({ userData }) => {
    return (
        <AnimatedBorder className="w-full mb-3 sm:mb-4">
            <div className="rounded-lg p-3 sm:p-4">
                <span className="text-xs sm:text-sm text-light-grey font-redhat mb-1 sm:mb-2">ADDITIONAL LINK</span>
                <div className="flex justify-between items-center">
                    <a
                        href={userData.additionalLink}
                        className="text-xs sm:text-sm font-satoshi underline break-all hover:text-purple-400 transition-colors max-w-none sm:max-w-none truncate flex"
                    >
                        <Image src={ChainLinkIcon}
                            alt="Linkedin Icon"
                            width={16}
                            height={16}
                            className='mr-2'
                        />
                        {userData.additionalLink}
                    </a>
                </div>
            </div>
        </ AnimatedBorder>
    );
};

export default AdditionalLinks;