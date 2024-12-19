import { FC } from 'react';
import AdditionalLinks from './additionalLinks';

interface UserProfile {
    name: string;
    linkedIn: string;
    funFacts: string[];
    interests: string[];
    additionalLinks: string[];
}

interface ExtraInfoProps {
    userData: UserProfile;
}

const ExtraInfo: FC<ExtraInfoProps> = ({ userData }) => {
    return (
        <>
            {/* LinkedIn Section */}
            <div className="border border-white rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 flex justify-between items-center">
                <div className="flex items-center gap-2 sm:gap-3">
                    <img src="/assets/icons/linkedin_bp_user.svg" alt="linkedin-logo" className="w-8 h-8 sm:w-10 sm:h-10" />
                    <div className="flex flex-col">
                        <span className="text-xs sm:text-sm text-light-grey font-mono">LINKEDIN</span>
                        <span className="text-xs sm:text-sm font-sans truncate max-w-[150px] sm:max-w-none">
                            {userData.linkedIn}
                        </span>
                    </div>
                </div>
                <button className="border border-white rounded-3xl px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-sans text-white hover:bg-white/20 transition-colors">
                    VISIT PAGE ↗
                </button>
            </div>

            {/* Fun Facts and Interests Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                {/* Fun Facts */}
                <div className="border border-white rounded-lg p-3 sm:p-4">
                    <span className="text-xs sm:text-sm text-light-grey font-mono mb-2 sm:mb-3">
                        FUN FACTS ABOUT {userData.name.split(' ')[0].toUpperCase()}
                    </span>
                    <ul className="list-disc list-inside">
                        {userData.funFacts.map((fact, index) => (
                            <li key={index} className="text-xs sm:text-sm font-sans mb-1 sm:mb-2 line-clamp-2">
                                {fact}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Interests */}
                <div className="border border-white rounded-lg p-3 sm:p-4">
                    <span className="text-xs sm:text-sm text-light-grey font-mono mb-2 sm:mb-3">INTERESTS</span>
                    <ul className="list-disc list-inside">
                        {userData.interests.map((interest, index) => (
                            <li key={index} className="text-xs sm:text-sm font-sans mb-1 sm:mb-2 line-clamp-2">
                                {interest}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <AdditionalLinks userData={userData} />
        </>
    );
};

export default ExtraInfo;