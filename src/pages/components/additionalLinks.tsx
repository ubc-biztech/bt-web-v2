import { FC } from 'react';
import { AnimatedBorder } from '../../components/ui/animated-border';

interface UserProfile {
    additionalLinks: string[];
}

interface AdditionalLinksProps {
    userData: UserProfile;
}

const AdditionalLinks: FC<AdditionalLinksProps> = ({ userData }) => {
    return (
        <AnimatedBorder className="w-full mb-3 sm:mb-4">
        <div className="rounded-lg p-3 sm:p-4">
            <span className="text-xs sm:text-sm text-light-grey font-mono mb-1 sm:mb-2">ADDITIONAL LINKS</span>
            {userData.additionalLinks.map((link: string, index: number) => (
                <div key={index} className="flex justify-between items-center">
                    <a
                        href={link}
                        className="text-xs sm:text-sm font-sans underline break-all hover:text-purple-400 transition-colors max-w-[200px] sm:max-w-none truncate flex"
                    >
                        <img src="/assets/icons/chain_link.svg" alt="chain-link" className="mx-1 w-4 h-6 sm:w-4 sm:h-6" />
                        {link}
                    </a>
                </div>
            ))}
        </div>
        </ AnimatedBorder>
    );
};

export default AdditionalLinks;