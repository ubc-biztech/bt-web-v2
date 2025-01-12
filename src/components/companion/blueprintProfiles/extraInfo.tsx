import { FC } from 'react';
import AdditionalLinks from './additionalLinks';
import { CompanionButton } from '../../ui/companion-button';
import { AnimatedBorder } from '../../ui/animated-border';
import { UserProfile } from '@/types';

const ExtraInfo: FC<{ userData: UserProfile }> = ({ userData }) => {

    const handleVisitPage = () => {
        if (typeof window !== 'undefined') {
            // Normalize the LinkedIn URL
            let linkedInUrl = userData.linkedIn.trim();
    
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
            <AnimatedBorder className="w-ful mb-3 sm:mb-4">
                <div className="rounded-lg p-1 sm:p-4 flex justify-between items-center">
                    <div className="w-full flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
                        <img src="/assets/icons/linkedin_bp_user.svg" alt="linkedin-logo" className="w-8 h-8 sm:w-10 sm:h-10" />
                        <div className="flex flex-col">
                            <span className="text-xs sm:text-sm text-light-grey font-redhat">LINKEDIN</span>
                            <span className="text-xs sm:text-sm font-satoshi truncate max-w-[135px] xs:max-w-[170px]">
                                {userData.linkedIn}
                            </span>
                        </div>
                    </div>
                    <div className='px-4 py-2'>
                        <CompanionButton onClick={handleVisitPage}>
                            <span className="text-[12px] translate-y-[1px] hidden mxs:inline">VISIT PAGE</span>
                            <span className="text-lg translate-y-[-3px]">↗</span>
                        </CompanionButton>
                    </div>
                </div>
            </ AnimatedBorder>

            {/* Fun Facts and Interests Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Fun Facts */}
                <AnimatedBorder className="w-full mb-3 sm:mb-4" innerClassName='h-full w-full'>
                    <div className="relative rounded-lg p-3 sm:p-4">
                        <span className="text-xs sm:text-sm text-light-grey font-redhat mb-2 sm:mb-3">
                            FUN FACTS ABOUT {userData.name.split(' ')[0].toUpperCase()}
                        </span>
                        <ul className="list-inside">
                            {userData.funFacts.map((fact, index) => (
                                <li key={index} className="text-xs sm:text-sm font-satoshi mb-1 sm:mb-2">
                                    {fact}
                                </li>
                            ))}
                        </ul>
                    </div>
                </AnimatedBorder>

                {/* Interests */}
                <AnimatedBorder className="w-full mb-3 sm:mb-4" innerClassName='h-full w-full'>
                    <div className="rounded-lg p-3 sm:p-4">
                        <span className="text-xs sm:text-sm text-light-grey font-redhat mb-2 sm:mb-3">INTERESTS</span>
                        <ul className="list-inside">
                            {userData.interests.map((interest, index) => (
                                <li key={index} className="text-xs sm:text-sm font-satoshi mb-1 sm:mb-2">
                                    {interest}
                                </li>
                            ))}
                        </ul>
                    </div>
                </AnimatedBorder>
            </div>

            <AdditionalLinks userData={userData} />
        </>
    );
};

export default ExtraInfo;