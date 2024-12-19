import { FC } from 'react';

interface UserProfile {
    name: string;
    role: string;
    hobby: string;
    linkedIn: string;
    funFacts: string[];
    interests: string[];
    additionalLinks: string[];
    profilePicUrl: string;
    companyLogoUrl?: string;
    company?: string;
    major?: string;
    year?: string;
}

interface CompanyInfoProps {
    userData: UserProfile;
}


const CompanyInfo: FC<CompanyInfoProps> = ({ userData }) => {
    const placeholderLogo = "https://static.vecteezy.com/system/resources/previews/020/336/735/non_2x/tesla-logo-tesla-icon-transparent-png-free-vector.jpg";

    return (
        <div className="border border-white rounded-lg p-2 mb-3 sm:mb-4 py-6">
            <div className="flex justify-between items-start">
                {/* Logo and Info Section */}
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <img
                            src={placeholderLogo}
                            alt={`${userData.company}-logo`}
                            className="w-24 h-24 sm:w-48 sm:h-48 rounded-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-xs text-light-grey font-mono">COMPANY</span>
                                <span className="text-sm font-sans">
                                    {userData.name}
                                </span>
                            </div>
                            <div className="ml-4 sm:ml-6 md:ml-8">
                                <button className="border border-white rounded-3xl px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-sans text-white hover:bg-white/20 transition-colors">
                                    VISIT PAGE ↗
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-xs text-light-grey font-mono">ROLE</span>
                                <span className="text-sm font-sans">
                                    {userData.role}
                                </span>
                            </div>
                            <div className="flex flex-col items-end ml-4 sm:ml-6 md:ml-8">
                                <span className="text-xs text-light-grey font-mono">FAVOURITE HOBBY</span>
                                <span className="text-sm font-sans">
                                    {userData.hobby}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyInfo;