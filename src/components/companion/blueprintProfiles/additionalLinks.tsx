import { FC } from 'react';
import { AnimatedBorder } from '../../ui/animated-border';

interface UserProfile {
    additionalLink: string;
}

interface AdditionalLinksProps {
    userData: UserProfile;
}

const AdditionalLinks: FC<AdditionalLinksProps> = ({ userData }) => {
    return (
        <AnimatedBorder className="w-full mb-3 sm:mb-4">
            <div className="rounded-lg p-3 sm:p-4">
                <span className="text-xs sm:text-sm text-light-grey font-mono mb-1 sm:mb-2">ADDITIONAL LINK</span>
                <div className="flex justify-between items-center">
                    <a
                        href={userData.additionalLink}
                        className="text-xs sm:text-sm font-satoshi underline break-all hover:text-purple-400 transition-colors max-w-none sm:max-w-none truncate flex"
                    >
                        <img src="/assets/icons/chain_link.svg" alt="chain-link" className="mx-1 w-4 h-6 sm:w-4 sm:h-6" />
                        {userData.additionalLink}
                    </a>
                </div>
            </div>
        </ AnimatedBorder>
    );
};

export default AdditionalLinks;