import { CompanionButton } from '../../ui/companion-button';
import { AnimatedBorder } from '../../ui/animated-border';
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

import { FC } from 'react';
import { UserProfile } from '@/types';


const CompanyInfo: FC<{ userData: UserProfile }> = ({ userData }) => {
    const visitPageLink = `/companion/profile/company/${userData.companyProfileID}`
    return (
        <AnimatedBorder className="w-full mb-3">
            <div className="rounded-lg py-6 pl-2">
                <div className="flex flex-col items-center justify-center">
                    {/* Logo and Info Section */}
                    <div className="flex flex-col xs:flex-row items-center gap-4">
                        <Avatar
                            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-baby-blue flex items-center justify-center text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-black`}
                        >
                            {userData.companyProfilePictureURL && (
                                <AvatarImage src={userData.companyProfilePictureURL} className="w-full h-full object-cover rounded-full" />
                            )}
                            <AvatarFallback>{userData?.company?.[0]?.toUpperCase()}</AvatarFallback> 
                        </Avatar>
                        <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-xs text-light-grey font-redhat">COMPANY</span>
                                    {userData.company && (
                                        <span className="text-sm font-satoshi">
                                            {userData.company}
                                        </span>
                                    )}
                                </div>
                                <div className="ml-4 sm:ml-6 md:ml-8 mr-3">
                                    <CompanionButton href={visitPageLink}>
                                        <span className="text-[12px] translate-y-[1px]">VISIT PAGE</span>
                                        <span className="text-lg translate-y-[-3px]">↗</span>
                                    </CompanionButton>
                                </div>
                            </div>
                            <div className="flex justify-between gap-8 items-center">
                                <div className="flex flex-col">
                                    <span className="text-xs text-light-grey font-mono">ROLE</span>
                                    {userData.role && (
                                        <span className="text-sm font-satoshi">
                                            {userData.role}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col ml-4 sm:ml-6 md:ml-8 mr-3">
                                    <span className="text-xs text-light-grey font-mono">PRONOUNS</span>
                                    {userData.pronouns && (
                                        <span className="text-sm font-satoshi">
                                            {userData.pronouns}
                                        </span>
                                    )}
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