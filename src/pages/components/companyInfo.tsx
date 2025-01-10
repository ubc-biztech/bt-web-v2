import { Router } from 'express';
import { useRouter } from 'next/router';
import { CompanionButton } from '../../components/ui/companion-button';
import { AnimatedBorder } from '../../components/ui/animated-border';


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
    const router = useRouter();
    const placeholderLogo = "https://static.vecteezy.com/system/resources/previews/020/336/735/non_2x/tesla-logo-tesla-icon-transparent-png-free-vector.jpg";
    const visitPageLink = `/company/${userData.company}`
    return (
        <AnimatedBorder className="w-full mb-3 sm:mb-3">
        <div className="border rounded-lg py-6">
            <div className="flex justify-between items-start">
                {/* Logo and Info Section */}
                <div className="flex items-start gap-2 sm:gap-4">
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
                                <span className="text-xs text-light-grey font-redhat">COMPANY</span>
                                <span className="text-sm font-sans">
                                    {userData.company}
                                </span>
                            </div>
                            <div className="ml-4 sm:ml-6 md:ml-8 mr-3">
                                <CompanionButton href={visitPageLink}>
                                    <span className="text-[12px] translate-y-[1px]">VISIT PAGE</span>
                                    <span className="text-lg translate-y-[-3px]">↗</span>
                                </CompanionButton>

                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-xs text-light-grey font-mono">ROLE</span>
                                <span className="text-sm font-sans">
                                    {userData.role}
                                </span>
                            </div>
                            <div className="flex flex-col items-end ml-4 sm:ml-6 md:ml-8 mr-3">
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
        </ AnimatedBorder>
    );
};

export default CompanyInfo;