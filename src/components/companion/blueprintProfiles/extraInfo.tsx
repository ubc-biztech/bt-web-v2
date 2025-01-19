import { FC } from 'react';
import AdditionalLinks from './additionalLinks';
import { CompanionButton } from '../../ui/companion-button';
import { AnimatedBorder } from '../../ui/animated-border';
import { UserProfile } from '@/types';
import ResponseSection from './responseSection';

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
                            <span className="text-xs sm:text-sm font-satoshi truncate max-w-[135px] xs:max-w-[180px] sm:max-w-none">
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

            {/* Interests */}
            {userData.interests && (
                <ResponseSection title="HOBBIES & INTERESTS" list={userData.interests} />
            )}

            {userData.responseList && userData.responseList[1] && (
                <ResponseSection title="IF I WAS STRANDED ON AN ISLAND, THE TECH FIGURE I WOULD WANT TO BE STRANDED WITH WOULD BE..." text={userData.responseList[1]} />
            )}

            {userData.responseList && userData.responseList[2] && (
                <ResponseSection title="IF I COULD PRESENT ONE EARTHLY INVENTION TO AN ALIEN, I WOULD PRESENT..." text={userData.responseList[2]} />
            )}

            <AdditionalLinks userData={userData} />
        </>
    );
};

export default ExtraInfo;